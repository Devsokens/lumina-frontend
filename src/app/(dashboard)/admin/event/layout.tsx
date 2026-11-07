import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EventShellHosts } from "@/components/dashboard/event-shell/shell-hosts";
import { eventFontVariables } from "@/lib/event-fonts";

// Back-office événementiel : palette et typographie de la refonte du module
// Événements (classe .ev, globals.css ; polices lib/event-fonts.ts).
export default function EventAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`ev ${eventFontVariables}`}>
      <DashboardShell>{children}</DashboardShell>
      <EventShellHosts />
    </div>
  );
}
