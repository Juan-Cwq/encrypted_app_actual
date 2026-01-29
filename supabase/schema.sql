-- Haven: accounts, recovery keys, contacts, notifications
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Accounts (username + password; recovery key stored for account recovery)
-- public_key is the RSA public key for E2E encryption (base64 encoded)
create table if not exists public.haven_accounts (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password text not null,
  recovery_key text unique not null,
  public_key text, -- RSA-OAEP public key for E2E encryption
  created_at timestamptz default now()
);

-- Contacts (who has added whom; for "add account" / messaging)
create table if not exists public.haven_contacts (
  id uuid primary key default gen_random_uuid(),
  user_username text not null references public.haven_accounts(username) on delete cascade,
  contact_username text not null references public.haven_accounts(username) on delete cascade,
  created_at timestamptz default now(),
  unique(user_username, contact_username),
  check (user_username <> contact_username)
);

-- Notifications
create table if not exists public.haven_notifications (
  id uuid primary key default gen_random_uuid(),
  user_username text not null references public.haven_accounts(username) on delete cascade,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Messages (end-to-end encrypted chat messages)
-- When encrypted=true, content contains the AES-GCM encrypted message (base64)
-- encrypted_key is the AES key encrypted with recipient's RSA public key (base64)
-- iv is the initialization vector for AES-GCM (base64)
create table if not exists public.haven_messages (
  id text primary key,
  chat_id text not null,
  from_username text not null,
  to_username text not null,
  content text not null,
  encrypted boolean default false,
  encrypted_key text, -- AES key encrypted with recipient's RSA public key
  iv text, -- Initialization vector for AES-GCM
  message_type text default 'text',
  file_name text,
  file_url text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Chat settings (disappearing messages, mute, block)
create table if not exists public.haven_chat_settings (
  id uuid primary key default gen_random_uuid(),
  chat_id text unique not null,
  disappearing_enabled boolean default true,
  disappearing_days integer default 2,
  muted boolean default false,
  blocked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for lookups
create index if not exists idx_haven_accounts_username on public.haven_accounts(username);
create index if not exists idx_haven_accounts_recovery_key on public.haven_accounts(recovery_key);
create index if not exists idx_haven_contacts_user on public.haven_contacts(user_username);
create index if not exists idx_haven_notifications_user on public.haven_notifications(user_username);
create index if not exists idx_haven_notifications_read on public.haven_notifications(user_username, read);
create index if not exists idx_haven_messages_chat on public.haven_messages(chat_id);
create index if not exists idx_haven_messages_created on public.haven_messages(chat_id, created_at);
create index if not exists idx_haven_chat_settings_chat on public.haven_chat_settings(chat_id);

-- RLS: enable but allow all for anon (app uses its own auth)
alter table public.haven_accounts enable row level security;
alter table public.haven_contacts enable row level security;
alter table public.haven_notifications enable row level security;
alter table public.haven_messages enable row level security;
alter table public.haven_chat_settings enable row level security;

create policy "Allow all for haven_accounts" on public.haven_accounts for all using (true) with check (true);
create policy "Allow all for haven_contacts" on public.haven_contacts for all using (true) with check (true);
create policy "Allow all for haven_notifications" on public.haven_notifications for all using (true) with check (true);
create policy "Allow all for haven_messages" on public.haven_messages for all using (true) with check (true);
create policy "Allow all for haven_chat_settings" on public.haven_chat_settings for all using (true) with check (true);
