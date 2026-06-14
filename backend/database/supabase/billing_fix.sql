-- =============================================================================
-- MyIndianStartup: Billing Schema Fix
-- Run this ONCE in your Supabase SQL Editor.
-- This creates SECURITY DEFINER functions in the PUBLIC schema that wrap all
-- billing table operations, so the backend works even if the 'billing' schema
-- is not listed under "Exposed schemas" in Supabase Project Settings -> API.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PLANS
-- ---------------------------------------------------------------------------

create or replace function public.billing_list_plans()
returns json language plpgsql security definer set search_path = billing, public as $$
begin
  return (
    select coalesce(json_agg(p order by p.sort_order asc), '[]'::json)
    from billing.plans p
    where p.deleted_at is null
  );
end;
$$;

create or replace function public.billing_create_plan(
  p_code text,
  p_name text,
  p_description text,
  p_account_type text,
  p_amount_inr integer,
  p_duration_days integer,
  p_features jsonb,
  p_is_active boolean,
  p_sort_order integer
) returns json language plpgsql security definer set search_path = billing, public as $$
declare
  result billing.plans;
begin
  insert into billing.plans (code, name, description, account_type, amount_inr, duration_days, features, is_active, sort_order)
  values (
    p_code, p_name, p_description,
    p_account_type,
    p_amount_inr, p_duration_days,
    p_features,
    p_is_active, p_sort_order
  )
  returning * into result;
  return row_to_json(result);
end;
$$;

create or replace function public.billing_update_plan(
  p_id uuid,
  p_code text,
  p_name text,
  p_description text,
  p_account_type text,
  p_amount_inr integer,
  p_duration_days integer,
  p_features jsonb,
  p_is_active boolean,
  p_sort_order integer
) returns json language plpgsql security definer set search_path = billing, public as $$
declare
  result billing.plans;
begin
  update billing.plans
  set
    code = p_code, name = p_name, description = p_description,
    account_type = p_account_type,
    amount_inr = p_amount_inr, duration_days = p_duration_days,
    features = p_features, is_active = p_is_active, sort_order = p_sort_order,
    updated_at = now()
  where id = p_id
  returning * into result;
  return row_to_json(result);
end;
$$;

create or replace function public.billing_delete_plan(p_id uuid)
returns json language plpgsql security definer set search_path = billing, public as $$
declare
  result billing.plans;
begin
  update billing.plans
  set is_active = false, deleted_at = now(), updated_at = now()
  where id = p_id
  returning * into result;
  return row_to_json(result);
end;
$$;

-- ---------------------------------------------------------------------------
-- COUPONS
-- ---------------------------------------------------------------------------

create or replace function public.billing_list_coupons()
returns json language plpgsql security definer set search_path = billing, public as $$
begin
  return (
    select coalesce(json_agg(c order by c.created_at desc), '[]'::json)
    from billing.coupons c
    where c.deleted_at is null
  );
end;
$$;

create or replace function public.billing_create_coupon(
  p_code text,
  p_title text,
  p_discount_type text,
  p_discount_value integer,
  p_usage_limit integer,
  p_per_user_limit integer,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_applicable_plan_ids uuid[],
  p_user_ids uuid[],
  p_is_active boolean
) returns json language plpgsql security definer set search_path = billing, public as $$
declare
  result billing.coupons;
begin
  insert into billing.coupons (
    code, title, discount_type, discount_value,
    usage_limit, per_user_limit, starts_at, ends_at,
    applicable_plan_ids, user_ids, is_active
  )
  values (
    upper(p_code), p_title, p_discount_type::billing.discount_type, p_discount_value,
    p_usage_limit, p_per_user_limit, p_starts_at, p_ends_at,
    p_applicable_plan_ids, p_user_ids, p_is_active
  )
  returning * into result;
  return row_to_json(result);
end;
$$;

