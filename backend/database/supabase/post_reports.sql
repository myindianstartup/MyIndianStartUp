create table if not exists postverse.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references postverse.posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open',
  admin_response text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id, reporter_id),
  check (status in ('open', 'reviewing', 'resolved', 'dismissed'))
);

create index if not exists post_reports_status_created_idx on postverse.post_reports(status, created_at desc);
create index if not exists post_reports_post_idx on postverse.post_reports(post_id);

alter table postverse.post_reports enable row level security;

drop policy if exists "post reports reporter read write" on postverse.post_reports;
create policy "post reports reporter read write" on postverse.post_reports
  for all using (auth.uid() = reporter_id) with check (auth.uid() = reporter_id);
