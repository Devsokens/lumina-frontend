"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpRight, Bell, ChevronRight, CircleHelp, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EV_PORTAL, initialsOf } from "@/components/events/ev-ui";
import { BASE } from "@/components/dashboard/event-shell/shell-model";
import { UserMenuContent } from "@/components/dashboard/event-shell/shell-menus";
import { useAuth } from "@/hooks/useAuth";
import { useAdminEvent } from "@/hooks/useEvents";
import { useTenantSector } from "@/hooks/useTenantSector";
import { useShellStore } from "@/stores/useShellStore";
import { publicSiteUrl } from "@/lib/tenant-url";
import { cn } from "@/lib/utils";

// En-tête du back-office événementiel (refonte 2026-11, 2e version) : fil
// d'Ariane, recherche (⌘K), « Voir mon site », aide, notifications.

const PAGES: Record<string, string> = {
  "": "Tableau de bord",
  events: "Mes événements",
  users: "Mon équipe",
  settings: "Paramètres",
  audit: "Journal d'audit",
  showcase: "Mon site web",
};

const RUBRIQUES: Record<string, string> = {
  legal: "Identité légale",
  paiements: "Paiements",
  messages: "E-mails et messages",
  securite: "Sécurité des billets",
  profil: "Mon profil",
  abonnement: "Abonnement",
};

function EventTitle({ id }: { id: string }) {
  const { data } = useAdminEvent(id);
  return <>{data?.title ?? "Événement"}</>;
}

function Crumbs() {
  const pathname = usePathname();
  const search = useSearchParams();
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length).replace(/^\//, "") : "";
  const [section, id] = rest.split("/");
  const page = PAGES[section ?? ""] ?? "";
  const rubrique = section === "settings" ? RUBRIQUES[search.get("rubrique") ?? ""] : undefined;
  const child = section === "events" && id ? <EventTitle id={id} /> : rubrique;

  return (
    <nav aria-label="Fil d'Ariane" className="flex min-w-0 items-center gap-2 text-sm">
      {child ? (
        <>
          <Link href={`${BASE}/${section}`} className="hidden shrink-0 text-ev-muted hover:text-ev-ink sm:inline">
            {page}
          </Link>
          <ChevronRight className="hidden size-4 shrink-0 text-ev-muted sm:block" />
          <span className="truncate font-semibold text-ev-ink">{child}</span>
        </>
      ) : (
        <span className="truncate font-semibold text-ev-ink">{page}</span>
      )}
    </nav>
  );
}

export function EventHeader() {
  const { user } = useAuth();
  const { tenant } = useTenantSector();
  const collapsed = useShellStore((s) => s.collapsed);
  const setPaletteOpen = useShellStore((s) => s.setPaletteOpen);
  const setShortcutsOpen = useShellStore((s) => s.setShortcutsOpen);
  const userName = user?.fullName || user?.email || "Administrateur";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-ev-border bg-ev-surface/95 px-4 backdrop-blur-md sm:h-[68px] sm:px-6 lg:px-8">
      <Suspense fallback={<span />}>
        <Crumbs />
      </Suspense>

      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="hidden h-10 w-[200px] items-center gap-2.5 rounded-[10px] border border-ev-border bg-ev-bg px-3 text-left text-sm text-ev-muted transition-colors hover:border-ev-dash md:flex lg:w-[312px]"
        >
          <Search className="size-4 shrink-0" />
          <span className="flex-1 truncate">Rechercher ou aller à…</span>
          <kbd className="rounded-[6px] border border-ev-border bg-ev-surface px-1.5 py-0.5 font-ev-mono text-[11px]">⌘K</kbd>
        </button>
        <button type="button" aria-label="Rechercher" onClick={() => setPaletteOpen(true)} className="flex size-10 items-center justify-center rounded-[10px] border border-ev-border bg-ev-surface text-ev-ink2 md:hidden">
          <Search className="size-4" />
        </button>
        {tenant && (
          <a
            href={publicSiteUrl(tenant.slug)}
            target="_blank"
            rel="noreferrer"
            className="hidden h-10 items-center gap-1.5 rounded-[10px] border border-ev-border bg-ev-surface px-3.5 text-sm font-medium text-ev-ink transition-colors hover:bg-ev-soft sm:flex"
          >
            Voir mon site <ArrowUpRight className="size-4" />
          </a>
        )}
        <button type="button" aria-label="Aide et raccourcis" onClick={() => setShortcutsOpen(true)} className="hidden size-10 items-center justify-center rounded-[10px] text-ev-ink2 hover:bg-ev-soft sm:flex">
          <CircleHelp className="size-[18px]" />
        </button>
        <button type="button" aria-label="Notifications" onClick={() => toast.info("Aucune notification.")} className="relative flex size-10 items-center justify-center rounded-[10px] text-ev-ink2 hover:bg-ev-soft">
          <Bell className="size-[18px]" />
        </button>
        {/* Compte : dans la barre latérale dépliée ; ici quand elle est repliée, et sur téléphone. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Mon compte" className={cn("flex size-10 items-center justify-center rounded-full bg-ev-primary text-xs font-semibold text-white", !collapsed && "sm:hidden")}>
              {initialsOf(userName)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={cn(EV_PORTAL, "w-[300px] rounded-[14px] p-0")}>
            <UserMenuContent name={userName} contact={user?.email ?? user?.phone ?? ""} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
