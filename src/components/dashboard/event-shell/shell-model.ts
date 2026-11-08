import { useMemo } from "react";
import { sidebarLinks, type NavLink } from "@/lib/navigation";
import { useAdminTenantInfo } from "@/hooks/useAdmin";
import { useAdminEvents } from "@/hooks/useEvents";
import type { Role } from "@/lib/constants";
import { FEATURES } from "@/lib/features";
import type { Tenant } from "@/types/api";

// Cadre du back-office événementiel (refonte 2026-11) : navigation groupée,
// icônes, formule et étapes de configuration.

export const BASE = "/admin/event";

// Tracés 24 × 24 (trait 2) de la maquette, par destination.
export const NAV_ICON: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  events: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
  scan: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10",
  showcase: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z",
  users: "M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-1a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  audit: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
};

export function keyOf(href: string): keyof typeof NAV_ICON {
  if (href === BASE) return "home";
  if (href === "/scan") return "scan";
  const last = href.split("/").pop() ?? "";
  return (last in NAV_ICON ? last : "home") as keyof typeof NAV_ICON;
}

// Groupes de la barre latérale ; les noms des modules restent ceux de l'app.
const GROUPS: { title: string; keys: (keyof typeof NAV_ICON)[] }[] = [
  { title: "BILLETTERIE", keys: ["home", "events", "scan"] },
  { title: "VITRINE", keys: ["showcase"] },
  { title: "ORGANISATION", keys: ["users", "audit", "settings"] },
];

export function navGroups(role: Role | undefined): { title: string; links: NavLink[] }[] {
  const links = sidebarLinks("event", role);
  return GROUPS.map((g) => ({ title: g.title, links: g.keys.map((k) => links.find((l) => keyOf(l.href) === k)).filter((l): l is NavLink => !!l) })).filter((g) => g.links.length > 0);
}

export const PLAN_NAME: Record<string, string> = { FREE: "Gratuite", STANDARD: "Standard", PRO: "Pro", ENTERPRISE: "Business" };

export function logoOf(tenant: Tenant | undefined) {
  const v = (tenant?.config as { logoUrl?: unknown } | undefined)?.logoUrl;
  return typeof v === "string" && v ? v : null;
}

export type SetupStep = { key: string; label: string; done: boolean; href: string };

// « Configuration n / 5 » : ce qui rend l'organisation prête à vendre.
export function useSetupSteps(): { steps: SetupStep[]; done: number } {
  const { data: tenant } = useAdminTenantInfo();
  const { data: events } = useAdminEvents();
  return useMemo(() => {
    const config = (tenant?.config ?? {}) as Record<string, unknown>;
    const settings = (tenant?.settings ?? {}) as { payouts?: { accounts?: { verifiedAt: string | null }[] } };
    const str = (v: unknown) => typeof v === "string" && v.trim().length > 0;
    const steps: SetupStep[] = [
      { key: "identity", label: "Logo et présentation", done: !!logoOf(tenant) && str(config.description), href: `${BASE}/settings` },
      { key: "contact", label: "Coordonnées", done: str(config.phone) && str(config.address), href: `${BASE}/settings` },
      {
        key: "payout",
        label: FEATURES.sms ? "Compte de versement vérifié" : "Compte de versement ajouté",
        done: !!settings.payouts?.accounts?.some((a) => a.verifiedAt || !FEATURES.sms),
        href: `${BASE}/settings?rubrique=paiements`,
      },
      { key: "event", label: "Premier événement publié", done: (events ?? []).some((e) => e.status !== "DRAFT"), href: `${BASE}/events` },
      { key: "site", label: "Mon site web publié", done: !!config.showcase, href: `${BASE}/showcase` },
    ];
    return { steps, done: steps.filter((s) => s.done).length };
  }, [tenant, events]);
}

// Événements « actifs » (pastille du menu) : ni terminés ni annulés.
export function useActiveEventsCount() {
  const { data: events } = useAdminEvents();
  return (events ?? []).filter((e) => e.status !== "COMPLETED" && e.status !== "CANCELLED").length;
}
