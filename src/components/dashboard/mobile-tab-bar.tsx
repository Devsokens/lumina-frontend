"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useTenantSector } from "@/hooks/useTenantSector";
import { auditLink, mobileTabs, navLinks, type NavLink } from "@/lib/navigation";
import { cn } from "@/lib/utils";

// Navigation du back-office sur téléphone (remplace la barre latérale sous
// sm) : les modules du quotidien en bas de l'écran, à portée de pouce, et
// « Plus » qui ouvre les autres modules en tuiles.
// Marge du bas : la zone de l’indicateur d’accueil (iPhone) quand le navigateur
// la donne, et au moins 14 px sinon (simulateurs, certains Android) pour que
// les libellés ne passent jamais sous le trait.
export function MobileTabBar() {
  const pathname = usePathname();
  const { sector: urlSector } = useParams<{ sector?: string }>();
  const { sector: tenantSector } = useTenantSector();
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const sector = tenantSector ?? urlSector ?? "event";
  const { tabs, more: moreLinks } = mobileTabs(navLinks(sector, user?.role));
  // « Plus » regroupe aussi le journal d’audit (ajouté à part, voir auditLink).
  const audit = auditLink(sector, user?.role);
  const more = audit ? [...moreLinks, audit] : moreLinks;
  const isActive = (l: NavLink) => (l.exact ? pathname === l.href : pathname.startsWith(l.href));
  const moreActive = more.some(isActive);

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 pb-[max(env(safe-area-inset-bottom),0.875rem)] backdrop-blur-md sm:hidden"
      >
        <ul className="flex h-16 items-stretch justify-around px-1">
          {tabs.map((l) => {
            const active = isActive(l);
            const Icon = l.icon;
            if (l.accent) {
              return (
                <li key={l.href} className="flex flex-1 justify-center">
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className="-mt-5 flex flex-col items-center gap-1"
                  >
                    <span
                      className={cn(
                        "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition active:scale-95",
                        active && "bg-secondary text-secondary-foreground shadow-secondary/30"
                      )}
                    >
                      <Icon className="size-6" />
                    </span>
                    <span className={cn("text-[11px] font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
                      {l.short ?? l.label}
                    </span>
                  </Link>
                </li>
              );
            }
            return (
              <li key={l.href} className="flex flex-1">
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition", active && "bg-primary/12")}>
                    <Icon className="size-5" />
                  </span>
                  <span className="max-w-full truncate px-0.5">{l.short ?? l.label}</span>
                </Link>
              </li>
            );
          })}

          {more.length > 0 && (
            <li className="flex flex-1">
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                aria-expanded={moreOpen}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition",
                  moreActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition", moreActive && "bg-primary/12")}>
                  <LayoutGrid className="size-5" />
                </span>
                Plus
              </button>
            </li>
          )}
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] gap-0 rounded-t-3xl p-0 pb-[max(env(safe-area-inset-bottom),0.875rem)] sm:hidden">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted" aria-hidden />
          <SheetHeader className="px-5 pb-2 pt-3">
            <SheetTitle>Tous les modules</SheetTitle>
            <SheetDescription>Le reste de votre espace de gestion.</SheetDescription>
          </SheetHeader>
          <ul className="grid gap-2 overflow-y-auto px-4 pb-6">
            {more.map((l) => {
              const Icon = l.icon;
              const active = isActive(l);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-3 transition",
                      active ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-muted/50"
                    )}
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{l.label}</span>
                      {l.hint && <span className="block truncate text-xs text-muted-foreground">{l.hint}</span>}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
