import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kbidhnrzbjbwjntunegn.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY env var");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

async function run() {
  console.log("Step 1: Deleting all demo data...");

  const { error: delExp } = await supabase.from("expenses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delExp) console.error("  expenses delete error:", delExp.message);
  else console.log("  expenses cleared");

  const { error: delInv } = await supabase.from("invoices").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delInv) console.error("  invoices delete error:", delInv.message);
  else console.log("  invoices cleared");

  console.log("\nStep 2: Applying schema migration via Supabase SQL endpoint...");

  const sql = `
-- Add user_id to invoices
alter table public.invoices
  add column if not exists user_id uuid references auth.users(id) on delete cascade
  default auth.uid();

-- Add user_id to expenses
alter table public.expenses
  add column if not exists user_id uuid references auth.users(id) on delete cascade
  default auth.uid();

-- Drop old open policies on invoices
drop policy if exists "public read invoices"   on public.invoices;
drop policy if exists "public insert invoices" on public.invoices;
drop policy if exists "public update invoices" on public.invoices;
drop policy if exists "public delete invoices" on public.invoices;
drop policy if exists "Allow authenticated users to read invoices" on public.invoices;
drop policy if exists "Allow authenticated users to insert invoices" on public.invoices;
drop policy if exists "Allow authenticated users to update invoices" on public.invoices;
drop policy if exists "Allow authenticated users to delete invoices" on public.invoices;

-- Drop old open policies on expenses
drop policy if exists "public read expenses"   on public.expenses;
drop policy if exists "public insert expenses" on public.expenses;
drop policy if exists "public update expenses" on public.expenses;
drop policy if exists "public delete expenses" on public.expenses;
drop policy if exists "Allow authenticated users to read expenses" on public.expenses;
drop policy if exists "Allow authenticated users to insert expenses" on public.expenses;
drop policy if exists "Allow authenticated users to update expenses" on public.expenses;
drop policy if exists "Allow authenticated users to delete expenses" on public.expenses;

-- Drop user-scoped policies if already exist (so we can recreate cleanly)
drop policy if exists "users select own invoices" on public.invoices;
drop policy if exists "users insert own invoices" on public.invoices;
drop policy if exists "users update own invoices" on public.invoices;
drop policy if exists "users delete own invoices" on public.invoices;
drop policy if exists "users select own expenses" on public.expenses;
drop policy if exists "users insert own expenses" on public.expenses;
drop policy if exists "users update own expenses" on public.expenses;
drop policy if exists "users delete own expenses" on public.expenses;

-- User-scoped RLS policies for invoices
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

-- User-scoped RLS policies for expenses
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
`;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    const body = await response.text();
    console.log("  SQL endpoint not available, will use pg direct connection...");
    await applyViaPg(sql);
  } else {
    console.log("  Migration applied via REST");
  }

  console.log("\nStep 3: Verifying row counts...");
  const { data: exps } = await supabase.from("expenses").select("id");
  const { data: invs } = await supabase.from("invoices").select("id");
  console.log(`  expenses rows: ${exps?.length ?? "error"}`);
  console.log(`  invoices rows: ${invs?.length ?? "error"}`);
}

async function applyViaPg(sql) {
  const { default: pg } = await import("pg");
  const { Client } = pg;

  const supabaseHost = "db.kbidhnrzbjbwjntunegn.supabase.co";
  const client = new Client({
    host: supabaseHost,
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: SERVICE_KEY,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    console.log("  Connected to Supabase postgres directly");
    await client.query(sql);
    console.log("  Migration applied via pg");
    await client.end();
  } catch (err) {
    console.error("  pg connection failed:", err.message);
    console.log("\n  ACTION REQUIRED: Please run the SQL in supabase/migrations/20260510130000_user_scoped_data.sql");
    console.log("  in your Supabase dashboard → SQL Editor");
  }
}

run().catch(console.error);
