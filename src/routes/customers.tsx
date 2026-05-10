import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { useInvoices } from "@/hooks/useFinance";
import { formatAED } from "@/lib/format";

export const Route = createFileRoute("/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const { data: invoices = [] } = useInvoices();
  const customers = useMemo(() => {
    const map = new Map<string, { team: string; total: number; count: number }>();
    invoices.forEach((i) => {
      const c = map.get(i.team) ?? { team: i.team, total: 0, count: 0 };
      c.total += Number(i.amount);
      c.count += 1;
      map.set(i.team, c);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [invoices]);

  return (
    <AppShell>
      <h1 className="mb-3 text-2xl font-bold">Customers</h1>
      <div className="space-y-2">
        {customers.map((c) => (
          <Card key={c.team} className="bg-surface border-border/60 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{c.team}</p>
                <p className="text-xs text-muted-foreground">{c.count} invoice{c.count === 1 ? "" : "s"}</p>
              </div>
              <p className="text-sm font-bold tabular-nums text-gold">{formatAED(c.total)} AED</p>
            </div>
          </Card>
        ))}
        {customers.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No customers yet.</p>
        )}
      </div>
    </AppShell>
  );
}
