import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Settings, HelpCircle, Bell, LogOut } from "lucide-react";

export const Route = createFileRoute("/more")({
  component: MorePage,
});

const items = [
  { Icon: Settings, label: "Settings" },
  { Icon: Bell, label: "Notifications" },
  { Icon: HelpCircle, label: "Help & Support" },
  { Icon: LogOut, label: "Sign Out" },
];

function MorePage() {
  return (
    <AppShell>
      <h1 className="mb-3 text-2xl font-bold">More</h1>
      <Card className="bg-surface border-border/60 divide-y divide-border/60">
        {items.map(({ Icon, label }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3">
            <Icon className="h-4 w-4 text-gold" />
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </Card>
    </AppShell>
  );
}
