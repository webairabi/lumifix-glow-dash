import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/contexts/AuthContext";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[480px] px-4 pt-5 pb-24">
        <Header />
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

function Header() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name as string | undefined;
  const email = user?.email ?? "";
  const label = displayName ?? email.split("@")[0] ?? "User";

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-gold-foreground font-bold text-sm">
          {label.charAt(0).toUpperCase()}
        </div>
        <span className="text-base font-semibold tracking-tight">Lumifix Enterprise</span>
      </div>
      <span className="text-xs text-muted-foreground truncate max-w-[120px]">{email}</span>
    </div>
  );
}
