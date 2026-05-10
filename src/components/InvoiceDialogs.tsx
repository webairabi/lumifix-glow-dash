import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Invoice } from "@/hooks/useFinance";

const schema = z.object({
  invoice_no: z.string().trim().min(1).max(40),
  team: z.string().trim().min(1).max(80),
  amount: z.coerce.number().min(0).max(1_000_000_000),
  status: z.enum(["paid", "pending"]),
});
type FormValues = z.infer<typeof schema>;

export function NewInvoiceDialog({
  trigger,
  invoices,
}: {
  trigger: React.ReactNode;
  invoices: Invoice[] | undefined;
}) {
  const [open, setOpen] = useState(false);

  const nextNo = useMemo(() => {
    const nums = (invoices ?? [])
      .map((i) => parseInt(i.invoice_no.replace(/\D/g, ""), 10))
      .filter((n) => !isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return `INV-${String(next).padStart(4, "0")}`;
  }, [invoices]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { invoice_no: nextNo, team: "", amount: 0, status: "pending" },
  });

  const handleOpenChange = (v: boolean) => {
    if (v) form.reset({ invoice_no: nextNo, team: "", amount: 0, status: "pending" });
    setOpen(v);
  };

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase.from("invoices").insert({
      invoice_no: values.invoice_no,
      team: values.team,
      amount: values.amount,
      status: values.status,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Invoice ${values.invoice_no} added`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="invoice_no">Invoice ID</Label>
            <Input id="invoice_no" {...form.register("invoice_no")} />
          </div>
          <div>
            <Label htmlFor="team">Team / Client</Label>
            <Input id="team" placeholder="e.g. Emaar" {...form.register("team")} />
          </div>
          <div>
            <Label htmlFor="amount">Amount (AED)</Label>
            <Input id="amount" type="number" step="0.01" {...form.register("amount")} />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              defaultValue="pending"
              onValueChange={(v) => form.setValue("status", v as "paid" | "pending")}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-gold text-gold-foreground hover:bg-gold/90">
              Save Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const expenseSchema = z.object({
  category: z.string().trim().min(1).max(80),
  amount: z.coerce.number().min(0).max(1_000_000_000),
  occurred_on: z.string().min(1),
});
type ExpenseValues = z.infer<typeof expenseSchema>;

export function NewExpenseDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const form = useForm<ExpenseValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { category: "", amount: 0, occurred_on: today },
  });

  const onSubmit = async (v: ExpenseValues) => {
    const { error } = await supabase.from("expenses").insert(v);
    if (error) { toast.error(error.message); return; }
    toast.success("Expense added");
    setOpen(false);
    form.reset({ category: "", amount: 0, occurred_on: today });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-card">
        <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" placeholder="e.g. Materials" {...form.register("category")} />
          </div>
          <div>
            <Label htmlFor="eamount">Amount (AED)</Label>
            <Input id="eamount" type="number" step="0.01" {...form.register("amount")} />
          </div>
          <div>
            <Label htmlFor="occurred_on">Date</Label>
            <Input id="occurred_on" type="date" {...form.register("occurred_on")} />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-gold text-gold-foreground hover:bg-gold/90">
              Save Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
