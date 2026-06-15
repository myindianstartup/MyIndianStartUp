create schema if not exists postverse;

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

create index if not exists user_follows_follower_idx on postverse.user_follows(follower_id, created_at desc);
create index if not exists user_follows_following_idx on postverse.user_follows(following_id, created_at desc);

create table if not exists postverse.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  account_type core.account_type not null,
  caption text,
  media_asset_id uuid references core.media_assets(id) on delete set null,
  media_url text not null,
  media_type core.media_type not null,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table postverse.stories add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table postverse.stories add column if not exists status text not null default 'active';
alter table postverse.stories add column if not exists expires_at timestamptz not null default (now() + interval '24 hours');

create table if not exists postverse.story_views (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references postverse.stories(id) on delete cascade,
  viewer_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(story_id, viewer_id)
);

create index if not exists stories_active_created_idx on postverse.stories(status, expires_at, created_at desc);
create index if not exists stories_author_created_idx on postverse.stories(author_id, created_at desc);
create index if not exists story_views_viewer_idx on postverse.story_views(viewer_id, created_at desc);

alter table postverse.user_follows enable row level security;
alter table postverse.stories enable row level security;
alter table postverse.story_views enable row level security;

drop policy if exists "user follows public read" on postverse.user_follows;
drop policy if exists "user follows owner write" on postverse.user_follows;
drop policy if exists "stories public read active" on postverse.stories;
drop policy if exists "stories owner write" on postverse.stories;
drop policy if exists "story views owner read" on postverse.story_views;
drop policy if exists "story views owner write" on postverse.story_views;

create policy "user follows public read" on postverse.user_follows
  for select using (true);

create policy "user follows owner write" on postverse.user_follows
  for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

create policy "stories public read active" on postverse.stories
  for select using (status = 'active' and expires_at > now());

create policy "stories owner write" on postverse.stories
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "story views owner read" on postverse.story_views
  for select using (auth.uid() = viewer_id);

create policy "story views owner write" on postverse.story_views
  for all using (auth.uid() = viewer_id) with check (auth.uid() = viewer_id);
