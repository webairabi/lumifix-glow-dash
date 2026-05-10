import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { Invoice, Expense } from "@/hooks/useFinance";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function PerformanceChart({
  invoices,
  expenses,
}: {
  invoices: Invoice[];
  expenses: Expense[];
}) {
  const data = useMemo(() => {
    const buckets: Record<string, { month: string; sales: number; expenses: number; idx: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      buckets[key] = { month: MONTHS[d.getMonth()], sales: 0, expenses: 0, idx: 5 - i };
    }
    invoices.forEach((inv) => {
      const d = new Date(inv.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (buckets[key]) buckets[key].sales += Number(inv.amount);
    });
    expenses.forEach((e) => {
      const d = new Date(e.occurred_on);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (buckets[key]) buckets[key].expenses += Number(e.amount);
    });
    return Object.values(buckets).sort((a, b) => a.idx - b.idx);
  }, [invoices, expenses]);

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--info)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--info)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "var(--muted-foreground)" }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
          <Area type="monotone" dataKey="sales" name="Sales" stroke="var(--gold)" strokeWidth={2} fill="url(#gSales)" />
          <Area type="monotone" dataKey="expenses" name="Expenses" stroke="var(--info)" strokeWidth={2} fill="url(#gExp)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
