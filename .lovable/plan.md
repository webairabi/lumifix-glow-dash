# Lumifix Enterprise — Mobile Dashboard

A dark, gold-accented mobile dashboard for invoice management, backed by Lovable Cloud (Supabase) so data persists.

## Visual design
- Background: near-black (`#0A0A0A`), cards: `#141414` with subtle gold borders
- Accent: gold `#FFD700` (primary), green `#22C55E` for Paid, cyan `#22D3EE` for expenses line
- Typography: bold white headings, muted gray subtitles
- Mobile-first layout (max-width container ~420px), rounded-2xl cards
- Set preview viewport to mobile

## Pages & routes
- `/` — Dashboard (main screen from the mockup)
- `/invoices` — full invoice list
- `/expenses` — expenses list + add
- `/customers` — placeholder list
- `/more` — placeholder settings
- Bottom nav present on all five routes (layout route)

## Dashboard composition
1. **Header**: Lumifix logo mark + "Lumifix Enterprise", title "Dashboard", subtitle "Hello, Rabi (Dubai Office)"
2. **Stat cards** (2-up grid):
   - Total Revenue (AED) — sum of all `paid` invoice amounts, with up-trend arrow
   - Pending Invoices (AED) — sum of `pending` amounts + count badge
3. **Monthly Performance chart** (Recharts `AreaChart`): Sales (gold) and Expenses (cyan) lines over months, derived from invoice + expense data grouped by month
4. **Action buttons row**: `+ New Invoice`, `+ Add Expense`, `View Reports` — gold outline style; first two open dialogs, third routes to a reports view
5. **Recent Invoices table**: latest 5 entries, columns Invoice / Team / AED / Status; status pill colored green (Paid) or gold (Pending)
6. **Bottom nav**: Dashboard, Invoices, Expenses, Customers, More (lucide icons; active tab in gold)

## Forms (dialogs)
- **New Invoice**: Invoice ID (auto-suggested next `INV-####`), Team (text), Amount (number, AED), Status (Paid/Pending) — inserts into `invoices`
- **Add Expense**: Category, Amount, Date — inserts into `expenses`
- React Hook Form + Zod validation, toast on success

## Data layer (Lovable Cloud)
Tables:
- `invoices` (id uuid, invoice_no text unique, team text, amount numeric, status text check in ('paid','pending'), created_at timestamptz, user_id uuid)
- `expenses` (id, category, amount, occurred_on date, created_at, user_id)

RLS: enable on both; policies allow authenticated users to read/insert/update their own rows. For simplicity (no auth yet), we'll allow public read/insert via RLS so the demo works immediately — flagged for tightening later.

Realtime: subscribe to both tables so stats, chart, and table update live on insert.

## Tech
- React + TanStack Router (existing template)
- Tailwind v4 with semantic tokens added to `src/styles.css` (`--gold`, `--gold-foreground`, `--surface`, etc.)
- shadcn components: Button, Card, Dialog, Input, Select, Table, Badge, Sonner
- Recharts for the chart
- Lucide icons for nav + stat icons
- Supabase client via Lovable Cloud for persistence + realtime

## Out of scope (can add later)
- Auth (login screen, per-user data isolation)
- Edit/delete invoices, pagination
- Real reports page (will be a simple placeholder)
