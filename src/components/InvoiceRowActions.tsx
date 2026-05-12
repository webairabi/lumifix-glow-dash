import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import type { Invoice } from "@/hooks/useFinance";

const schema = z.object({
  invoice_no: z.string().trim().min(1).max(40),
  team: z.string().trim().min(1).max(80),
  amount: z.coerce.number().min(0).max(1_000_000_000),
  status: z.enum(["paid", "pending"]),
});
type FormValues = z.infer<typeof schema>;

export function EditInvoiceDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      invoice_no: invoice.invoice_no,
      team: invoice.team,
      amount: Number(invoice.amount),
      status: invoice.status,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        invoice_no: invoice.invoice_no,
        team: invoice.team,
        amount: Number(invoice.amount),
        status: invoice.status,
      });
    }
  }, [open, invoice, form]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    const { error } = await supabase
      .from("invoices")
      .update({
        invoice_no: values.invoice_no,
        team: values.team,
        amount: values.amount,
        status: values.status,
      })
      .eq("id", invoice.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Invoice ${values.invoice_no} updated`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && setOpen(v)}>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 text-muted-foreground hover:text-gold"
        aria-label="Edit invoice"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <DialogContent className="bg-card">
        <DialogHeader><DialogTitle>Edit Invoice</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor={`e-no-${invoice.id}`}>Invoice ID</Label>
            <Input id={`e-no-${invoice.id}`} {...form.register("invoice_no")} />
          </div>
          <div>
            <Label htmlFor={`e-team-${invoice.id}`}>Team / Client</Label>
            <Input id={`e-team-${invoice.id}`} {...form.register("team")} />
          </div>
          <div>
            <Label htmlFor={`e-amt-${invoice.id}`}>Amount (AED)</Label>
            <Input id={`e-amt-${invoice.id}`} type="number" step="0.01" {...form.register("amount")} />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              defaultValue={invoice.status}
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
            <Button
              type="submit"
              disabled={saving}
              className="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteInvoiceDialog({ invoice }: { invoice: Invoice }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setDeleting(true);
    const { error } = await supabase.from("invoices").delete().eq("id", invoice.id);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Invoice ${invoice.invoice_no} deleted`);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          aria-label="Delete invoice"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {invoice.invoice_no}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the invoice for {invoice.team}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
