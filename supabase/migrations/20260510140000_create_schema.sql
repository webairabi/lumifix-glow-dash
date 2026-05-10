-- ============================================================
-- Run this in your Supabase SQL Editor for project dzetewyowsghkcrklxkw
-- ============================================================

-- Create invoices table
create table if not exists public.invoices (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  number      text not null,
  client      text not null,
  amount      numeric(12,2) not null default 0,
  status      text not null default 'Pending' check (status in ('Paid','Pending','Overdue')),
  issued_on   date not null default current_date,
  due_on      date not null default (current_date + interval '30 days'),
  created_at  timestamptz not null default now()
);

-- Create expenses table
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  category    text not null,
  amount      numeric(12,2) not null default 0,
  occurred_on date not null default current_date,
  created_at  timestamptz not null default now()
);

-- Enable RLS on both tables
alter table public.invoices enable row level security;
alter table public.expenses  enable row level security;

-- User-scoped policies for invoices
create policy "users select own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);

create policy "users insert own invoices"
  on public.invoices for insert
  with check (auth.uid() = user_id);

create policy "users update own invoices"
  on public.invoices for update
  using (auth.uid() = user_id);

create policy "users delete own invoices"
  on public.invoices for delete
  using (auth.uid() = user_id);

-- User-scoped policies for expenses
create policy "users select own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "users insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "users update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "users delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);
