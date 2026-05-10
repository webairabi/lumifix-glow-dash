-- ============================================================
-- Run this in Supabase SQL Editor for project: kbidhnrzbjbwjntunegn
-- This adds user_id to existing tables and enforces per-user RLS.
-- Existing demo rows will get user_id = NULL and become invisible
-- to all authenticated users — effectively clearing the old data.
-- ============================================================

-- 1. Add user_id column to invoices (NULL for existing rows, auth.uid() default for new ones)
alter table public.invoices
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 2. Add user_id column to expenses
alter table public.expenses
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 3. Drop all existing open/public policies on invoices
drop policy if exists "public read invoices"                          on public.invoices;
drop policy if exists "public insert invoices"                        on public.invoices;
drop policy if exists "public update invoices"                        on public.invoices;
drop policy if exists "public delete invoices"                        on public.invoices;
drop policy if exists "Allow authenticated users to read invoices"    on public.invoices;
drop policy if exists "Allow authenticated users to insert invoices"  on public.invoices;
drop policy if exists "Allow authenticated users to update invoices"  on public.invoices;
drop policy if exists "Allow authenticated users to delete invoices"  on public.invoices;

-- 4. Drop all existing open/public policies on expenses
drop policy if exists "public read expenses"                          on public.expenses;
drop policy if exists "public insert expenses"                        on public.expenses;
drop policy if exists "public update expenses"                        on public.expenses;
drop policy if exists "public delete expenses"                        on public.expenses;
drop policy if exists "Allow authenticated users to read expenses"    on public.expenses;
drop policy if exists "Allow authenticated users to insert expenses"  on public.expenses;
drop policy if exists "Allow authenticated users to update expenses"  on public.expenses;
drop policy if exists "Allow authenticated users to delete expenses"  on public.expenses;

-- 5. Drop previously attempted user-scoped policies (if any)
drop policy if exists "users select own invoices" on public.invoices;
drop policy if exists "users insert own invoices" on public.invoices;
drop policy if exists "users update own invoices" on public.invoices;
drop policy if exists "users delete own invoices" on public.invoices;
drop policy if exists "users select own expenses" on public.expenses;
drop policy if exists "users insert own expenses" on public.expenses;
drop policy if exists "users update own expenses" on public.expenses;
drop policy if exists "users delete own expenses" on public.expenses;

-- 6. Create user-scoped RLS policies for invoices
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

-- 7. Create user-scoped RLS policies for expenses
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

-- 8. Set the default for new inserts to use the logged-in user's ID
alter table public.invoices alter column user_id set default auth.uid();
alter table public.expenses alter column user_id set default auth.uid();
