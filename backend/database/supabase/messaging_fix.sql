create schema if not exists messaging;

create table if not exists messaging.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists messaging.conversation_participants (
  conversation_id uuid not null references messaging.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists messaging.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references messaging.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists conversation_participants_user_idx
  on messaging.conversation_participants(user_id, conversation_id);

create index if not exists messages_conversation_created_idx
  on messaging.messages(conversation_id, created_at desc);

alter table messaging.conversations enable row level security;
alter table messaging.conversation_participants enable row level security;
alter table messaging.messages enable row level security;

drop policy if exists "Participants can read conversations" on messaging.conversations;
create policy "Participants can read conversations"
  on messaging.conversations for select
  using (
    exists (
      select 1 from messaging.conversation_participants cp
      where cp.conversation_id = id and cp.user_id = auth.uid()
    )
  );

drop policy if exists "Members can create conversations" on messaging.conversations;
create policy "Members can create conversations"
  on messaging.conversations for insert
  with check (created_by = auth.uid());

drop policy if exists "Participants can update conversations" on messaging.conversations;
create policy "Participants can update conversations"
  on messaging.conversations for update
  using (
    exists (
      select 1 from messaging.conversation_participants cp
      where cp.conversation_id = id and cp.user_id = auth.uid()
    )
  );

drop policy if exists "Participants can read participant rows" on messaging.conversation_participants;
create policy "Participants can read participant rows"
  on messaging.conversation_participants for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from messaging.conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id and cp.user_id = auth.uid()
    )
  );

drop policy if exists "Members can join created conversations" on messaging.conversation_participants;
create policy "Members can join created conversations"
  on messaging.conversation_participants for insert
  with check (
    exists (
      select 1 from messaging.conversations c
      where c.id = conversation_id and c.created_by = auth.uid()
    )
  );

drop policy if exists "Participants can read messages" on messaging.messages;
create policy "Participants can read messages"
  on messaging.messages for select
  using (
    exists (
      select 1 from messaging.conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
    )
  );

drop policy if exists "Participants can send messages" on messaging.messages;
create policy "Participants can send messages"
  on messaging.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from messaging.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
    )
  );

drop policy if exists "Participants can mark messages read" on messaging.messages;
create policy "Participants can mark messages read"
  on messaging.messages for update
  using (
    exists (
      select 1 from messaging.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
    )
  );
