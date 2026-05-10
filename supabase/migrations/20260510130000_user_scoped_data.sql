-- Remove demo seed data
delete from public.expenses;
delete from public.invoices;

-- Add user_id to invoices (defaults to the currently authenticated user)
alter table public.invoices
  add column if not exists user_id uuid references auth.users(id) on delete cascade
  default auth.uid();

-- Add user_id to expenses (defaults to the currently authenticated user)
alter table public.expenses
  add column if not exists user_id uuid references auth.users(id) on delete cascade
  default auth.uid();

-- Drop the old open policies on invoices
drop policy if exists "public read invoices"   on public.invoices;
drop policy if exists "public insert invoices" on public.invoices;
drop policy if exists "public update invoices" on public.invoices;
drop policy if exists "public delete invoices" on public.invoices;

-- Drop the old open policies on expenses
drop policy if exists "public read expenses"   on public.expenses;
drop policy if exists "public insert expenses" on public.expenses;

-- Create user-scoped RLS policies for invoices
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

-- Create user-scoped RLS policies for expenses
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
