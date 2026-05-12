-- VEN-4: schema do guia §4 — daily_metrics + colunas created_at em users e email_queue.

create table if not exists public.daily_metrics (
  date date primary key,
  mrr numeric not null default 0,
  new_subscribers integer not null default 0,
  churned_subscribers integer not null default 0,
  total_active_subscribers integer not null default 0,
  total_analyses integer not null default 0,
  free_to_paid_conversions integer not null default 0,
  api_error_rate numeric not null default 0,
  avg_latency_ms integer not null default 0
);

alter table public.daily_metrics enable row level security;

alter table public.users
  add column if not exists created_at timestamptz not null default now();

alter table public.email_queue
  add column if not exists created_at timestamptz not null default now();