create or replace function public.billing_update_coupon(
  p_id uuid,
  p_code text,
  p_title text,
  p_discount_type text,
  p_discount_value integer,
  p_usage_limit integer,
  p_per_user_limit integer,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_applicable_plan_ids uuid[],
  p_user_ids uuid[],
  p_is_active boolean
) returns json language plpgsql security definer set search_path = billing, public as $$
declare
  result billing.coupons;
begin
  update billing.coupons
  set
    code = upper(p_code), title = p_title,
    discount_type = p_discount_type::billing.discount_type,
    discount_value = p_discount_value,
    usage_limit = p_usage_limit, per_user_limit = p_per_user_limit,
    starts_at = p_starts_at, ends_at = p_ends_at,
    applicable_plan_ids = p_applicable_plan_ids, user_ids = p_user_ids,
    is_active = p_is_active, updated_at = now()
  where id = p_id
  returning * into result;
  return row_to_json(result);
end;
$$;

create or replace function public.billing_patch_coupon_status(p_id uuid, p_is_active boolean)
returns json language plpgsql security definer set search_path = billing, public as $$
declare
  result billing.coupons;
begin
  update billing.coupons
  set is_active = p_is_active, updated_at = now()
  where id = p_id
  returning * into result;
  return row_to_json(result);
end;
$$;

create or replace function public.billing_delete_coupon(p_id uuid)
returns json language plpgsql security definer set search_path = billing, public as $$
declare
  result billing.coupons;
begin
  update billing.coupons
  set is_active = false, deleted_at = now(), updated_at = now()
  where id = p_id
  returning * into result;
  return row_to_json(result);
end;
$$;

