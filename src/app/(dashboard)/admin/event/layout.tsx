import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function EventAdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
