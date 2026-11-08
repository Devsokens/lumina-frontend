"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { initialsOf, EV_PORTAL } from "@/components/events/ev-ui";
import { sidebarLinks } from "@/lib/navigation";
import { BASE, NAV_ICON, PLAN_NAME, keyOf, useActiveEventsCount, useSetupSteps } from "@/components/dashboard/event-shell/shell-model";
import { OrgAvatar, OrgMenuContent, SetupMenuContent, UserMenuContent } from "@/components/dashboard/event-shell/shell-menus";
import { useAuth } from "@/hooks/useAuth";
import { useTenantSector } from "@/hooks/useTenantSector";
import { useShellStore } from "@/stores/useShellStore";
import { eventFontVariables } from "@/lib/event-fonts";
import { cn } from "@/lib/utils";

// Barre latérale du back-office événementiel (refonte Claude Design 2026-11,
// 2e version) : sélecteur d'organisation, « Créer un événement », modules
// groupés (noms de l'app inchangés), configuration, compte, mode replié.

const ROLE_LABELS: Record<string, string> = { OWNER: "Propriétaire", MANAGER: "Manager", STAFF: "Scanner", KITCHEN: "Cuisine", CASHIER: "Caisse" };

export function NavIcon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      <path d={d} />
    </svg>
  );
}

function GiyaxMark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/giyax-logo-white.png"
      alt="GiyaX"
      width={120}
      height={51}
      className="h-5 w-auto object-contain select-none"
      draggable={false}
    />
  );
}

