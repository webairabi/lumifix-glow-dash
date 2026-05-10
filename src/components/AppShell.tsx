import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

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
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-gold-foreground font-bold">
        L
      </div>
      <span className="text-base font-semibold tracking-tight">Lumifix Enterprise</span>
    </div>
  );
}
