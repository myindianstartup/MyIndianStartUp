import crypto from 'node:crypto';
import { supabaseAdmin } from '../lib/supabase.js';
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
      // Fallback: no coupon validation, just return plan
      const plan = await getPlan(planId);
      if (!plan) {
        const err = new Error('Selected plan is not available.');
        err.status = 404;
        throw err;
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

export const createCheckoutOrder = async ({ userId, planId, couponCode = null }) => {
  const quote = await validateCoupon({ code: couponCode, planId, userId });
  if (!quote.valid) {
    const error = new Error(quote.reason || 'Coupon is not valid.');
    error.status = 400;
    error.quote = quote;
    throw error;
  }

  const fullDiscountCoupon = isFullDiscountCoupon(quote);
  if (Number(quote.finalAmountInr) === 0 && !fullDiscountCoupon) {
    const error = new Error('Free checkout is allowed only with a valid 100% percentage coupon.');
    error.status = 400;
    error.quote = quote;
    throw error;
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

  const providerOrderId = `rzp_ready_${crypto.randomUUID()}`;
  const invoiceNumber = `MIS-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`;

  const { data: order, error } = await supabaseAdmin.rpc('billing_create_order', {
    p_user_id: userId,
    p_plan_id: quote.plan.id,
    p_coupon_id: quote.coupon?.id || null,
    p_base_amount: quote.plan.amount_inr,
    p_discount_amount: quote.discountAmountInr,
    p_final_amount: quote.finalAmountInr,
    p_provider_order_id: providerOrderId,
    p_invoice_number: invoiceNumber
  });

  if (error) throw error;

  if (quote.coupon) {
    await recordCouponRedemption({
      couponId: quote.coupon.id,
      userId,
      planId: quote.plan.id,
      discountAmountInr: quote.discountAmountInr
    });
  }

  return {
    order,
    quote,
    freeCheckout: false,
    subscription: null
  };
};
