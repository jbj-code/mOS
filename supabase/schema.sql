-- supabase/schema.sql
-- mOS database schema. Delete old tables in Supabase Table Editor, then run this file.

-- ---------------------------------------------------------------------------
-- entries — finance income/expense rows
-- ---------------------------------------------------------------------------
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,  -- reserved for future multi-user; unused today
  kind text not null check (kind in ('expense', 'income')),
  label text not null check (char_length(trim(label)) > 0),
  category text,
  amount numeric(12, 2) not null check (amount >= 0),
  date date not null,
  created_at timestamptz not null default now()
);

comment on table public.entries is 'Finance entries (income and expenses) for mOS home dashboard.';
comment on column public.entries.kind is 'expense or income';
comment on column public.entries.date is 'Transaction date; filtered by month in app queries';

-- Matches: .gte('date', start).lte('date', end).order('date').order('created_at')
create index if not exists entries_date_created_at_idx
  on public.entries (date desc, created_at desc);

-- Supports kind-filtered reports (e.g. expenses-only by month)
create index if not exists entries_kind_date_created_at_idx
  on public.entries (kind, date desc, created_at desc);

alter table public.entries disable row level security;

-- ---------------------------------------------------------------------------
-- supplements — stack / supplement cost tracker
-- ---------------------------------------------------------------------------
create table if not exists public.supplements (
  id uuid primary key default gen_random_uuid(),
  name text not null default '' check (char_length(trim(name)) > 0),
  price numeric(12, 2) not null default 0 check (price >= 0),
  servings_per_container integer not null default 1 check (servings_per_container > 0),
  servings_per_day numeric(12, 2) not null default 1 check (servings_per_day > 0),
  created_at timestamptz not null default now()
);

comment on table public.supplements is 'Supplement stack with cost-per-serving calculations.';

-- Matches: .order('name', { ascending: true })
create index if not exists supplements_name_idx
  on public.supplements (name asc);

alter table public.supplements disable row level security;
