import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SectorGuard } from "@/components/dashboard/sector-guard";

// Cadre unique de tous les back-offices (événementiel et autres secteurs) :
// même largeur de contenu et même comportement responsive partout.
// `min-w-0` est indispensable : sans lui, la colonne flex ne peut pas
// rétrécir sous la largeur de son contenu (tableau, grille) et toute la
// page défile horizontalement sur mobile et tablette.
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="mobile-readable min-w-0 flex-1 p-4 sm:p-6">
          <div className="mx-auto w-full min-w-0 max-w-7xl">
            <SectorGuard>{children}</SectorGuard>
          </div>
        </main>
      </div>
    </div>
  );
}
