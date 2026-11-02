import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function SectorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
