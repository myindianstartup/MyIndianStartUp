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
  let query = supabaseAdmin
    .schema('billing')
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .limit(1);

  query = /^[0-9a-f-]{36}$/i.test(planIdOrCode)
    ? query.eq('id', planIdOrCode)
    : query.eq('code', planIdOrCode);

  const { data, error } = await query.maybeSingle();
  if (error) {
    if (isMissingDatabaseFeature(error)) return getFallbackPlan(planIdOrCode);
    throw error;
  }
  return data;
};

export const listActivePlans = async () => {
  const { data, error } = await supabaseAdmin
    .schema('billing')
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) {
    if (isMissingDatabaseFeature(error)) return fallbackPlans;
    throw error;
  }
  return data || [];
};

export const validateCoupon = async ({ code, planId, userId }) => {
  const plan = await getPlan(planId);
  if (!plan) {
    const error = new Error('Selected plan is not available.');
    error.status = 404;
    throw error;
  }

  const invalid = (reason, couponObj = null) => ({
    valid: false,
    plan,
    coupon: couponObj,
    discountAmountInr: 0,
    finalAmountInr: plan.amount_inr,
    reason
  });

  if (!code?.trim()) {
    return {
      valid: true,
      plan,
      coupon: null,
      discountAmountInr: 0,
      finalAmountInr: plan.amount_inr,
      reason: null
    };
  }

  const normalizedCode = code.trim().toUpperCase();
  const { data: coupon, error } = await supabaseAdmin
    .schema('billing')
    .from('coupons')
    .select('*')
    .eq('code', normalizedCode)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    if (isMissingDatabaseFeature(error)) return invalid('Coupon system is not configured yet.');
    throw error;
  }

  if (!coupon) return invalid('Coupon code does not exist.');
  if (!coupon.is_active) return invalid('Coupon is inactive.', coupon);

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) return invalid('Coupon is not active yet.', coupon);
  if (coupon.ends_at && new Date(coupon.ends_at) < now) return invalid('Coupon has expired.', coupon);
  if (coupon.applicable_plan_ids?.length && !coupon.applicable_plan_ids.includes(plan.id)) {
    return invalid('Coupon is not applicable to this plan.', coupon);
  }
  if (coupon.user_ids?.length) {
    if (!userId) {
      return invalid('Coupon is only valid for targeted registered users.', coupon);
    }
    if (!coupon.user_ids.includes(userId)) {
      return invalid('Coupon is not assigned to this user.', coupon);
    }
  }

  const [
    { count: totalUses, error: totalUsesError },
    { count: userUses, error: userUsesError }
  ] = await Promise.all([
    supabaseAdmin.schema('billing').from('coupon_redemptions').select('*', { count: 'exact', head: true }).eq('coupon_id', coupon.id),
    userId
      ? supabaseAdmin.schema('billing').from('coupon_redemptions').select('*', { count: 'exact', head: true }).eq('coupon_id', coupon.id).eq('user_id', userId)
      : Promise.resolve({ count: 0, error: null })
  ]);

  if (totalUsesError) {
    if (isMissingDatabaseFeature(totalUsesError)) return invalid('Coupon usage tracking is not configured yet.', coupon);
    throw totalUsesError;
  }
  if (userUsesError) {
    if (isMissingDatabaseFeature(userUsesError)) return invalid('Coupon usage tracking is not configured yet.', coupon);
    throw userUsesError;
  }

  if (coupon.usage_limit !== null && totalUses >= coupon.usage_limit) return invalid('Coupon usage limit reached.', coupon);
  if (userId && coupon.per_user_limit !== null && userUses >= coupon.per_user_limit) return invalid('Coupon already used by this user.', coupon);

  const discountAmountInr = coupon.discount_type === 'percentage'
    ? Math.min(plan.amount_inr, Math.round(plan.amount_inr * (coupon.discount_value / 100)))
    : Math.min(plan.amount_inr, coupon.discount_value);

  return {
    valid: true,
    plan,
    coupon,
    discountAmountInr,
    finalAmountInr: Math.max(0, plan.amount_inr - discountAmountInr),
    reason: null
  };
};

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
  const plan = await getPlan(planId);
  if (!plan) {
    const error = new Error('Plan not found.');
    error.status = 404;
    throw error;
  }

  const { data: currentSubscription, error: currentError } = await supabaseAdmin
    .schema('billing')
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('expires_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (currentError) throw currentError;

  const now = new Date();
  const startsAt = extendFromCurrent && currentSubscription?.expires_at && new Date(currentSubscription.expires_at) > now
    ? new Date(currentSubscription.expires_at)
    : now;
  const expiresAt = new Date(startsAt);
  expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

  if (currentSubscription && !extendFromCurrent) {
    await supabaseAdmin
      .schema('billing')
      .from('subscriptions')
      .update({ status: 'cancelled', cancelled_at: now.toISOString(), updated_at: now.toISOString() })
      .eq('id', currentSubscription.id);
  }

  const { data: subscription, error } = await supabaseAdmin
    .schema('billing')
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: plan.id,
      status: 'active',
      started_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      free_access: freeAccess,
      source,
      metadata
    })
    .select('*')
    .single();

  if (error) throw error;

  await syncMemberSubscription({
    userId,
    status: 'active',
    startedAt: startsAt.toISOString(),
    expiresAt: expiresAt.toISOString()
  });

  await supabaseAdmin
    .schema('billing')
    .from('subscription_events')
    .insert({
      subscription_id: subscription.id,
      user_id: userId,
      actor_id: actorId,
      event_type: eventType,
      from_plan_id: currentSubscription?.plan_id || null,
      to_plan_id: plan.id,
      from_status: currentSubscription?.status || null,
      to_status: 'active',
      metadata
    });

  await writeAuditLog({
    actorId,
    actorRole,
    action: `billing.subscription.${eventType}`,
    entityType: 'billing.subscriptions',
    entityId: subscription.id,
    metadata: { userId, planId: plan.id, freeAccess, source }
  });

  return { subscription, plan };
};