create or replace function public.billing_list_coupon_redemptions(p_coupon_id uuid)
returns json language plpgsql security definer set search_path = billing, public as $$
begin
  return (
    select coalesce(json_agg(r order by r.created_at desc), '[]'::json)
    from billing.coupon_redemptions r
    where r.coupon_id = p_coupon_id
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- SUBSCRIPTIONS / BILLING DATA
-- ---------------------------------------------------------------------------

create or replace function public.billing_list_all()
returns json language plpgsql security definer set search_path = billing, public as $$
declare
  v_subscriptions json;
  v_orders json;
  v_invoices json;
  v_transactions json;
begin
  select coalesce(json_agg(s order by s.created_at desc), '[]'::json) into v_subscriptions
  from (select * from billing.subscriptions order by created_at desc limit 100) s;

  select coalesce(json_agg(o order by o.created_at desc), '[]'::json) into v_orders
  from (select * from billing.orders order by created_at desc limit 100) o;

  select coalesce(json_agg(i order by i.issued_at desc), '[]'::json) into v_invoices
  from (select * from billing.invoices order by issued_at desc limit 100) i;

  select coalesce(json_agg(t order by t.created_at desc), '[]'::json) into v_transactions
  from (select * from billing.transactions order by created_at desc limit 100) t;

  return json_build_object(
    'subscriptions', v_subscriptions,
    'orders', v_orders,
    'invoices', v_invoices,
    'transactions', v_transactions
  );
end;
$$;

create or replace function public.billing_assign_plan(
  p_user_id uuid,
  p_plan_id uuid,
  p_free_access boolean,
  p_source text,
  p_event_type text,
  p_extend_from_current boolean,
  p_metadata jsonb
) returns json language plpgsql security definer set search_path = billing, core, public as $$
declare
  v_plan billing.plans;
  v_current billing.subscriptions;
  v_subscription billing.subscriptions;
  v_now timestamptz := now();
  v_starts_at timestamptz;
  v_expires_at timestamptz;
begin
  -- Get plan
  select * into v_plan from billing.plans where id = p_plan_id and is_active = true and deleted_at is null;
  if v_plan is null then
    raise exception 'Plan not found.' using errcode = 'P0001';
  end if;

  -- Get current active subscription
  select * into v_current from billing.subscriptions
  where user_id = p_user_id and status = 'active'
  order by expires_at desc nulls last limit 1;

  -- Compute start/expiry
  if p_extend_from_current and v_current is not null and v_current.expires_at > v_now then
    v_starts_at := v_current.expires_at;
  else
    v_starts_at := v_now;
  end if;
  v_expires_at := v_starts_at + (v_plan.duration_days || ' days')::interval;

  -- Cancel existing if not extending
  if v_current is not null and not p_extend_from_current then
    update billing.subscriptions
    set status = 'cancelled', cancelled_at = v_now, updated_at = v_now
    where id = v_current.id;
  end if;

  -- Create new subscription
  insert into billing.subscriptions (user_id, plan_id, status, started_at, expires_at, free_access, source, metadata)
  values (p_user_id, v_plan.id, 'active', v_starts_at, v_expires_at, p_free_access, p_source, p_metadata)
  returning * into v_subscription;

  -- Create subscription event
  insert into billing.subscription_events (subscription_id, user_id, event_type, from_plan_id, to_plan_id, from_status, to_status, metadata)
  values (v_subscription.id, p_user_id, p_event_type::billing.subscription_event_type,
          v_current.plan_id, v_plan.id, v_current.status, 'active', p_metadata);

  -- Sync core.members subscription status
  update core.members
  set subscription_status = 'active',
      subscription_started_at = v_starts_at,
      subscription_expires_at = v_expires_at,
      updated_at = v_now
  where id = p_user_id;

  return json_build_object('subscription', row_to_json(v_subscription), 'plan', row_to_json(v_plan));
end;
$$;

create or replace function public.billing_cancel_subscription(
  p_user_id uuid,
  p_metadata jsonb
) returns json language plpgsql security definer set search_path = billing, core, public as $$
declare
  v_subscription billing.subscriptions;
  v_now timestamptz := now();
begin
  update billing.subscriptions
  set status = 'cancelled', cancelled_at = v_now, updated_at = v_now
  where user_id = p_user_id and status = 'active'
  returning * into v_subscription;

  if v_subscription is not null then
    insert into billing.subscription_events (subscription_id, user_id, event_type, from_plan_id, from_status, to_status, metadata)
    values (v_subscription.id, p_user_id, 'cancelled', v_subscription.plan_id, 'active', 'cancelled', p_metadata);
  end if;

  update core.members
  set subscription_status = 'cancelled', updated_at = v_now
  where id = p_user_id;

  return row_to_json(v_subscription);
end;
$$;

-- Reports: revenue growth grouped by day
create or replace function public.billing_revenue_growth(p_start timestamptz, p_end timestamptz)
returns json language plpgsql security definer set search_path = billing, public as $$
begin
  return (
    select coalesce(json_agg(r order by r.date asc), '[]'::json)
    from (
      select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date,
             sum(final_amount_inr) as value
      from billing.orders
      where status = 'paid'
        and created_at >= p_start
        and created_at <= p_end
      group by 1
      order by 1
    ) r
  );
end;
$$;

create or replace function public.billing_subscription_growth(p_start timestamptz, p_end timestamptz)
returns json language plpgsql security definer set search_path = billing, public as $$
begin
  return (
    select coalesce(json_agg(r order by r.date asc), '[]'::json)
    from (
      select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date,
             count(*) as value
      from billing.subscriptions
      where created_at >= p_start and created_at <= p_end
      group by 1
      order by 1
    ) r
  );
end;
$$;

-- Validate coupon (returns json with valid, discountAmountInr, finalAmountInr)
create or replace function public.billing_validate_coupon(
  p_code text,
  p_plan_id uuid,
  p_user_id uuid
) returns json language plpgsql security definer set search_path = billing, public as $$
declare
  v_plan billing.plans;
  v_coupon billing.coupons;
  v_total_uses bigint;
  v_user_uses bigint;
  v_discount integer;
  v_now timestamptz := now();
begin
  -- Get plan
  select * into v_plan from billing.plans where id = p_plan_id and is_active = true and deleted_at is null;
  if v_plan is null then
    raise exception 'Plan not found.' using errcode = 'P0001';
  end if;

  -- No coupon
  if p_code is null or trim(p_code) = '' then
    return json_build_object('valid', true, 'plan', row_to_json(v_plan), 'coupon', null,
      'discountAmountInr', 0, 'finalAmountInr', v_plan.amount_inr, 'reason', null);
  end if;

  -- Get coupon
  select * into v_coupon from billing.coupons
  where code = upper(trim(p_code)) and deleted_at is null;

  if v_coupon is null then
    return json_build_object('valid', false, 'plan', row_to_json(v_plan), 'coupon', null,
      'discountAmountInr', 0, 'finalAmountInr', v_plan.amount_inr, 'reason', 'Coupon code does not exist.');
  end if;

  if not v_coupon.is_active then
    return json_build_object('valid', false, 'plan', row_to_json(v_plan), 'coupon', row_to_json(v_coupon),
      'discountAmountInr', 0, 'finalAmountInr', v_plan.amount_inr, 'reason', 'Coupon is inactive.');
  end if;

  if v_coupon.starts_at is not null and v_coupon.starts_at > v_now then
    return json_build_object('valid', false, 'plan', row_to_json(v_plan), 'coupon', row_to_json(v_coupon),
      'discountAmountInr', 0, 'finalAmountInr', v_plan.amount_inr, 'reason', 'Coupon is not active yet.');
  end if;

  if v_coupon.ends_at is not null and v_coupon.ends_at < v_now then
    return json_build_object('valid', false, 'plan', row_to_json(v_plan), 'coupon', row_to_json(v_coupon),
      'discountAmountInr', 0, 'finalAmountInr', v_plan.amount_inr, 'reason', 'Coupon has expired.');
  end if;

  if array_length(v_coupon.applicable_plan_ids, 1) > 0 and not (p_plan_id = any(v_coupon.applicable_plan_ids)) then
    return json_build_object('valid', false, 'plan', row_to_json(v_plan), 'coupon', row_to_json(v_coupon),
      'discountAmountInr', 0, 'finalAmountInr', v_plan.amount_inr, 'reason', 'Coupon is not applicable to this plan.');
  end if;

  if array_length(v_coupon.user_ids, 1) > 0 and not (p_user_id = any(v_coupon.user_ids)) then
    return json_build_object('valid', false, 'plan', row_to_json(v_plan), 'coupon', row_to_json(v_coupon),
      'discountAmountInr', 0, 'finalAmountInr', v_plan.amount_inr, 'reason', 'Coupon is not assigned to this user.');
  end if;

  select count(*) into v_total_uses from billing.coupon_redemptions where coupon_id = v_coupon.id;
  if v_coupon.usage_limit is not null and v_total_uses >= v_coupon.usage_limit then
    return json_build_object('valid', false, 'plan', row_to_json(v_plan), 'coupon', row_to_json(v_coupon),
      'discountAmountInr', 0, 'finalAmountInr', v_plan.amount_inr, 'reason', 'Coupon usage limit reached.');
  end if;

  if p_user_id is not null then
    select count(*) into v_user_uses from billing.coupon_redemptions
    where coupon_id = v_coupon.id and user_id = p_user_id;
    if v_user_uses >= v_coupon.per_user_limit then
      return json_build_object('valid', false, 'plan', row_to_json(v_plan), 'coupon', row_to_json(v_coupon),
        'discountAmountInr', 0, 'finalAmountInr', v_plan.amount_inr, 'reason', 'Coupon already used by this user.');
    end if;
  end if;

  -- Calculate discount
  if v_coupon.discount_type = 'percentage' then
    v_discount := least(v_plan.amount_inr, round(v_plan.amount_inr * v_coupon.discount_value / 100));
  else
    v_discount := least(v_plan.amount_inr, v_coupon.discount_value);
  end if;

  return json_build_object(
    'valid', true,
    'plan', row_to_json(v_plan),
    'coupon', row_to_json(v_coupon),
    'discountAmountInr', v_discount,
    'finalAmountInr', greatest(0, v_plan.amount_inr - v_discount),
    'reason', null
  );
end;
$$;

-- Create checkout order
create or replace function public.billing_create_order(
  p_user_id uuid,
  p_plan_id uuid,
  p_coupon_id uuid,
  p_base_amount integer,
  p_discount_amount integer,
  p_final_amount integer,
  p_provider_order_id text,
  p_invoice_number text
) returns json language plpgsql security definer set search_path = billing, public as $$
declare
  v_order billing.orders;
  v_status billing.payment_status;
begin
  v_status := case when p_final_amount = 0 then 'paid'::billing.payment_status else 'created'::billing.payment_status end;

  insert into billing.orders (user_id, plan_id, coupon_id, base_amount_inr, discount_amount_inr, final_amount_inr, status, provider, provider_order_id, metadata)
  values (p_user_id, p_plan_id, p_coupon_id, p_base_amount, p_discount_amount, p_final_amount, v_status, 'razorpay', p_provider_order_id, '{"architectureReady": true}'::jsonb)
  returning * into v_order;

  insert into billing.invoices (invoice_number, order_id, user_id, subtotal_inr, discount_inr, total_inr, status)
  values (p_invoice_number, v_order.id, p_user_id, p_base_amount, p_discount_amount, p_final_amount, v_status);

  return row_to_json(v_order);
end;
$$;

create or replace function public.billing_record_coupon_redemption(
  p_coupon_id uuid,
  p_user_id uuid,
  p_plan_id uuid,
  p_discount_amount integer
) returns void language plpgsql security definer set search_path = billing, public as $$
begin
  insert into billing.coupon_redemptions (coupon_id, user_id, plan_id, discount_amount_inr)
  values (p_coupon_id, p_user_id, p_plan_id, p_discount_amount);
end;
$$;

-- Grant execute to service_role and authenticated
grant execute on function public.billing_list_plans() to service_role, authenticated;
grant execute on function public.billing_create_plan(text,text,text,text,integer,integer,jsonb,boolean,integer) to service_role;
grant execute on function public.billing_update_plan(uuid,text,text,text,text,integer,integer,jsonb,boolean,integer) to service_role;
grant execute on function public.billing_delete_plan(uuid) to service_role;
grant execute on function public.billing_list_coupons() to service_role;
grant execute on function public.billing_create_coupon(text,text,text,integer,integer,integer,timestamptz,timestamptz,uuid[],uuid[],boolean) to service_role;
grant execute on function public.billing_update_coupon(uuid,text,text,text,integer,integer,integer,timestamptz,timestamptz,uuid[],uuid[],boolean) to service_role;
grant execute on function public.billing_patch_coupon_status(uuid,boolean) to service_role;
grant execute on function public.billing_delete_coupon(uuid) to service_role;
grant execute on function public.billing_list_coupon_redemptions(uuid) to service_role;
grant execute on function public.billing_list_all() to service_role;
grant execute on function public.billing_assign_plan(uuid,uuid,boolean,text,text,boolean,jsonb) to service_role;
grant execute on function public.billing_cancel_subscription(uuid,jsonb) to service_role;
grant execute on function public.billing_revenue_growth(timestamptz,timestamptz) to service_role;
grant execute on function public.billing_subscription_growth(timestamptz,timestamptz) to service_role;
grant execute on function public.billing_validate_coupon(text,uuid,uuid) to service_role, authenticated;
grant execute on function public.billing_create_order(uuid,uuid,uuid,integer,integer,integer,text,text) to service_role, authenticated;
grant execute on function public.billing_record_coupon_redemption(uuid,uuid,uuid,integer) to service_role, authenticated;
