import { Link } from "@tanstack/react-router";
import { LayoutGrid, FileText, Wallet, Users, MoreHorizontal } from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", Icon: LayoutGrid, exact: true },
  { to: "/invoices", label: "Invoices", Icon: FileText, exact: false },
  { to: "/expenses", label: "Expenses", Icon: Wallet, exact: false },
  { to: "/customers", label: "Customers", Icon: Users, exact: false },
  { to: "/more", label: "More", Icon: MoreHorizontal, exact: false },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[480px] border-t border-border/60 bg-card/95 backdrop-blur">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, Icon, exact }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact }}
              className="flex flex-col items-center gap-1 py-2.5 text-[10px] text-muted-foreground data-[status=active]:text-gold"
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
