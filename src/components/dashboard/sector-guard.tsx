"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantSector } from "@/hooks/useTenantSector";
import { navLinks } from "@/lib/navigation";

// Sous-pages ouvertes à un secteur : celles de sa navigation (source unique,
// lib/navigation.ts). Rôle OWNER pour lister toutes les pages du métier.
function sectorPages(sector: string): string[] {
  const base = `/admin/${sector}/`;
  return navLinks(sector, "OWNER")
    .filter((l) => l.href.startsWith(base))
    .map((l) => l.href.slice(base.length).split("/")[0]);
}

// Garde l'interface dans le métier du compte :
// - /admin/{autre-secteur}/... → espace du secteur du compte ;
// - sous-page d'un autre métier (ex. /admin/shop/qr) → tableau de bord ;
// - `allow` : écrans hors /admin réservés à certains secteurs (KDS, scan).
// Les données restent protégées par le backend (filtre par tenant) : ce
// garde évite d'afficher l'interface d'un autre métier.
export function SectorGuard({ children, allow }: { children: React.ReactNode; allow?: string[] }) {
  const { sector, isLoading } = useTenantSector();
  const pathname = usePathname();
  const router = useRouter();

  let target: string | null = null;
  if (sector) {
    if (allow) {
      if (!allow.includes(sector)) target = `/admin/${sector}`;
    } else {
      const [, , urlSector, first] = pathname.split("/");
      if (urlSector && urlSector !== sector) {
        // L'équipe s'appelle /users côté événementiel, /team ailleurs.
        const page = first === "team" || first === "users" ? (sector === "event" ? "users" : "team") : first;
        target = `/admin/${sector}${page && sectorPages(sector).includes(page) ? `/${page}` : ""}`;
      } else if (sector !== "event" && first && !sectorPages(sector).includes(first)) {
        // Arborescence événementielle statique : seuls les comptes event y
        // passent. Les autres partagent /admin/[sector], filtré ici.
        target = `/admin/${sector}`;
      }
    }
  }

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (isLoading || target) return <Skeleton className="m-6 h-96" />;
  return <>{children}</>;
}
