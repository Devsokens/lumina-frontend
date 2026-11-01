import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SectorGuard } from "@/components/dashboard/sector-guard";

export default function SectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6">
          <SectorGuard>{children}</SectorGuard>
        </main>
      </div>
    </div>
  );
}
