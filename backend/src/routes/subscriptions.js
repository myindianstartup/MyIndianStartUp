import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { assignPlanToUser, createCheckoutOrder, listActivePlans, validateCoupon } from '../services/billingService.js';
import { writeAuditLog } from '../services/auditService.js';

export const subscriptionsRouter = Router();

const isHiddenSchemaError = (error) => (
  error?.code === 'PGRST106'
  || `${error?.message || ''}`.toLowerCase().includes('invalid schema')
);

const couponValidationSchema = z.object({
  planId: z.string().uuid(),
  couponCode: z.string().trim().optional().nullable()
});

const checkoutSchema = couponValidationSchema.extend({
  billingInfo: z.object({
    fullName: z.string().trim().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().trim().optional(),
    gstNumber: z.string().trim().optional(),
    address: z.string().trim().optional()
  }).optional().default({})
});

subscriptionsRouter.get('/plans', async (req, res, next) => {
  try {
    const plans = await listActivePlans();
    res.json({ plans });
  } catch (error) {
    next(error);
  }
});

subscriptionsRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [
      memberResult,
      subscriptionResult,
      ordersResult,
      invoicesResult
    ] = await Promise.all([
      supabaseAdmin.schema('core').from('members').select('subscription_status, subscription_started_at, subscription_expires_at').eq('id', req.user.id).maybeSingle(),
      supabaseAdmin.schema('billing').from('subscriptions').select('*, plans(name, code, amount_inr, duration_days)').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabaseAdmin.schema('billing').from('orders').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.schema('billing').from('invoices').select('*').eq('user_id', req.user.id).order('issued_at', { ascending: false }).limit(10)
    ]);

    const { data: member, error: memberError } = memberResult;
    const subscription = isHiddenSchemaError(subscriptionResult.error) ? null : subscriptionResult.data;
    const orders = isHiddenSchemaError(ordersResult.error) ? [] : ordersResult.data;
    const invoices = isHiddenSchemaError(invoicesResult.error) ? [] : invoicesResult.data;
    const subscriptionError = isHiddenSchemaError(subscriptionResult.error) ? null : subscriptionResult.error;
    const ordersError = isHiddenSchemaError(ordersResult.error) ? null : ordersResult.error;
    const invoicesError = isHiddenSchemaError(invoicesResult.error) ? null : invoicesResult.error;

    if (memberError) throw memberError;
    if (subscriptionError) throw subscriptionError;
    if (ordersError) throw ordersError;
    if (invoicesError) throw invoicesError;

    res.json({ subscription: member, billingSubscription: subscription, orders: orders || [], invoices: invoices || [] });
  } catch (error) {
    next(error);
  }
});

subscriptionsRouter.post('/validate-coupon', async (req, res, next) => {
  try {
    const payload = couponValidationSchema.parse(req.body);
    const quote = await validateCoupon({
      code: payload.couponCode,
      planId: payload.planId,
      userId: req.user?.id || null
    });

    res.json({ quote });
  } catch (error) {
    next(error);
  }
});

subscriptionsRouter.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    const payload = checkoutSchema.parse(req.body);
    const checkout = await createCheckoutOrder({
      userId: req.user.id,
      planId: payload.planId,
      couponCode: payload.couponCode
    });

    if (!checkout.freeCheckout) {
      const { error: metadataError } = await supabaseAdmin
        .schema('billing')
        .from('orders')
        .update({
          metadata: {
            ...(checkout.order.metadata || {}),
            billingInfo: payload.billingInfo,
            architectureReady: true
          }
        })
        .eq('id', checkout.order.id);

      if (metadataError && !isHiddenSchemaError(metadataError)) {
        throw metadataError;
      }
    }

    res.status(201).json({
      ...checkout,
      razorpay: checkout.freeCheckout
        ? {
            ready: false,
            skipped: true,
            reason: 'FULL_DISCOUNT_COUPON'
          }
        : {
            ready: true,
            skipped: false,
            providerOrderId: checkout.order.provider_order_id,
            amountInPaise: checkout.order.final_amount_inr * 100,
            currency: 'INR'
          }
    });
  } catch (error) {
    next(error);
  }
});

subscriptionsRouter.post('/razorpay/webhook', async (req, res, next) => {
  try {
    const event = req.body || {};
    const providerOrderId = event.payload?.payment?.entity?.order_id || event.payload?.order?.entity?.id || null;
    const providerPaymentId = event.payload?.payment?.entity?.id || null;
    const status = event.event === 'payment.captured' ? 'paid' : event.event === 'payment.failed' ? 'failed' : 'pending';

    if (providerOrderId) {
      const { data: order, error: orderError } = await supabaseAdmin
        .schema('billing')
        .from('orders')
        .update({ status, updated_at: new Date().toISOString(), metadata: event })
        .eq('provider_order_id', providerOrderId)
        .select('*')
        .maybeSingle();

      if (orderError) throw orderError;

      if (order) {
        await supabaseAdmin.schema('billing').from('transactions').insert({
          order_id: order.id,
          user_id: order.user_id,
          provider_payment_id: providerPaymentId,
          provider_order_id: providerOrderId,
          amount_inr: order.final_amount_inr,
          status,
          metadata: event
        });

        await supabaseAdmin.schema('billing').from('invoices').update({
          status,
          paid_at: status === 'paid' ? new Date().toISOString() : null
        }).eq('order_id', order.id);

        if (status === 'paid') {
          await assignPlanToUser({
            userId: order.user_id,
            planId: order.plan_id,
            eventType: 'payment_activated',
            source: 'razorpay',
            metadata: { orderId: order.id, providerOrderId, providerPaymentId }
          });
        }
      }
    }

    await writeAuditLog({
      action: `billing.razorpay.webhook.${event.event || 'received'}`,
      entityType: 'billing.orders',
      entityId: providerOrderId,
      metadata: event
    });

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

subscriptionsRouter.post('/activate-demo', requireAuth, async (req, res, next) => {
  try {
    const { data: member, error: memberError } = await supabaseAdmin
      .schema('core')
      .from('members')
      .select('account_type')
      .eq('id', req.user.id)
      .single();

    if (memberError) throw memberError;

    const plans = await listActivePlans();
    const plan = plans.find((item) => item.account_type === member.account_type) || plans[0];
    const result = await assignPlanToUser({
      userId: req.user.id,
      planId: plan.id,
      eventType: 'free_access',
      freeAccess: true,
      source: 'demo',
      metadata: { reason: 'Demo activation' }
    });

    res.json({ subscription: result.subscription });
  } catch (error) {
    next(error);
  }
});
