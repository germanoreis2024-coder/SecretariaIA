-- =============================================
-- AtendeIA - Core Feature Tables
-- Depende da migration 001_initial_schema.sql
-- =============================================

-- =============================================
-- CHANNELS (WhatsApp connections)
-- =============================================
create table public.channels (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  type text not null default 'whatsapp' check (type in ('whatsapp')),
  phone_number text,
  evolution_instance_id text,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- AGENTS (IA atendentes)
-- =============================================
create table public.agents (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  personality text,
  system_prompt text,
  model text not null default 'gemini-2.0-flash',
  temperature numeric default 0.7,
  max_tokens int default 1000,
  channel_id uuid references public.channels(id) on delete set null,
  is_active boolean default true,
  working_hours jsonb,
  fallback_message text,
  created_at timestamptz default now()
);

-- =============================================
-- TRAINING_MESSAGES (base de conhecimento)
-- =============================================
create table public.training_messages (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- =============================================
-- SHORTCUTS (atalhos de resposta)
-- =============================================
create table public.shortcuts (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  trigger text not null,
  response text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- CONVERSATIONS
-- =============================================
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  contact_phone text,
  contact_name text,
  status text default 'open' check (status in ('open', 'resolved', 'pending')),
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- MESSAGES
-- =============================================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tokens_used int,
  model text,
  latency_ms int,
  created_at timestamptz default now()
);

-- =============================================
-- AUTOMATIONS
-- =============================================
create table public.automations (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  type text not null check (type in ('welcome', 'follow_up', 'schedule', 'custom')),
  trigger_config jsonb,
  action_config jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- ANALYTICS_DAILY
-- =============================================
create table public.analytics_daily (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  date date not null default current_date,
  total_conversations int default 0,
  total_messages int default 0,
  avg_response_time_ms int,
  satisfaction_score numeric(3,2),
  resolved_count int default 0,
  escalated_count int default 0,
  created_at timestamptz default now(),
  unique(org_id, date)
);

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
create trigger update_conversations_updated_at
  before update on public.conversations
  for each row execute function public.update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table public.channels enable row level security;
alter table public.agents enable row level security;
alter table public.training_messages enable row level security;
alter table public.shortcuts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.automations enable row level security;
alter table public.analytics_daily enable row level security;

-- Helper: get user's org_id
create or replace function public.get_user_org_id()
returns uuid
language sql stable
as $$
  select org_id from public.org_members where user_id = auth.uid() limit 1;
$$;

-- =============================================
-- CHANNELS RLS
-- =============================================
create policy "Members can view channels"
  on public.channels for select
  using (org_id = public.get_user_org_id());

create policy "Members can insert channels"
  on public.channels for insert
  with check (org_id = public.get_user_org_id());

create policy "Members can update channels"
  on public.channels for update
  using (org_id = public.get_user_org_id());

create policy "Members can delete channels"
  on public.channels for delete
  using (org_id = public.get_user_org_id());

-- =============================================
-- AGENTS RLS
-- =============================================
create policy "Members can view agents"
  on public.agents for select
  using (org_id = public.get_user_org_id());

create policy "Members can insert agents"
  on public.agents for insert
  with check (org_id = public.get_user_org_id());

create policy "Members can update agents"
  on public.agents for update
  using (org_id = public.get_user_org_id());

create policy "Members can delete agents"
  on public.agents for delete
  using (org_id = public.get_user_org_id());

-- =============================================
-- TRAINING_MESSAGES RLS
-- =============================================
create policy "Members can view training"
  on public.training_messages for select
  using (org_id = public.get_user_org_id());

create policy "Members can insert training"
  on public.training_messages for insert
  with check (org_id = public.get_user_org_id());

create policy "Members can delete training"
  on public.training_messages for delete
  using (org_id = public.get_user_org_id());

-- =============================================
-- SHORTCUTS RLS
-- =============================================
create policy "Members can view shortcuts"
  on public.shortcuts for select
  using (org_id = public.get_user_org_id());

create policy "Members can insert shortcuts"
  on public.shortcuts for insert
  with check (org_id = public.get_user_org_id());

create policy "Members can update shortcuts"
  on public.shortcuts for update
  using (org_id = public.get_user_org_id());

create policy "Members can delete shortcuts"
  on public.shortcuts for delete
  using (org_id = public.get_user_org_id());

-- =============================================
-- CONVERSATIONS RLS
-- =============================================
create policy "Members can view conversations"
  on public.conversations for select
  using (org_id = public.get_user_org_id());

create policy "Members can insert conversations"
  on public.conversations for insert
  with check (org_id = public.get_user_org_id());

create policy "Members can update conversations"
  on public.conversations for update
  using (org_id = public.get_user_org_id());

-- =============================================
-- MESSAGES RLS
-- =============================================
create policy "Members can view messages"
  on public.messages for select
  using (
    conversation_id in (
      select id from public.conversations
      where org_id = public.get_user_org_id()
    )
  );

create policy "Members can insert messages"
  on public.messages for insert
  with check (
    conversation_id in (
      select id from public.conversations
      where org_id = public.get_user_org_id()
    )
  );

-- =============================================
-- AUTOMATIONS RLS
-- =============================================
create policy "Members can view automations"
  on public.automations for select
  using (org_id = public.get_user_org_id());

create policy "Members can insert automations"
  on public.automations for insert
  with check (org_id = public.get_user_org_id());

create policy "Members can update automations"
  on public.automations for update
  using (org_id = public.get_user_org_id());

create policy "Members can delete automations"
  on public.automations for delete
  using (org_id = public.get_user_org_id());

-- =============================================
-- ANALYTICS_DAILY RLS
-- =============================================
create policy "Members can view analytics"
  on public.analytics_daily for select
  using (org_id = public.get_user_org_id());
