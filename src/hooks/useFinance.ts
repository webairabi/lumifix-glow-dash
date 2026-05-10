import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Invoice = {
  id: string;
  invoice_no: string;
  team: string;
  amount: number;
  status: "paid" | "pending";
  created_at: string;
};

export type Expense = {
  id: string;
  category: string;
  amount: number;
  occurred_on: string;
  created_at: string;
};

export function useInvoices() {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel("invoices-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, () => {
        qc.invalidateQueries({ queryKey: ["invoices"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["invoices"],
    queryFn: async (): Promise<Invoice[]> => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Invoice[];
    },
  });
}

export function useExpenses() {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel("expenses-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, () => {
        qc.invalidateQueries({ queryKey: ["expenses"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["expenses"],
    queryFn: async (): Promise<Expense[]> => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("occurred_on", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Expense[];
    },
  });
}
