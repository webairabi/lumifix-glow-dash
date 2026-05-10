import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useExpenses } from "@/hooks/useFinance";
import { formatAED } from "@/lib/format";
import { NewExpenseDialog } from "@/components/InvoiceDialogs";

export const Route = createFileRoute("/expenses")({
  component: ExpensesPage,
});

function ExpensesPage() {
  const { data: expenses = [] } = useExpenses();
  const sorted = [...expenses].sort((a, b) => b.occurred_on.localeCompare(a.occurred_on));
  return (
    <AppShell>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <NewExpenseDialog
          trigger={
            <Button size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">
              <Plus className="h-4 w-4" /> Add
            </Button>
          }
        />
      </div>
      <div className="space-y-2">
        {sorted.map((e) => (
          <Card key={e.id} className="bg-surface border-border/60 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{e.category}</p>
                <p className="text-xs text-muted-foreground">{e.occurred_on}</p>
              </div>
              <p className="text-sm font-bold tabular-nums">{formatAED(Number(e.amount))} AED</p>
            </div>
          </Card>
        ))}
        {sorted.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No expenses yet.</p>
        )}
      </div>
    </AppShell>
  );
}
