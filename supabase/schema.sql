-- Apex AI — Agent Operational Database
-- Paste into Supabase SQL editor and run.
-- This is NOT a CRM replica. It's the agent's own store.

-- ── Dealerships ─────────────────────────────────────────────────────────────
create table if not exists dealerships (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  crm_type      text,           -- 'vinsolutions' | 'dealersocket' | 'reynolds'
  crm_dealer_id text,           -- vendor's dealer ID, for sync later
  timezone      text not null default 'America/Los_Angeles',
  created_at    timestamptz not null default now()
);

-- ── Leads ───────────────────────────────────────────────────────────────────
-- Lightweight session snapshot. NOT a full CRM contact.
-- crm_contact_id ties back to the CRM when sync is wired up.
create table if not exists leads (
  id              uuid primary key default gen_random_uuid(),
  dealership_id   uuid not null references dealerships(id) on delete cascade,
  name            text not null,
  phone           text,
  email           text,
  vehicle_interest text,
  source_channel  text not null check (source_channel in ('sms','website_chat','facebook')),
  crm_contact_id  text,         -- foreign key back into the CRM
  created_at      timestamptz not null default now()
);

-- ── Conversations ────────────────────────────────────────────────────────────
create table if not exists conversations (
  id                   uuid primary key default gen_random_uuid(),
  dealership_id        uuid not null references dealerships(id) on delete cascade,
  lead_id              uuid not null references leads(id) on delete cascade,
  status               text not null default 'active'
                         check (status in ('active','booked','handed_off','closed')),
  channel              text not null check (channel in ('sms','website_chat','facebook')),
  agent_name           text not null default 'Nova',
  assigned_to          text,     -- sales rep name, set when handed_off
  last_message_at      timestamptz not null default now(),
  last_message_preview text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ── Messages ─────────────────────────────────────────────────────────────────
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role            text not null check (role in ('user','agent','system')),
  content         text not null,
  created_at      timestamptz not null default now()
);

-- ── Agent Events ──────────────────────────────────────────────────────────────
-- Audit trail of key agent decisions. Powers the dashboard KPIs.
create table if not exists agent_events (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  dealership_id   uuid not null references dealerships(id) on delete cascade,
  event_type      text not null check (event_type in (
                    'conversation_started',
                    'appointment_booked',
                    'handed_off',
                    'closed',
                    'crm_synced'
                  )),
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_conversations_dealership  on conversations(dealership_id);
create index if not exists idx_conversations_status      on conversations(status);
create index if not exists idx_conversations_updated     on conversations(updated_at desc);
create index if not exists idx_messages_conversation     on messages(conversation_id);
create index if not exists idx_agent_events_dealership   on agent_events(dealership_id);
create index if not exists idx_agent_events_created      on agent_events(created_at desc);
create index if not exists idx_leads_dealership          on leads(dealership_id);
