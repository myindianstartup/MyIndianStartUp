-- MyIndianStartup Supabase schema
-- Run this in Supabase SQL Editor after creating the project.

create extension if not exists "pgcrypto";

create schema if not exists core;
create schema if not exists businessverse;
create schema if not exists creatorverse;
create schema if not exists postverse;
create schema if not exists billing;
create schema if not exists admin;

do $$
begin
  create type core.account_type as enum ('business', 'creator');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type core.subscription_status as enum ('inactive', 'trialing', 'active', 'past_due', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type core.media_purpose as enum ('profile', 'post');
exception when duplicate_object then null;
end $$;

do $$
begin
  alter type core.media_purpose add value if not exists 'story';
exception when duplicate_object then null;
end $$;

do $$
begin
  create type core.media_type as enum ('image', 'video');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type postverse.post_status as enum ('draft', 'uploading', 'published', 'hidden', 'deleted');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type admin.admin_role as enum ('admin', 'superadmin');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type billing.discount_type as enum ('percentage', 'fixed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type billing.payment_status as enum ('created', 'pending', 'paid', 'failed', 'refunded', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type billing.subscription_event_type as enum ('assigned', 'upgraded', 'downgraded', 'extended', 'cancelled', 'free_access', 'payment_activated');
exception when duplicate_object then null;
end $$;

create table if not exists core.members (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  mobile_number text,
  account_type core.account_type not null,
  subscription_status core.subscription_status not null default 'inactive',
  subscription_started_at timestamptz,
  subscription_expires_at timestamptz,
  account_status text not null default 'active',
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table core.members add column if not exists account_status text not null default 'active';
alter table core.members add column if not exists last_active_at timestamptz;

create table if not exists core.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid,
  purpose core.media_purpose not null,
  media_type core.media_type not null,
  bucket text not null,
  object_key text not null,
  public_url text not null,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists businessverse.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text not null,
  industry text not null,
  city text not null,
  state text not null,
  website text,
  social_links jsonb not null default '{}'::jsonb,
  about_company text,
  contact_details jsonb not null default '{}'::jsonb,
  logo_asset_id uuid references core.media_assets(id) on delete set null,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists creatorverse.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  skills text[] not null default array[]::text[],
  city text not null,
  state text not null,
  portfolio_url text,
  social_links jsonb not null default '{}'::jsonb,
  about_me text,
  contact_details jsonb not null default '{}'::jsonb,
  profile_asset_id uuid references core.media_assets(id) on delete set null,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists postverse.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  account_type core.account_type not null,
  caption text not null,
  media_asset_id uuid references core.media_assets(id) on delete set null,
  media_url text,
  media_type core.media_type,
  status postverse.post_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  alter table core.media_assets
    add constraint media_assets_post_id_fkey
    foreign key (post_id) references postverse.posts(id) on delete set null;
exception when duplicate_object then null;
end $$;

create table if not exists postverse.post_metrics (
  post_id uuid primary key references postverse.posts(id) on delete cascade,
  views integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  saves integer not null default 0,
  inquiries integer not null default 0,
  reach integer not null default 0,
  impressions integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table postverse.post_metrics add column if not exists likes integer not null default 0;
alter table postverse.post_metrics add column if not exists comments integer not null default 0;
alter table postverse.post_metrics add column if not exists shares integer not null default 0;
alter table postverse.post_metrics add column if not exists reach integer not null default 0;
alter table postverse.post_metrics add column if not exists impressions integer not null default 0;

create table if not exists postverse.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references postverse.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  status text not null default 'visible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists postverse.post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references postverse.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null default 'like',
  created_at timestamptz not null default now(),
  unique(post_id, user_id, reaction_type)
);

create table if not exists postverse.post_shares (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references postverse.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  channel text not null default 'internal',
  created_at timestamptz not null default now()
);

create table if not exists postverse.user_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'connected',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists postverse.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  account_type core.account_type not null,
  caption text,
  media_asset_id uuid references core.media_assets(id) on delete set null,
  media_url text not null,
  media_type core.media_type not null,
  status text not null default 'active',
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists postverse.story_views (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references postverse.stories(id) on delete cascade,
  viewer_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(story_id, viewer_id)
);

create table if not exists admin.traffic_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null default 'page_view',
  route text not null,
  referrer text,
  device_type text,
  browser text,
  country text,
  region text,
  city text,
  session_id text,
  duration_seconds integer,
  bounce boolean,
  user_agent text,
  ip_address inet,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists admin.api_request_logs (
  id uuid primary key default gen_random_uuid(),
  method text not null,
  path text not null,
  status_code integer not null,
  duration_ms integer not null,
  user_id uuid references auth.users(id) on delete set null,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists admin.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role admin.admin_role,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create table if not exists admin.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  notification_type text not null default 'system',
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists billing.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  account_type core.account_type,
  amount_inr integer not null check (amount_inr >= 0),
  duration_days integer not null default 365 check (duration_days > 0),
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists billing.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  discount_type billing.discount_type not null,
  discount_value integer not null check (discount_value >= 0),
  usage_limit integer,
  per_user_limit integer not null default 1,
  starts_at timestamptz,
  ends_at timestamptz,
  applicable_plan_ids uuid[] not null default array[]::uuid[],
  user_ids uuid[] not null default array[]::uuid[],
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists billing.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references billing.coupons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references billing.plans(id) on delete set null,
  discount_amount_inr integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists billing.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references billing.plans(id) on delete set null,
  status core.subscription_status not null default 'inactive',
  started_at timestamptz,
  expires_at timestamptz,
  cancelled_at timestamptz,
  free_access boolean not null default false,
  source text not null default 'admin',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists billing.subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references billing.subscriptions(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type billing.subscription_event_type not null,
  from_plan_id uuid references billing.plans(id) on delete set null,
  to_plan_id uuid references billing.plans(id) on delete set null,
  from_status core.subscription_status,
  to_status core.subscription_status,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists billing.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references billing.plans(id) on delete restrict,
  coupon_id uuid references billing.coupons(id) on delete set null,
  base_amount_inr integer not null,
  discount_amount_inr integer not null default 0,
  final_amount_inr integer not null,
  status billing.payment_status not null default 'created',
  provider text not null default 'razorpay',
  provider_order_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists billing.transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references billing.orders(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  provider text not null default 'razorpay',
  provider_payment_id text,
  provider_order_id text,
  provider_signature text,
  amount_inr integer not null,
  status billing.payment_status not null default 'pending',
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists billing.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  order_id uuid references billing.orders(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  subtotal_inr integer not null,
  discount_inr integer not null default 0,
  total_inr integer not null,
  tax_inr integer not null default 0,
  status billing.payment_status not null default 'created',
  issued_at timestamptz not null default now(),
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

insert into billing.plans (code, name, description, account_type, amount_inr, duration_days, features, sort_order)
values
  ('BUSINESSVERSE_ANNUAL', 'BusinessVerse Annual Membership', 'Business visibility, daily posts, creator discovery, and direct collaboration.', 'business', 999, 365, '["Business listing","365 days marketing","Daily posts","Creator discovery","PAN India visibility","No commission"]'::jsonb, 1),
  ('CREATORVERSE_ANNUAL', 'CreatorVerse Annual Membership', 'Creator profile, daily posts, business discovery, and direct collaboration.', 'creator', 999, 365, '["Creator listing","365 days marketing","Daily posts","Business discovery","PAN India visibility","No commission"]'::jsonb, 2)
on conflict (code) do nothing;

insert into billing.coupons (code, title, discount_type, discount_value, usage_limit, per_user_limit, is_active)
values
  ('WELCOME10', 'Welcome 10% Discount', 'percentage', 10, 1000, 1, true),
  ('STARTUP20', 'Startup 20% Discount', 'percentage', 20, 500, 1, true),
  ('PREMIUM50', 'Premium 50% Discount', 'percentage', 50, 100, 1, true)
on conflict (code) do nothing;

create table if not exists admin.users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role admin.admin_role not null default 'admin',
  created_at timestamptz not null default now()
);

create index if not exists members_account_type_idx on core.members(account_type);
create index if not exists members_subscription_status_idx on core.members(subscription_status);
create index if not exists members_last_active_idx on core.members(last_active_at desc);
create index if not exists members_account_status_idx on core.members(account_status);
create index if not exists business_profiles_public_idx on businessverse.profiles(is_public);
create index if not exists business_profiles_city_state_idx on businessverse.profiles(city, state);
create index if not exists business_profiles_industry_idx on businessverse.profiles(industry);
create index if not exists creator_profiles_public_idx on creatorverse.profiles(is_public);
create index if not exists creator_profiles_city_state_idx on creatorverse.profiles(city, state);
create index if not exists posts_author_created_idx on postverse.posts(author_id, created_at desc);
create index if not exists posts_published_idx on postverse.posts(status, published_at desc);
create index if not exists posts_author_status_published_idx on postverse.posts(author_id, status, published_at desc);
create index if not exists post_comments_post_created_idx on postverse.post_comments(post_id, created_at desc);
create index if not exists post_reactions_post_created_idx on postverse.post_reactions(post_id, created_at desc);
create index if not exists post_shares_post_created_idx on postverse.post_shares(post_id, created_at desc);
create index if not exists user_follows_follower_idx on postverse.user_follows(follower_id, created_at desc);
create index if not exists user_follows_following_idx on postverse.user_follows(following_id, created_at desc);
create index if not exists stories_active_created_idx on postverse.stories(status, expires_at, created_at desc);
create index if not exists stories_author_created_idx on postverse.stories(author_id, created_at desc);
create index if not exists story_views_story_idx on postverse.story_views(story_id, created_at desc);
create index if not exists traffic_events_created_idx on admin.traffic_events(created_at desc);
create index if not exists traffic_events_route_created_idx on admin.traffic_events(route, created_at desc);
create index if not exists traffic_events_user_created_idx on admin.traffic_events(user_id, created_at desc);
create index if not exists api_request_logs_created_idx on admin.api_request_logs(created_at desc);
create index if not exists api_request_logs_path_created_idx on admin.api_request_logs(path, created_at desc);
create index if not exists audit_logs_created_idx on admin.audit_logs(created_at desc);
create index if not exists billing_plans_active_idx on billing.plans(is_active, deleted_at);
create index if not exists billing_coupons_code_idx on billing.coupons(code);
create index if not exists billing_coupons_active_dates_idx on billing.coupons(is_active, starts_at, ends_at);
create index if not exists coupon_redemptions_coupon_user_idx on billing.coupon_redemptions(coupon_id, user_id);
create index if not exists subscriptions_user_status_idx on billing.subscriptions(user_id, status, expires_at desc);
create index if not exists subscription_events_user_created_idx on billing.subscription_events(user_id, created_at desc);
create index if not exists orders_user_status_idx on billing.orders(user_id, status, created_at desc);
create index if not exists transactions_user_status_idx on billing.transactions(user_id, status, created_at desc);
create index if not exists invoices_user_status_idx on billing.invoices(user_id, status, issued_at desc);

create or replace function postverse.next_allowed_post_at(target_user_id uuid)
returns timestamptz
language sql
stable
as $$
  select max(coalesce(published_at, created_at)) + interval '24 hours'
  from postverse.posts
  where author_id = target_user_id
    and status = 'published';
$$;

create or replace function postverse.can_publish_post(target_user_id uuid)
returns boolean
language sql
stable
as $$
  select coalesce(postverse.next_allowed_post_at(target_user_id) <= now(), true);
$$;

create or replace function admin.current_user_role()
returns admin.admin_role
language sql
security definer
set search_path = admin, public
stable
as $$
  select role from admin.users where user_id = auth.uid() limit 1;
$$;

create or replace function core.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = core, public
as $$
begin
  insert into core.members (
    id,
    email,
    full_name,
    mobile_number,
    account_type,
    subscription_status
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'mobile_number', ''),
    coalesce(nullif(new.raw_user_meta_data->>'account_type', '')::core.account_type, 'business'::core.account_type),
    'inactive'::core.subscription_status
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        mobile_number = excluded.mobile_number,
        account_type = excluded.account_type,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function core.handle_new_auth_user();

alter table core.members enable row level security;
alter table core.media_assets enable row level security;
alter table businessverse.profiles enable row level security;
alter table creatorverse.profiles enable row level security;
alter table postverse.posts enable row level security;
alter table postverse.post_metrics enable row level security;
alter table postverse.post_comments enable row level security;
alter table postverse.post_reactions enable row level security;
alter table postverse.post_shares enable row level security;
alter table postverse.user_follows enable row level security;
alter table postverse.stories enable row level security;
alter table postverse.story_views enable row level security;
alter table admin.users enable row level security;
alter table admin.traffic_events enable row level security;
alter table admin.api_request_logs enable row level security;
alter table admin.audit_logs enable row level security;
alter table admin.notifications enable row level security;
alter table billing.plans enable row level security;
alter table billing.coupons enable row level security;
alter table billing.coupon_redemptions enable row level security;
alter table billing.subscriptions enable row level security;
alter table billing.subscription_events enable row level security;
alter table billing.orders enable row level security;
alter table billing.transactions enable row level security;
alter table billing.invoices enable row level security;

drop policy if exists "members read own row" on core.members;
drop policy if exists "members update own row" on core.members;
drop policy if exists "media read own assets" on core.media_assets;
drop policy if exists "business profiles public read" on businessverse.profiles;
drop policy if exists "business profiles owner write" on businessverse.profiles;
drop policy if exists "creator profiles public read" on creatorverse.profiles;
drop policy if exists "creator profiles owner write" on creatorverse.profiles;
drop policy if exists "posts public read published" on postverse.posts;
drop policy if exists "posts owner read write" on postverse.posts;
drop policy if exists "admin users superadmin read" on admin.users;
drop policy if exists "post comments public read" on postverse.post_comments;
drop policy if exists "post comments owner write" on postverse.post_comments;
drop policy if exists "post reactions public read" on postverse.post_reactions;
drop policy if exists "post reactions owner write" on postverse.post_reactions;
drop policy if exists "post shares owner write" on postverse.post_shares;
drop policy if exists "user follows public read" on postverse.user_follows;
drop policy if exists "user follows owner write" on postverse.user_follows;
drop policy if exists "stories public read active" on postverse.stories;
drop policy if exists "stories owner write" on postverse.stories;
drop policy if exists "story views owner write" on postverse.story_views;
drop policy if exists "notifications owner read" on admin.notifications;
drop policy if exists "billing plans public read active" on billing.plans;
drop policy if exists "billing subscriptions owner read" on billing.subscriptions;
drop policy if exists "billing orders owner read" on billing.orders;
drop policy if exists "billing transactions owner read" on billing.transactions;
drop policy if exists "billing invoices owner read" on billing.invoices;

create policy "members read own row" on core.members
  for select using (auth.uid() = id);

create policy "members update own row" on core.members
  for update using (auth.uid() = id);

create policy "media read own assets" on core.media_assets
  for select using (auth.uid() = owner_id);

create policy "business profiles public read" on businessverse.profiles
  for select using (is_public = true or auth.uid() = owner_id);

create policy "business profiles owner write" on businessverse.profiles
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "creator profiles public read" on creatorverse.profiles
  for select using (is_public = true or auth.uid() = owner_id);

create policy "creator profiles owner write" on creatorverse.profiles
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "posts public read published" on postverse.posts
  for select using (status = 'published' or auth.uid() = author_id);

create policy "posts owner read write" on postverse.posts
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "post comments public read" on postverse.post_comments
  for select using (status = 'visible');

create policy "post comments owner write" on postverse.post_comments
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "post reactions public read" on postverse.post_reactions
  for select using (true);

create policy "post reactions owner write" on postverse.post_reactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "post shares owner write" on postverse.post_shares
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user follows public read" on postverse.user_follows
  for select using (true);

create policy "user follows owner write" on postverse.user_follows
  for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

create policy "stories public read active" on postverse.stories
  for select using (status = 'active' and expires_at > now());

create policy "stories owner write" on postverse.stories
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "story views owner write" on postverse.story_views
  for all using (auth.uid() = viewer_id) with check (auth.uid() = viewer_id);

create policy "admin users superadmin read" on admin.users
  for select using (admin.current_user_role() = 'superadmin');

create policy "notifications owner read" on admin.notifications
  for select using (auth.uid() = user_id);

create policy "billing plans public read active" on billing.plans
  for select using (is_active = true and deleted_at is null);

create policy "billing subscriptions owner read" on billing.subscriptions
  for select using (auth.uid() = user_id);

create policy "billing orders owner read" on billing.orders
  for select using (auth.uid() = user_id);

create policy "billing transactions owner read" on billing.transactions
  for select using (auth.uid() = user_id);

create policy "billing invoices owner read" on billing.invoices
  for select using (auth.uid() = user_id);

grant usage on schema core, businessverse, creatorverse, postverse, billing, admin to authenticated, service_role;
grant select, insert, update, delete on all tables in schema core to authenticated;
grant select, insert, update, delete on all tables in schema businessverse to authenticated;
grant select, insert, update, delete on all tables in schema creatorverse to authenticated;
grant select, insert, update, delete on all tables in schema postverse to authenticated;
grant select on all tables in schema billing to authenticated;
grant select on all tables in schema admin to authenticated;
grant select, insert, update, delete on all tables in schema core to service_role;
grant select, insert, update, delete on all tables in schema businessverse to service_role;
grant select, insert, update, delete on all tables in schema creatorverse to service_role;
grant select, insert, update, delete on all tables in schema postverse to service_role;
grant select, insert, update, delete on all tables in schema billing to service_role;
grant select, insert, update, delete on all tables in schema admin to service_role;
grant usage, select on all sequences in schema core to authenticated, service_role;
grant usage, select on all sequences in schema businessverse to authenticated, service_role;
grant usage, select on all sequences in schema creatorverse to authenticated, service_role;
grant usage, select on all sequences in schema postverse to authenticated, service_role;
grant usage, select on all sequences in schema billing to authenticated, service_role;
grant usage, select on all sequences in schema admin to authenticated, service_role;
