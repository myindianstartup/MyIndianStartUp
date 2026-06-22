import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { supabaseAdmin } from '../lib/supabase.js';
import { env } from '../config/env.js';
import { writeAuditLog } from './auditService.js';

export const MEMBERSHIP_PRICE = 999;

const isMissingDatabaseFeature = (error) => {
  const message = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return [
    '42p01',
    '42703',
    'pgrst106',
    'does not exist',
    'could not find',
    'schema must be one of'
  ].some((pattern) => message.includes(pattern));
};

const isHiddenSchemaError = (error) => (
  error?.code === 'PGRST106'
  || `${error?.message || ''}`.toLowerCase().includes('invalid schema')
);

let razorpayClient = null;

const hasRazorpayCredentials = () => Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

const getRazorpayClient = () => {
  if (!hasRazorpayCredentials()) {
    const error = new Error('Razorpay is not configured on the server yet. Please add backend Razorpay key ID and key secret.');
    error.status = 503;
    throw error;
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET
    });
  }

  return razorpayClient;
};

const fallbackPlans = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    code: 'BUSINESSVERSE_ANNUAL',
    name: 'BusinessVerse Annual Membership',
    description: 'Business listing, daily visibility, creator discovery, and direct collaboration.',
    account_type: 'business',
    amount_inr: MEMBERSHIP_PRICE,
    duration_days: 365,
    features: ['Business listing', 'Daily posts', 'Creator discovery', 'Direct collaboration', 'PAN India visibility'],
    is_active: true,
    sort_order: 1,
    setup_required: true
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    code: 'CREATORVERSE_ANNUAL',
    name: 'CreatorVerse Annual Membership',
    description: 'Creator listing, portfolio visibility, business discovery, and direct collaboration.',
    account_type: 'creator',
    amount_inr: MEMBERSHIP_PRICE,
    duration_days: 365,
    features: ['Creator listing', 'Portfolio visibility', 'Business discovery', 'Direct collaboration', 'PAN India visibility'],
    is_active: true,
    sort_order: 2,
    setup_required: true
  }
];

const getFallbackPlan = (planIdOrCode) => fallbackPlans.find((plan) => (
  plan.id === planIdOrCode || plan.code === planIdOrCode
));

const getPlan = async (planIdOrCode) => {
  const { data: allPlans, error } = await supabaseAdmin.rpc('billing_list_plans');
  if (error) {
    if (isMissingDatabaseFeature(error)) return getFallbackPlan(planIdOrCode);
    throw error;
  }
  const plans = allPlans || [];
  const isUuid = /^[0-9a-f-]{36}$/i.test(planIdOrCode);
  return plans.find((p) => (isUuid ? p.id === planIdOrCode : p.code === planIdOrCode) && p.is_active && !p.deleted_at)
    || getFallbackPlan(planIdOrCode);
};

export const listActivePlans = async () => {
  const { data, error } = await supabaseAdmin.rpc('billing_list_plans');
  if (error) {
    if (isMissingDatabaseFeature(error)) return fallbackPlans;
    throw error;
  }
  return (data || []).filter((p) => p.is_active && !p.deleted_at);
};

export const validateCoupon = async ({ code, planId, userId }) => {
  const { data: result, error } = await supabaseAdmin.rpc('billing_validate_coupon', {
    p_code: code || null,
    p_plan_id: planId,
    p_user_id: userId || null
  });

  if (error) {
    if (isMissingDatabaseFeature(error)) {
      const plan = await getPlan(planId);
      if (!plan) {
        const missingPlanError = new Error('Selected plan is not available.');
        missingPlanError.status = 404;
        throw missingPlanError;
      }
      return { valid: true, plan, coupon: null, discountAmountInr: 0, finalAmountInr: plan.amount_inr, reason: null };
    }
    throw error;
  }

  return result;
};

const isFullDiscountCoupon = (quote) => (
  quote?.valid
  && quote?.coupon
  && quote.coupon.discount_type === 'percentage'
  && Number(quote.coupon.discount_value) === 100
  && Number(quote.finalAmountInr) === 0
);