export function EventSidebar() {
  const pathname = usePathname();
  const { tenant } = useTenantSector();
  const { user } = useAuth();
  const collapsed = useShellStore((s) => s.collapsed);
  const setCollapsed = useShellStore((s) => s.setCollapsed);
  const hydrate = useShellStore((s) => s.hydrate);
  const setCreateEventOpen = useShellStore((s) => s.setCreateEventOpen);
  const links = sidebarLinks("event", user?.role);
  const { steps, done } = useSetupSteps();
  const activeEvents = useActiveEventsCount();
  const isOwner = user?.role === "OWNER";
  const canCreate = isOwner || user?.role === "MANAGER";
  const orgName = tenant?.name || "Mon espace";
  const userName = user?.fullName || user?.email || "Administrateur";
  const plan = PLAN_NAME[tenant?.plan ?? "FREE"] ?? "Gratuite";

  useEffect(() => hydrate(), [hydrate]);

  const isActive = (href: string) => (href === BASE ? pathname === BASE : pathname.startsWith(href));

  return (
    <aside
      aria-label="Menu principal"
      className={cn(
        "ev sticky top-0 z-30 hidden h-screen shrink-0 flex-col bg-[#0B3B2E] text-[#DCE8E1] transition-[width] duration-200 sm:flex",
        collapsed ? "w-[76px] items-center px-3 py-4" : "w-[264px] px-3.5 pb-0 pt-3.5",
        eventFontVariables
      )}
    >
      {/* Organisation */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {collapsed ? (
            <button type="button" data-tour="org" aria-label={`Organisation : ${orgName}`} className="rounded-[12px] transition-opacity hover:opacity-90">
              <OrgAvatar tenant={tenant} name={orgName} className="size-11" />
            </button>
          ) : (
            <button type="button" data-tour="org" className="flex items-center gap-2.5 rounded-[12px] bg-white/[0.06] p-2 text-left transition-colors hover:bg-white/10">
              <OrgAvatar tenant={tenant} name={orgName} className="size-9" />
              <span className="flex min-w-0 flex-1 flex-col leading-[1.25]">
                <span className="truncate text-[15px] font-semibold text-white">{orgName}</span>
                <span className="truncate text-xs text-[#9FBDB0]">Formule {plan}</span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-[#9FBDB0]" />
            </button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent side={collapsed ? "right" : "bottom"} align="start" className={cn(EV_PORTAL, "w-[320px] rounded-[14px] p-0")}>
          <OrgMenuContent tenant={tenant} isOwner={isOwner} />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Créer un événement */}
      {canCreate &&
        (collapsed ? (
          <button
            type="button"
            data-tour="create"
            aria-label="Créer un événement"
            title="Créer un événement"
            onClick={() => setCreateEventOpen(true)}
            className="mt-4 flex size-11 items-center justify-center rounded-[10px] bg-white/10 text-white transition-colors hover:bg-white/15"
          >
            <Plus className="size-5" />
          </button>
        ) : (
          <button
            type="button"
            data-tour="create"
            onClick={() => setCreateEventOpen(true)}
            className="mt-3.5 flex h-[42px] items-center justify-center gap-2 rounded-[10px] bg-white text-sm font-semibold text-[#0B3B2E] transition-colors hover:bg-[#F2F7F5]"
          >
            <Plus className="size-4" /> Créer un événement
          </button>
        ))}

      {/* Modules */}
      <nav className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none]", collapsed ? "mt-4 items-center gap-1.5" : "mt-2.5 gap-0.5")}>
        {links.map((l) => {
          const key = keyOf(l.href);
          const active = isActive(l.href);
          const badge = key === "events" && activeEvents > 0 ? activeEvents : null;
          const dot = key === "settings" && done < steps.length;
          return collapsed ? (
            <Link
              key={l.href}
              href={l.href}
              data-tour={`nav-${key}`}
              aria-label={l.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex size-11 items-center justify-center rounded-[10px] transition-colors",
                active ? "bg-white/[0.14] text-white" : "text-[#DCE8E1] hover:bg-white/[0.08] hover:text-white"
              )}
            >
              <NavIcon d={NAV_ICON[key]} />
              {dot && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#F5B83D]" />}
              <span className="pointer-events-none absolute left-[calc(100%+10px)] z-50 hidden items-center gap-2 whitespace-nowrap rounded-[8px] bg-[#16211C] px-2.5 py-1.5 text-[13px] font-medium text-white shadow-lg group-hover:flex group-focus-visible:flex">
                {l.label}
              </span>
            </Link>
          ) : (
            <Link
              key={l.href}
              href={l.href}
              data-tour={`nav-${key}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-[10px] px-3 text-sm transition-colors",
                active ? "bg-white/[0.14] font-semibold text-white" : "font-medium text-[#DCE8E1] hover:bg-white/[0.08] hover:text-white"
              )}
            >
              <NavIcon d={NAV_ICON[key]} />
              <span className="flex-1 truncate">{l.label}</span>
              {badge !== null && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/15 px-1.5 text-[11px] font-semibold text-white">
                  {badge}
                </span>
              )}
              {dot && <span className="size-2 rounded-full bg-[#F5B83D]" aria-label="Configuration à terminer" />}
            </Link>
          );
        })}
      </nav>

      {collapsed ? (
        <button type="button" aria-label="Déplier le menu" title="Déplier le menu" onClick={() => setCollapsed(false)} className="mt-3 flex size-10 items-center justify-center rounded-[10px] text-[#9FBDB0] hover:bg-white/[0.08] hover:text-white">
          <PanelLeftOpen className="size-[18px]" />
        </button>
      ) : (
        <div className="flex flex-col gap-2 pt-3">
          {isOwner && done < steps.length && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" data-tour="setup" className="flex flex-col gap-2 rounded-[12px] bg-white/[0.06] px-3 py-2.5 text-left transition-colors hover:bg-white/10">
                  <span className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-white">Configuration</span>
                    <span className="text-[#9FBDB0]">
                      {done} / {steps.length}
                    </span>
                  </span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-white/15">
                    <span className="block h-full rounded-full bg-[#F5B83D]" style={{ width: `${(done / steps.length) * 100}%` }} />
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className={cn(EV_PORTAL, "w-72 rounded-[14px] p-0")}>
                <SetupMenuContent steps={steps} />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex items-center gap-2.5 rounded-[12px] p-2 text-left transition-colors hover:bg-white/[0.08]">
                <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[#12A06F] text-xs font-semibold text-white">
                  {initialsOf(userName)}
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#0B3B2E] bg-[#3DD68C]" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col leading-[1.3]">
                  <span className="truncate text-[13px] font-semibold text-white">{userName}</span>
                  <span className="text-xs text-[#9FBDB0]">{ROLE_LABELS[user?.role ?? ""] ?? ""}</span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-[#9FBDB0]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className={cn(EV_PORTAL, "w-[300px] rounded-[14px] p-0")}>
              <UserMenuContent name={userName} contact={user?.email ?? user?.phone ?? ""} />
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="-mx-3.5 flex items-center justify-between border-t border-white/10 px-[22px] py-3">
            <span className="flex items-center gap-2 text-xs text-[#9FBDB0]">
              Propulsé par <GiyaxMark />
            </span>
            <button type="button" aria-label="Replier le menu" title="Replier le menu" onClick={() => setCollapsed(true)} className="flex size-8 items-center justify-center rounded-[8px] text-[#9FBDB0] hover:bg-white/[0.08] hover:text-white">
              <PanelLeftClose className="size-[18px]" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
