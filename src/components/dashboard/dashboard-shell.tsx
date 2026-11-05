import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SectorGuard } from "@/components/dashboard/sector-guard";
import { MobileTabBar } from "@/components/dashboard/mobile-tab-bar";
import { ShellMain } from "@/components/dashboard/shell-main";

// Cadre unique de tous les back-offices (événementiel et autres secteurs) :
// même largeur de contenu et même comportement responsive partout.
// `min-w-0` est indispensable : sans lui, la colonne flex ne peut pas
// rétrécir sous la largeur de son contenu (tableau, grille) et toute la
// page défile horizontalement sur mobile et tablette.
// Téléphone : pas de barre latérale, une barre d'onglets en bas (MobileTabBar) ;
// le contenu garde de la place en bas pour ne jamais passer dessous.
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <ShellMain>
          <SectorGuard>{children}</SectorGuard>
        </ShellMain>
      </div>
      <MobileTabBar />
    </div>
  );
}
