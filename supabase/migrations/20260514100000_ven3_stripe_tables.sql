-- VEN-3: tabelas Stripe + coluna users.subscribed_at

alter table public.users
  add column if not exists subscribed_at timestamptz;

create table if not exists public.financial_events (
  id uuid primary key default gen_random_uuid(),
  type text not null
    check (type in ('subscription_created', 'subscription_canceled')),
  plan text,
  mrr_impact numeric not null,
  stripe_event_id text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_log (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  currency text not null,
  stripe_invoice_id text not null unique,
  paid_at timestamptz not null default now()
);

alter table public.financial_events enable row level security;
alter table public.revenue_log enable row level security;
