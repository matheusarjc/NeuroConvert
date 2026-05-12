-- VEN-2: tabelas mínimas para /api/analyze, email_queue e observabilidade.
-- RLS activo sem políticas para anon/authenticated: a app Next usa apenas service_role no servidor.
-- Aplicar: Supabase → SQL Editor → New query → colar → Run (ou `supabase db push` com CLI ligado ao project ref).

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free'
    check (plan in ('free', 'pro', 'agency')),
  credits_remaining integer not null default 1,
  subscription_status text default 'active'
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  url text not null,
  sector text,
  score integer,
  report_json jsonb not null,
  scraping_ok boolean not null default true,
  latency_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists reports_user_id_created_at_idx
  on public.reports (user_id, created_at desc);

create table if not exists public.email_queue (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  template text not null,
  data jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  send_at timestamptz,
  sent_at timestamptz
);

create table if not exists public.system_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  data jsonb not null default '{}'::jsonb,
  severity text not null default 'info'
    check (severity in ('info', 'warning', 'error', 'critical')),
  created_at timestamptz not null default now()
);

create index if not exists system_events_created_at_idx
  on public.system_events (created_at desc);

alter table public.users enable row level security;
alter table public.reports enable row level security;
alter table public.email_queue enable row level security;
alter table public.system_events enable row level security;
