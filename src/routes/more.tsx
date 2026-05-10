import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { HelpCircle, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/more")({
  component: MorePage,
});

function MorePage() {
  const { user, signOut } = useAuth();
  const email = user?.email ?? "";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <AppShell>
      <h1 className="mb-3 text-2xl font-bold">More</h1>

      <Card className="mb-3 bg-surface border-border/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-gold">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{email}</p>
            <p className="text-xs text-muted-foreground">Signed in</p>
          </div>
        </div>
      </Card>

      <Card className="bg-surface border-border/60 divide-y divide-border/60">
        <button
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
          onClick={() => toast.info("Help & Support coming soon")}
        >
          <HelpCircle className="h-4 w-4 text-gold flex-shrink-0" />
          <span className="text-sm">Help & Support</span>
        </button>
        <button
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 text-destructive flex-shrink-0" />
          <span className="text-sm text-destructive">Sign Out</span>
        </button>
      </Card>
    </AppShell>
  );
}
