
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  team text not null,
  amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('paid','pending')),
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  amount numeric(12,2) not null default 0,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.invoices enable row level security;
alter table public.expenses enable row level security;

create policy "public read invoices" on public.invoices for select using (true);
create policy "public insert invoices" on public.invoices for insert with check (true);
create policy "public update invoices" on public.invoices for update using (true);

create policy "public read expenses" on public.expenses for select using (true);
create policy "public insert expenses" on public.expenses for insert with check (true);

alter publication supabase_realtime add table public.invoices;
alter publication supabase_realtime add table public.expenses;

insert into public.invoices (invoice_no, team, amount, status) values
  ('INV-0016','Al-Futtaim',14500,'paid'),
  ('INV-0017','Sobha Const.',22000,'pending'),
  ('INV-0015','Emaar',45000,'paid'),
  ('INV-0014','Damac',31200,'paid'),
  ('INV-0013','Arabtec',18500,'pending'),
  ('INV-0012','Nakheel',26750,'paid'),
  ('INV-0011','Meraas',12000,'paid');

insert into public.expenses (category, amount, occurred_on) values
  ('Salaries',32000,current_date - 120),
  ('Materials',18000,current_date - 90),
  ('Logistics',9500,current_date - 60),
  ('Marketing',6200,current_date - 30),
  ('Utilities',4100,current_date - 5);
