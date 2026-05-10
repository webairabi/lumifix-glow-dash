import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useExpenses, type Expense } from "@/hooks/useFinance";
import { formatAED } from "@/lib/format";
import { NewExpenseDialog } from "@/components/InvoiceDialogs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
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

export const Route = createFileRoute("/expenses")({
  component: ExpensesPage,
});

const editSchema = z.object({
  category: z.string().trim().min(1).max(80),
  amount: z.coerce.number().min(0).max(1_000_000_000),
  occurred_on: z.string().min(1),
});
type EditValues = z.infer<typeof editSchema>;

function EditExpenseDialog({
  expense,
  open,
  onClose,
}: {
  expense: Expense;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      category: expense.category,
      amount: Number(expense.amount),
      occurred_on: expense.occurred_on,
    },
  });

  const onSubmit = async (values: EditValues) => {
    const { error } = await supabase
      .from("expenses")
      .update(values)
      .eq("id", expense.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Expense updated");
    qc.invalidateQueries({ queryKey: ["expenses", user?.id] });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card">
        <DialogHeader><DialogTitle>Edit Expense</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>Category</Label>
            <Input {...form.register("category")} />
          </div>
          <div>
            <Label>Amount (AED)</Label>
            <Input type="number" step="0.01" {...form.register("amount")} />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" {...form.register("occurred_on")} />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-gold text-gold-foreground hover:bg-gold/90">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ExpenseRow({ expense }: { expense: Expense }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    const { error } = await supabase.from("expenses").delete().eq("id", expense.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Expense deleted");
    qc.invalidateQueries({ queryKey: ["expenses", user?.id] });
  };

  return (
    <>
      <Card className="bg-surface border-border/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{expense.category}</p>
            <p className="text-xs text-muted-foreground">{expense.occurred_on}</p>
          </div>
          <div className="flex items-center gap-1">
            <p className="text-sm font-bold tabular-nums mr-1">
              {formatAED(Number(expense.amount))} AED
            </p>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-muted-foreground hover:text-gold"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete expense?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Remove "{expense.category}" ({formatAED(Number(expense.amount))} AED)?
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
      {editing && (
        <EditExpenseDialog
          expense={expense}
          open={editing}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

function ExpensesPage() {
  const { data: expenses = [] } = useExpenses();

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
        {expenses.map((e) => (
          <ExpenseRow key={e.id} expense={e} />
        ))}
        {expenses.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No expenses yet.</p>
        )}
      </div>
    </AppShell>
  );
}
