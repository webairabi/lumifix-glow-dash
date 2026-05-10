import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { useInvoices, useExpenses } from "@/hooks/useFinance";
import { formatAED } from "@/lib/format";
import { PerformanceChart } from "@/components/PerformanceChart";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { data: invoices = [] } = useInvoices();
  const { data: expenses = [] } = useExpenses();
  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
  const pending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + Number(i.amount), 0);
  const totalExp = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const net = paid - totalExp;

  return (
    <AppShell>
      <h1 className="mb-3 text-2xl font-bold">Reports</h1>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Paid Revenue" value={paid} accent="text-success" />
        <Stat label="Pending" value={pending} accent="text-gold" />
        <Stat label="Expenses" value={totalExp} accent="text-info" />
        <Stat label="Net" value={net} accent={net >= 0 ? "text-success" : "text-destructive"} />
      </div>
      <Card className="mt-3 bg-surface border-border/60 p-3">
        <p className="mb-2 text-sm font-semibold">6-month trend</p>
        <PerformanceChart invoices={invoices} expenses={expenses} />
      </Card>
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <Card className="bg-surface border-border/60 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-bold tabular-nums ${accent}`}>{formatAED(value)} <span className="text-xs text-muted-foreground">AED</span></p>
    </Card>
  );
}