export const cancelSubscription = async ({ userId, actorId, actorRole, metadata = {} }) => {
  const now = new Date().toISOString();
  const { data: subscription, error } = await supabaseAdmin
    .schema('billing')
    .from('subscriptions')
    .update({ status: 'cancelled', cancelled_at: now, updated_at: now })
    .eq('user_id', userId)
    .eq('status', 'active')
    .select('*')
    .maybeSingle();

  if (error) throw error;

  await syncMemberSubscription({
    userId,
    status: 'cancelled',
    startedAt: subscription?.started_at || null,
    expiresAt: subscription?.expires_at || null
  });

  if (subscription) {
    await supabaseAdmin.schema('billing').from('subscription_events').insert({
      subscription_id: subscription.id,
      user_id: userId,
      actor_id: actorId,
      event_type: 'cancelled',
      from_plan_id: subscription.plan_id,
      from_status: 'active',
      to_status: 'cancelled',
      metadata
    });
  }

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

  const providerOrderId = `rzp_ready_${crypto.randomUUID()}`;
  const { data: order, error } = await supabaseAdmin
    .schema('billing')
    .from('orders')
    .insert({
      user_id: userId,
      plan_id: quote.plan.id,
      coupon_id: quote.coupon?.id || null,
      base_amount_inr: quote.plan.amount_inr,
      discount_amount_inr: quote.discountAmountInr,
      final_amount_inr: quote.finalAmountInr,
      status: quote.finalAmountInr === 0 ? 'paid' : 'created',
      provider: 'razorpay',
      provider_order_id: providerOrderId,
      metadata: { architectureReady: true }
    })
    .select('*')
    .single();

  if (error) throw error;

  const invoiceNumber = `MIS-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`;
  await supabaseAdmin.schema('billing').from('invoices').insert({
    invoice_number: invoiceNumber,
    order_id: order.id,
    user_id: userId,
    subtotal_inr: quote.plan.amount_inr,
    discount_inr: quote.discountAmountInr,
    total_inr: quote.finalAmountInr,
    status: order.status
  });

  if (quote.coupon) {
    await supabaseAdmin.schema('billing').from('coupon_redemptions').insert({
      coupon_id: quote.coupon.id,
      user_id: userId,
      plan_id: quote.plan.id,
      discount_amount_inr: quote.discountAmountInr
    });
  }

  if (quote.finalAmountInr === 0) {
    await assignPlanToUser({
      userId,
      planId: quote.plan.id,
      eventType: 'free_access',
      freeAccess: true,
      source: 'coupon',
      metadata: { orderId: order.id, couponCode }
    });
  }

  return { order, quote };
};
