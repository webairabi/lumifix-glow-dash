import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, IndianRupee, Users, Plus, FileBarChart2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInvoices, useExpenses, type Invoice } from "@/hooks/useFinance";
import { EditInvoiceDialog, DeleteInvoiceDialog } from "@/components/InvoiceRowActions";
import { ViewInvoiceDialog } from "@/components/ViewInvoiceDialog";
import { formatAED } from "@/lib/format";
import { PerformanceChart } from "@/components/PerformanceChart";
import { NewInvoiceDialog, NewExpenseDialog } from "@/components/InvoiceDialogs";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumifix Enterprise — Dashboard" },
      { name: "description", content: "Real-time finance dashboard for Lumifix Enterprise." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: invoices = [] } = useInvoices();
  const { data: expenses = [] } = useExpenses();

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.amount), 0);
  const pendingInvoices = invoices.filter((i) => i.status === "pending");
  const pendingTotal = pendingInvoices.reduce((s, i) => s + Number(i.amount), 0);
  const recent = invoices.slice(0, 5);

  const greeting = user?.user_metadata?.full_name
    ? `Hello, ${user.user_metadata.full_name}`
    : "Welcome back";

  return (
    <AppShell>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mb-4 text-sm text-muted-foreground">{greeting}</p>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-surface border-border/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/15 text-gold">
              <IndianRupee className="h-4 w-4" />
            </span>
            <Users className="h-4 w-4 text-gold/70" />
          </div>
          <p className="text-[11px] text-muted-foreground">Total Revenue (AED)</p>
          <div className="mt-1 flex items-end gap-1">
            <p className="text-xl font-bold leading-none">{formatAED(totalRevenue)}</p>
            <ArrowUpRight className="h-4 w-4 text-success" />
          </div>
        </Card>

        <Card className="bg-surface border-border/60 p-3">
          <p className="text-[11px] text-muted-foreground">Pending Invoices</p>
          <p className="mt-2 text-xl font-bold leading-none">
            {formatAED(pendingTotal)} <span className="text-xs font-medium text-muted-foreground">AED</span>
          </p>
          <Badge className="mt-2 bg-gold/20 text-gold hover:bg-gold/20 border-0 text-[10px]">
            {pendingInvoices.length} Pending
          </Badge>
        </Card>
      </div>

      <Card className="mt-3 bg-surface border-border/60 p-3">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-semibold">Monthly Performance</p>
          <div className="flex gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-gold" /> Sales
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-info" /> Expenses
            </span>
          </div>
        </div>
        <PerformanceChart invoices={invoices} expenses={expenses} />
      </Card>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <NewInvoiceDialog
          invoices={invoices}
          trigger={
            <Button variant="outline" className="border-gold/60 text-gold hover:bg-gold/10 hover:text-gold text-xs">
              <Plus className="h-3.5 w-3.5" /> New Invoice
            </Button>
          }
        />
        <NewExpenseDialog
          trigger={
            <Button variant="outline" className="border-gold/60 text-gold hover:bg-gold/10 hover:text-gold text-xs">
              <Plus className="h-3.5 w-3.5" /> Add Expense
            </Button>
          }
        />
        <Button asChild variant="outline" className="border-gold/60 text-gold hover:bg-gold/10 hover:text-gold text-xs">
          <Link to="/reports">
            <FileBarChart2 className="h-3.5 w-3.5" /> View Reports
          </Link>
        </Button>
      </div>

      <Card className="mt-3 bg-surface border-border/60 p-3">
        <p className="mb-2 text-sm font-semibold">Recent Invoices</p>
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-x-2 gap-y-2 text-xs">
          <span className="text-muted-foreground">Invoice</span>
          <span className="text-muted-foreground">Team</span>
          <span className="text-right text-muted-foreground">AED</span>
          <span className="text-right text-muted-foreground">Status</span>
          <span className="sr-only">Actions</span>
          {recent.map((inv) => (
            <RecentRow key={inv.id} inv={inv} />
          ))}
          {recent.length === 0 && (
            <span className="col-span-5 py-4 text-center text-muted-foreground">No invoices yet.</span>
          )}
        </div>
      </Card>
    </AppShell>
  );
}

function RecentRow({ inv }: { inv: Invoice }) {
  return (
    <>
      <span className="font-medium">{inv.invoice_no}</span>
      <span className="truncate">{inv.team}</span>
      <span className="text-right tabular-nums">{formatAED(Number(inv.amount))}</span>
      <span className="text-right">
        {inv.status === "paid" ? (
          <Badge className="bg-success/20 text-success hover:bg-success/20 border-0 text-[10px]">Paid</Badge>
        ) : (
          <Badge className="bg-gold/20 text-gold hover:bg-gold/20 border-0 text-[10px]">Pending</Badge>
        )}
      </span>
      <span className="flex justify-end gap-0.5">
        <ViewInvoiceDialog invoice={inv} />
        <EditInvoiceDialog invoice={inv} />
        <DeleteInvoiceDialog invoice={inv} />
      </span>
    </>
  );
}