export const syncMemberSubscription = async ({ userId, status, startedAt, expiresAt }) => {
  const { data, error } = await supabaseAdmin
    .schema('core')
    .from('members')
    .update({
      subscription_status: status,
      subscription_started_at: startedAt,
      subscription_expires_at: expiresAt,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select('id, subscription_status, subscription_started_at, subscription_expires_at')
    .single();

  if (error) throw error;
  return data;
};

export const assignPlanToUser = async ({
  userId,
  planId,
  actorId = null,
  actorRole = null,
  eventType = 'assigned',
  freeAccess = false,
  source = 'admin',
  extendFromCurrent = false,
  metadata = {}
}) => {
  const { data: result, error } = await supabaseAdmin.rpc('billing_assign_plan', {
    p_user_id: userId,
    p_plan_id: planId,
    p_free_access: freeAccess,
    p_source: source,
    p_event_type: eventType,
    p_extend_from_current: extendFromCurrent,
    p_metadata: metadata
  });

  if (error) throw error;

  await writeAuditLog({
    actorId,
    actorRole,
    action: `billing.subscription.${eventType}`,
    entityType: 'billing.subscriptions',
    entityId: result?.subscription?.id,
    metadata: { userId, planId, freeAccess, source }
  });

  return result;
};

const recordCouponRedemption = async ({ couponId, userId, planId, discountAmountInr }) => {
  const { error } = await supabaseAdmin.rpc('billing_record_coupon_redemption', {
    p_coupon_id: couponId,
    p_user_id: userId,
    p_plan_id: planId,
    p_discount_amount: discountAmountInr
  });

  if (!error) return;

  const { error: insertError } = await supabaseAdmin
    .schema('billing')
    .from('coupon_redemptions')
    .insert({
      coupon_id: couponId,
      user_id: userId,
      plan_id: planId,
      discount_amount_inr: discountAmountInr
    });

  if (insertError) throw insertError;
};

const createBillingOrderRecord = async ({
  userId,
  planId,
  couponId,
  baseAmountInr,
  discountAmountInr,
  finalAmountInr,
  providerOrderId,
  invoiceNumber,
  metadata = {}
}) => {
  const orderPayload = {
    user_id: userId,
    plan_id: planId,
    coupon_id: couponId || null,
    base_amount_inr: baseAmountInr,
    discount_amount_inr: discountAmountInr,
    final_amount_inr: finalAmountInr,
    status: finalAmountInr === 0 ? 'paid' : 'created',
    provider: 'razorpay',
    provider_order_id: providerOrderId,
    metadata
  };

  const { data: order, error: orderError } = await supabaseAdmin
    .schema('billing')
    .from('orders')
    .insert(orderPayload)
    .select('*')
    .single();

  if (orderError) throw orderError;

  const invoicePayload = {
    invoice_number: invoiceNumber,
    order_id: order.id,
    user_id: userId,
    subtotal_inr: baseAmountInr,
    discount_inr: discountAmountInr,
    total_inr: finalAmountInr,
    status: order.status,
    metadata
  };

  const { error: invoiceError } = await supabaseAdmin
    .schema('billing')
    .from('invoices')
    .insert(invoicePayload);

  if (invoiceError) throw invoiceError;

  return order;
};

const activatePlanDirectly = async ({
  userId,
  plan,
  freeAccess,
  source,
  eventType,
  metadata
}) => {
  const now = new Date();
  const startsAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + Number(plan.duration_days || 365) * 24 * 60 * 60 * 1000).toISOString();

  const { data: currentSubscriptions, error: currentError } = await supabaseAdmin
    .schema('billing')
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('expires_at', { ascending: false, nullsFirst: false })
    .limit(1);

  if (currentError) throw currentError;

  const current = currentSubscriptions?.[0] || null;
  if (current) {
    const { error: cancelError } = await supabaseAdmin
      .schema('billing')
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: startsAt,
        updated_at: startsAt
      })
      .eq('id', current.id);

    if (cancelError) throw cancelError;
  }

  const { data: subscription, error: subscriptionError } = await supabaseAdmin
    .schema('billing')
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: plan.id,
      status: 'active',
      started_at: startsAt,
      expires_at: expiresAt,
      free_access: freeAccess,
      source,
      metadata
    })
    .select('*')
    .single();

  if (subscriptionError) throw subscriptionError;

  await syncMemberSubscription({
    userId,
    status: 'active',
    startedAt: startsAt,
    expiresAt
  });

  const eventPayload = {
    subscription_id: subscription.id,
    user_id: userId,
    event_type: eventType,
    from_plan_id: current?.plan_id || null,
    to_plan_id: plan.id,
    from_status: current?.status || null,
    to_status: 'active',
    metadata
  };

  const { error: eventError } = await supabaseAdmin
    .schema('billing')
    .from('subscription_events')
    .insert(eventPayload);

  if (eventError && eventType !== 'assigned') {
    await supabaseAdmin
      .schema('billing')
      .from('subscription_events')
      .insert({ ...eventPayload, event_type: 'assigned' });
  }

  return { subscription, plan };
};

