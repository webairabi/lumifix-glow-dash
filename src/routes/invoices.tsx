import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useInvoices } from "@/hooks/useFinance";
import { formatAED } from "@/lib/format";
import { NewInvoiceDialog } from "@/components/InvoiceDialogs";
import { EditInvoiceDialog, DeleteInvoiceDialog } from "@/components/InvoiceRowActions";

export const Route = createFileRoute("/invoices")({
  component: InvoicesPage,
});

function InvoicesPage() {
  const { data: invoices = [] } = useInvoices();
  return (
    <AppShell>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <NewInvoiceDialog
          invoices={invoices}
          trigger={
            <Button size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">
              <Plus className="h-4 w-4" /> New
            </Button>
          }
        />
      </div>
      <div className="space-y-2">
        {invoices.map((inv) => (
          <Card key={inv.id} className="bg-surface border-border/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{inv.invoice_no}</p>
                <p className="truncate text-xs text-muted-foreground">{inv.team}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums">{formatAED(Number(inv.amount))} AED</p>
                {inv.status === "paid" ? (
                  <Badge className="bg-success/20 text-success hover:bg-success/20 border-0 text-[10px]">Paid</Badge>
                ) : (
                  <Badge className="bg-gold/20 text-gold hover:bg-gold/20 border-0 text-[10px]">Pending</Badge>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <EditInvoiceDialog invoice={inv} />
                <DeleteInvoiceDialog invoice={inv} />
              </div>
            </div>
          </Card>
        ))}
        {invoices.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No invoices yet.</p>
        )}
      </div>
    </AppShell>
  );
}
