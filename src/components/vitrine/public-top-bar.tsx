"use client";

import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";

type PublicTopBarProps = {
  // Niveau précédent (par défaut : l'accueil du site).
  backHref?: string;
  backLabel?: string;
};

// Barre collante des pages du site public (détail d'un événement, liste,
// paiement, confirmation) : toujours un retour au niveau précédent et un
// accès direct à l'accueil, sur mobile comme sur ordinateur.
export function PublicTopBar({ backHref, backLabel = "Retour" }: PublicTopBarProps) {
  const tenant = useTenant();
  const home = `/${tenant.slug}`;
  const config = tenant.config as { showcase?: { orgLogoUrl?: string | null } } | undefined;
  const logo = config?.showcase?.orgLogoUrl;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-2 px-4">
        <Link
          href={backHref ?? home}
          className="inline-flex min-h-10 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
          <span>{backLabel}</span>
        </Link>

        <Link
          href={home}
          aria-label={`Accueil — ${tenant.name}`}
          className="inline-flex min-h-10 min-w-0 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-foreground hover:bg-muted"
        >
          {logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logo} alt="" className="size-7 shrink-0 rounded-lg object-contain" />
          ) : (
            <Home className="size-5 shrink-0" />
          )}
          <span className="truncate">Accueil</span>
        </Link>
      </div>
    </header>
  );
}
