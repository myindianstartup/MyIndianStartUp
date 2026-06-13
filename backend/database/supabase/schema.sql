-- MyIndianStartup Supabase schema
-- Run this in Supabase SQL Editor after creating the project.

create extension if not exists "pgcrypto";

create schema if not exists core;
create schema if not exists businessverse;
create schema if not exists creatorverse;
create schema if not exists postverse;
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

create table if not exists core.members (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  mobile_number text,
  account_type core.account_type not null,
  subscription_status core.subscription_status not null default 'inactive',
  subscription_started_at timestamptz,
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  saves integer not null default 0,
  inquiries integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists admin.users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role admin.admin_role not null default 'admin',
  created_at timestamptz not null default now()
);

create index if not exists members_account_type_idx on core.members(account_type);
create index if not exists members_subscription_status_idx on core.members(subscription_status);
create index if not exists business_profiles_public_idx on businessverse.profiles(is_public);
create index if not exists business_profiles_city_state_idx on businessverse.profiles(city, state);
create index if not exists business_profiles_industry_idx on businessverse.profiles(industry);
create index if not exists creator_profiles_public_idx on creatorverse.profiles(is_public);
create index if not exists creator_profiles_city_state_idx on creatorverse.profiles(city, state);
create index if not exists posts_author_created_idx on postverse.posts(author_id, created_at desc);
create index if not exists posts_published_idx on postverse.posts(status, published_at desc);

create or replace function postverse.next_allowed_post_at(target_user_id uuid)
returns timestamptz
language sql
stable
as $$
  select max(created_at) + interval '24 hours'
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

alter table core.members enable row level security;
alter table core.media_assets enable row level security;
alter table businessverse.profiles enable row level security;
alter table creatorverse.profiles enable row level security;
alter table postverse.posts enable row level security;
alter table postverse.post_metrics enable row level security;
alter table admin.users enable row level security;

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

create policy "admin users superadmin read" on admin.users
  for select using (admin.current_user_role() = 'superadmin');

grant usage on schema core, businessverse, creatorverse, postverse, admin to authenticated, service_role;
grant select, insert, update, delete on all tables in schema core to authenticated;
grant select, insert, update, delete on all tables in schema businessverse to authenticated;
grant select, insert, update, delete on all tables in schema creatorverse to authenticated;
grant select, insert, update, delete on all tables in schema postverse to authenticated;
grant select on all tables in schema admin to authenticated;
grant select, insert, update, delete on all tables in schema core to service_role;
grant select, insert, update, delete on all tables in schema businessverse to service_role;
grant select, insert, update, delete on all tables in schema creatorverse to service_role;
grant select, insert, update, delete on all tables in schema postverse to service_role;
grant select, insert, update, delete on all tables in schema admin to service_role;
grant usage, select on all sequences in schema core to authenticated, service_role;
grant usage, select on all sequences in schema businessverse to authenticated, service_role;
grant usage, select on all sequences in schema creatorverse to authenticated, service_role;
grant usage, select on all sequences in schema postverse to authenticated, service_role;
grant usage, select on all sequences in schema admin to authenticated, service_role;