const activateFullDiscountSubscription = async ({ userId, quote, order }) => {
  const metadata = {
    orderId: order?.id,
    couponId: quote.coupon.id,
    couponCode: quote.coupon.code,
    discountPercent: quote.coupon.discount_value
  };

  try {
    return await assignPlanToUser({
      userId,
      planId: quote.plan.id,
      eventType: 'free_access',
      freeAccess: true,
      source: 'coupon',
      metadata
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('billing_assign_plan failed, using direct activation fallback:', error.message);
    }

    return activatePlanDirectly({
      userId,
      plan: quote.plan,
      freeAccess: true,
      source: 'coupon',
      eventType: 'free_access',
      metadata
    });
  }
};

export const cancelSubscription = async ({ userId, actorId, actorRole, metadata = {} }) => {
  const { data: subscription, error } = await supabaseAdmin.rpc('billing_cancel_subscription', {
    p_user_id: userId,
    p_metadata: JSON.stringify(metadata)
  });

  if (error) throw error;

  await writeAuditLog({
    actorId,
    actorRole,
    action: 'billing.subscription.cancelled',
    entityType: 'core.members',
    entityId: userId,
    metadata
  });

  return subscription;
};

export const verifyRazorpayPaymentSignature = ({ providerOrderId, providerPaymentId, providerSignature }) => {
  if (!env.RAZORPAY_KEY_SECRET) {
    const error = new Error('Razorpay verification is not configured on the server.');
    error.status = 503;
    throw error;
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${providerOrderId}|${providerPaymentId}`)
    .digest('hex');

  return expectedSignature === providerSignature;
};

const findExistingTransaction = async ({ providerPaymentId, providerOrderId }) => {
  if (!providerPaymentId && !providerOrderId) return null;

  let query = supabaseAdmin
    .schema('billing')
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (providerPaymentId && providerOrderId) {
    query = query.or(`provider_payment_id.eq.${providerPaymentId},provider_order_id.eq.${providerOrderId}`);
  } else if (providerPaymentId) {
    query = query.eq('provider_payment_id', providerPaymentId);
  } else {
    query = query.eq('provider_order_id', providerOrderId);
  }

  const { data, error } = await query.maybeSingle();
  if (error && !isHiddenSchemaError(error)) throw error;
  return data || null;
};

export const finalizeRazorpayOrder = async ({
  providerOrderId,
  providerPaymentId = null,
  providerSignature = null,
  status = 'paid',
  paymentPayload = {},
  failureReason = null
}) => {
  const normalizedStatus = status === 'paid' ? 'paid' : status === 'failed' ? 'failed' : 'pending';
  const { data: order, error: orderError } = await supabaseAdmin
    .schema('billing')
    .from('orders')
    .select('*')
    .eq('provider_order_id', providerOrderId)
    .maybeSingle();

  if (orderError) throw orderError;
  if (!order) {
    const missingOrderError = new Error('Checkout order was not found.');
    missingOrderError.status = 404;
    throw missingOrderError;
  }

  const wasPaidAlready = order.status === 'paid';
  const nextStatus = wasPaidAlready && normalizedStatus !== 'paid' ? 'paid' : normalizedStatus;
  const mergedOrderMetadata = {
    ...(order.metadata || {}),
    razorpay: {
      ...(order.metadata?.razorpay || {}),
      lastStatus: nextStatus,
      providerPaymentId: providerPaymentId || order.metadata?.razorpay?.providerPaymentId || null,
      providerSignature: providerSignature || order.metadata?.razorpay?.providerSignature || null,
      failureReason: failureReason || order.metadata?.razorpay?.failureReason || null,
      updatedAt: new Date().toISOString(),
      payload: paymentPayload
    }
  };

  const { error: updateOrderError } = await supabaseAdmin
    .schema('billing')
    .from('orders')
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
      metadata: mergedOrderMetadata
    })
    .eq('id', order.id);

  if (updateOrderError) throw updateOrderError;

  const existingTransaction = await findExistingTransaction({ providerPaymentId, providerOrderId });
  const transactionPayload = {
    order_id: order.id,
    user_id: order.user_id,
    provider: 'razorpay',
    provider_payment_id: providerPaymentId,
    provider_order_id: providerOrderId,
    provider_signature: providerSignature,
    amount_inr: order.final_amount_inr,
    status: nextStatus,
    failure_reason: failureReason,
    metadata: paymentPayload,
    updated_at: new Date().toISOString()
  };

  if (existingTransaction) {
    const { error: transactionUpdateError } = await supabaseAdmin
      .schema('billing')
      .from('transactions')
      .update(transactionPayload)
      .eq('id', existingTransaction.id);

    if (transactionUpdateError) throw transactionUpdateError;
  } else {
    const { error: transactionInsertError } = await supabaseAdmin
      .schema('billing')
      .from('transactions')
      .insert(transactionPayload);

    if (transactionInsertError) throw transactionInsertError;
  }

  const { error: invoiceError } = await supabaseAdmin
    .schema('billing')
    .from('invoices')
    .update({
      status: nextStatus,
      paid_at: nextStatus === 'paid' ? new Date().toISOString() : null,
      metadata: paymentPayload
    })
    .eq('order_id', order.id);

  if (invoiceError) throw invoiceError;

  if (nextStatus === 'paid' && !wasPaidAlready) {
    if (order.coupon_id && Number(order.discount_amount_inr || 0) > 0) {
      await recordCouponRedemption({
        couponId: order.coupon_id,
        userId: order.user_id,
        planId: order.plan_id,
        discountAmountInr: order.discount_amount_inr
      });
    }

    await assignPlanToUser({
      userId: order.user_id,
      planId: order.plan_id,
      eventType: 'payment_activated',
      source: 'razorpay',
      metadata: { orderId: order.id, providerOrderId, providerPaymentId }
    });
  }

  return {
    order: {
      ...order,
      status: nextStatus,
      metadata: mergedOrderMetadata
    },
    activated: nextStatus === 'paid' && !wasPaidAlready
  };
};

export const createCheckoutOrder = async ({ userId, planId, couponCode = null }) => {
  const quote = await validateCoupon({ code: couponCode, planId, userId });
  if (!quote.valid) {
    const invalidCouponError = new Error(quote.reason || 'Coupon is not valid.');
    invalidCouponError.status = 400;
    invalidCouponError.quote = quote;
    throw invalidCouponError;
  }

  const fullDiscountCoupon = isFullDiscountCoupon(quote);
  if (Number(quote.finalAmountInr) === 0 && !fullDiscountCoupon) {
    const freeCheckoutError = new Error('Free checkout is allowed only with a valid 100% percentage coupon.');
    freeCheckoutError.status = 400;
    freeCheckoutError.quote = quote;
    throw freeCheckoutError;
  }

  if (fullDiscountCoupon) {
    await recordCouponRedemption({
      couponId: quote.coupon.id,
      userId,
      planId: quote.plan.id,
      discountAmountInr: quote.discountAmountInr
    });

    const syntheticOrder = {
      id: `coupon_${crypto.randomUUID()}`,
      user_id: userId,
      plan_id: quote.plan.id,
      coupon_id: quote.coupon.id,
      base_amount_inr: quote.plan.amount_inr,
      discount_amount_inr: quote.discountAmountInr,
      final_amount_inr: 0,
      status: 'paid',
      provider: 'coupon',
      provider_order_id: null,
      metadata: {
        architectureReady: true,
        checkoutMode: 'full_discount_coupon',
        couponCode: quote.coupon.code
      },
      created_at: new Date().toISOString()
    };

    const activation = await activateFullDiscountSubscription({
      userId,
      quote,
      order: syntheticOrder
    });

    return {
      order: syntheticOrder,
      quote,
      freeCheckout: true,
      subscription: activation.subscription
    };
  }

  const razorpay = getRazorpayClient();
  const invoiceNumber = `MIS-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`;
  const razorpayOrder = await razorpay.orders.create({
    amount: Number(quote.finalAmountInr) * 100,
    currency: 'INR',
    receipt: invoiceNumber,
    notes: {
      userId,
      planId: quote.plan.id,
      couponCode: quote.coupon?.code || ''
    }
  });

  const orderMetadata = {
    architectureReady: true,
    razorpay: {
      orderId: razorpayOrder.id,
      amountInPaise: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      status: razorpayOrder.status
    }
  };

  const order = await createBillingOrderRecord({
    userId,
    planId: quote.plan.id,
    couponId: quote.coupon?.id || null,
    baseAmountInr: quote.plan.amount_inr,
    discountAmountInr: quote.discountAmountInr,
    finalAmountInr: quote.finalAmountInr,
    providerOrderId: razorpayOrder.id,
    invoiceNumber,
    metadata: orderMetadata
  });

  return {
    order: {
      ...order,
      provider_order_id: razorpayOrder.id,
      metadata: orderMetadata
    },
    quote,
    freeCheckout: false,
    subscription: null
  };
};
