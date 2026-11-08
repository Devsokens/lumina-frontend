"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { BarChart3, CalendarDays, Globe, Plus, ScanLine, Search, Settings, User, UserPlus } from "lucide-react";
import { EV_PORTAL } from "@/components/events/ev-ui";
import { BASE, NAV_ICON, keyOf, navGroups } from "@/components/dashboard/event-shell/shell-model";
import { NavIcon } from "@/components/dashboard/event-sidebar";
import { STATUS_META } from "@/lib/event-meta";
import { useAdminEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { useTenantSector } from "@/hooks/useTenantSector";
import { useShellStore } from "@/stores/useShellStore";
import { publicSiteUrl } from "@/lib/tenant-url";
import { cn } from "@/lib/utils";

// Palette « Rechercher ou aller à… » (refonte 2026-11) : événements,
// pages et actions, au clavier (↑ ↓, Entrée, Échap).

type Item = { id: string; section: "ÉVÉNEMENTS" | "PAGES" | "ACTIONS"; title: string; sub?: string; icon: ReactNode; hint?: string; run: () => void };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const SETTINGS_PAGES: [string, string][] = [
  ["abonnement", "Abonnement"],
  ["paiements", "Paiements"],
  ["messages", "E-mails et messages"],
  ["legal", "Identité légale"],
  ["profil", "Mon profil"],
];

export function CommandPalette() {
  const open = useShellStore((s) => s.paletteOpen);
  const setOpen = useShellStore((s) => s.setPaletteOpen);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(12,22,18,.35)] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(EV_PORTAL, "fixed left-1/2 top-[12vh] z-50 flex max-h-[72vh] w-[min(667px,calc(100%-24px))] -translate-x-1/2 flex-col overflow-hidden rounded-[16px] bg-ev-surface text-ev-ink shadow-[0_30px_80px_rgba(12,22,18,.3)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95")}
        >
          <DialogPrimitive.Title className="sr-only">Rechercher ou aller à</DialogPrimitive.Title>
          {open && <PaletteBody close={() => setOpen(false)} />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function PaletteBody({ close }: { close: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const { tenant } = useTenantSector();
  const { data: events } = useAdminEvents();
  const setCreateEventOpen = useShellStore((s) => s.setCreateEventOpen);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const canCreate = user?.role === "OWNER" || user?.role === "MANAGER";
  const isOwner = user?.role === "OWNER";

  const items = useMemo<Item[]>(() => {
    const q = norm(query.trim());
    const match = (s: string) => !q || norm(s).includes(q);
    const go = (href: string) => () => {
      close();
      router.push(href);
    };
    const list: Item[] = [];

    const found = (events ?? [])
      .filter((e) => match(e.title))
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .slice(0, q ? 5 : 3);
    for (const e of found) {
      const sold = e.ticketTypes.reduce((n, t) => n + (t.sold ?? 0), 0);
      const date = new Date(e.startDate).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
      list.push({
        id: `e-${e.id}`,
        section: "ÉVÉNEMENTS",
        title: e.title,
        sub: `${date.charAt(0).toUpperCase()}${date.slice(1)} · ${STATUS_META[e.status]?.label ?? e.status} · ${sold} billet${sold > 1 ? "s" : ""}`,
        icon: <CalendarDays className="size-4" />,
        run: go(`${BASE}/events/${e.id}`),
      });
    }
    // Pages de l'événement trouvé en premier.
    if (q && found[0]) {
      const e = found[0];
      list.push({ id: `p-${e.id}`, section: "PAGES", title: "Participants", sub: e.title, icon: <User className="size-4" />, run: go(`${BASE}/events/${e.id}?tab=participants`) });
      list.push({ id: `s-${e.id}`, section: "PAGES", title: "Statistiques", sub: e.title, icon: <BarChart3 className="size-4" />, run: go(`${BASE}/events/${e.id}?tab=statistiques`) });
    }
    for (const g of navGroups(user?.role)) {
      for (const l of g.links) {
        if (!match(l.label)) continue;
        const key = keyOf(l.href);
        list.push({ id: `n-${l.href}`, section: "PAGES", title: l.label, sub: l.hint, icon: <NavIcon d={NAV_ICON[key]} size={16} />, run: go(l.href) });
      }
    }
    if (q && isOwner) {
      for (const [k, label] of SETTINGS_PAGES) {
        if (match(label)) list.push({ id: `r-${k}`, section: "PAGES", title: label, sub: "Paramètres", icon: <Settings className="size-4" />, run: go(`${BASE}/settings?rubrique=${k}`) });
      }
    }

    const actions: Item[] = [];
    if (canCreate)
      actions.push({
        id: "a-create",
        section: "ACTIONS",
        title: "Créer un événement",
        sub: "Nouvel événement",
        icon: <Plus className="size-4" />,
        hint: "C",
        run: () => {
          close();
          setCreateEventOpen(true);
        },
      });
    actions.push({ id: "a-scan", section: "ACTIONS", title: "Scanner les pass", sub: "Contrôle d'accès", icon: <ScanLine className="size-4" />, hint: "S", run: go("/scan") });
    if (isOwner) actions.push({ id: "a-invite", section: "ACTIONS", title: "Inviter un membre", sub: "Équipe", icon: <UserPlus className="size-4" />, run: go(`${BASE}/users?inviter=1`) });
    if (tenant)
      actions.push({
        id: "a-site",
        section: "ACTIONS",
        title: "Voir mon site",
        sub: "Nouvel onglet",
        icon: <Globe className="size-4" />,
        run: () => {
          close();
          window.open(publicSiteUrl(tenant.slug), "_blank", "noopener");
        },
      });
    return [...list, ...actions.filter((a) => match(`${a.title} ${a.sub ?? ""}`))];
  }, [query, events, user?.role, tenant, canCreate, isOwner, close, router, setCreateEventOpen]);

  const current = Math.min(index, Math.max(0, items.length - 1));

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((current + 1) % Math.max(1, items.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((current - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[current]?.run();
    }
  }

  let lastSection = "";
  return (
    <div onKeyDown={onKey} className="flex min-h-0 flex-col">
      <label className="flex h-[62px] shrink-0 items-center gap-3 border-b border-ev-line px-5">
        <Search className="size-5 shrink-0 text-ev-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
          }}
          placeholder="Rechercher un événement, une page, une action…"
          aria-label="Rechercher"
          className="min-w-0 flex-1 border-0 bg-transparent text-[17px] text-ev-ink outline-none placeholder:text-ev-muted"
        />
        <kbd className="rounded-[6px] border border-ev-border px-2 py-0.5 text-xs text-ev-muted">Échap</kbd>
      </label>
      <div role="listbox" aria-label="Résultats" className="min-h-0 flex-1 overflow-y-auto p-2">
        {items.length === 0 && <p className="px-3 py-8 text-center text-sm text-ev-muted">Aucun résultat pour « {query} ».</p>}
        {items.map((it, i) => {
          const head = it.section !== lastSection ? it.section : null;
          lastSection = it.section;
          const sel = i === current;
          return (
            <div key={it.id}>
              {head && <div className="px-3 pb-1.5 pt-3 text-[11px] font-semibold tracking-[0.08em] text-ev-muted">{head}</div>}
              <button
                type="button"
                role="option"
                aria-selected={sel}
                onMouseEnter={() => setIndex(i)}
                onClick={it.run}
                className={cn("flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left", sel && "bg-ev-selected")}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-ev-bg text-ev-ink2">{it.icon}</span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[15px]">{it.title}</span>
                  {it.sub && <span className="truncate text-[13px] text-ev-muted">{it.sub}</span>}
                </span>
                <span className="shrink-0 font-ev-mono text-xs text-ev-muted">{sel ? "↵" : it.hint}</span>
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center gap-4 border-t border-ev-line bg-ev-soft px-4 py-2.5 text-xs text-ev-muted">
        <span>↑ ↓ naviguer</span>
        <span>↵ ouvrir</span>
        <span>Échap fermer</span>
      </div>
    </div>
  );
}
