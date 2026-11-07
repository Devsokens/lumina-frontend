"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Check, X } from "lucide-react";
import { EventEditor } from "@/components/events/editor/event-editor";
import { EvDialog } from "@/components/events/team/invite-member-dialog";
import { EV_PORTAL, initialsOf } from "@/components/events/ev-ui";
import { CommandPalette } from "@/components/dashboard/event-shell/command-palette";
import { NewOrganizationDrawer } from "@/components/dashboard/event-shell/new-organization";
import { BASE, GO_KEYS, NAV_ICON, keyOf, navGroups } from "@/components/dashboard/event-shell/shell-model";
import { useAuth } from "@/hooks/useAuth";
import { useTenantSector } from "@/hooks/useTenantSector";
import { useShellStore } from "@/stores/useShellStore";
import { cn } from "@/lib/utils";

// Éléments communs du cadre événementiel, montés une fois : raccourcis
// clavier, palette ⌘K, aide, création d'événement, offre Business,
// nouvelle organisation.

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
};

function useShortcuts() {
  const router = useRouter();
  const { user } = useAuth();
  const store = useShellStore;
  const pendingG = useRef<number | null>(null);
  const canCreate = user?.role === "OWNER" || user?.role === "MANAGER";

  useEffect(() => {
    const links = navGroups(user?.role).flatMap((g) => g.links);
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        store.getState().setPaletteOpen(!store.getState().paletteOpen);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      const s = store.getState();
      if (s.paletteOpen || s.createEventOpen || s.newOrgOpen) return;
      const key = e.key.toUpperCase();
      if (pendingG.current) {
        window.clearTimeout(pendingG.current);
        pendingG.current = null;
        const target = links.find((l) => GO_KEYS[keyOf(l.href)] === key);
        if (target) {
          e.preventDefault();
          router.push(target.href);
        }
        return;
      }
      if (key === "G") {
        pendingG.current = window.setTimeout(() => (pendingG.current = null), 1200);
      } else if (e.key === "?") {
        s.setShortcutsOpen(true);
      } else if (key === "C" && canCreate) {
        e.preventDefault();
        s.setCreateEventOpen(true);
      } else if (key === "S") {
        router.push("/scan");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, user?.role, canCreate, store]);
}

function ShortcutsDialog() {
  const open = useShellStore((s) => s.shortcutsOpen);
  const setOpen = useShellStore((s) => s.setShortcutsOpen);
  const { user } = useAuth();
  const nav = navGroups(user?.role).flatMap((g) => g.links);
  const rows: [string, string][] = [
    ["⌘ K", "Rechercher ou aller à…"],
    ["C", "Créer un événement"],
    ["S", "Scanner les pass"],
    ["?", "Afficher les raccourcis"],
    ...nav.map((l) => [`G puis ${GO_KEYS[keyOf(l.href)]}`, l.label] as [string, string]),
  ];
  return (
    <EvDialog
      open={open}
      onOpenChange={setOpen}
      width={520}
      title="Raccourcis et aide"
      description="Allez plus vite au clavier. Sur Windows, ⌘ = Ctrl."
      footer={
        <a href="/#faq" target="_blank" rel="noreferrer" className="flex h-[42px] items-center rounded-[10px] border border-ev-border bg-ev-surface px-4 text-sm font-medium">
          Centre d&apos;aide
        </a>
      }
    >
      <dl className="m-0 grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-[auto_1fr]">
        {rows.map(([k, label]) => (
          <div key={label} className="contents">
            <dt>
              <kbd className="inline-flex h-6 items-center rounded-[6px] border border-ev-border bg-ev-soft px-2 font-ev-mono text-xs">{k}</kbd>
            </dt>
            <dd className="m-0 text-ev-ink2">{label}</dd>
          </div>
        ))}
      </dl>
    </EvDialog>
  );
}

// Offre Business : plusieurs organisations sous un même compte.
function BusinessDialog() {
  const router = useRouter();
  const open = useShellStore((s) => s.businessOpen);
  const setOpen = useShellStore((s) => s.setBusinessOpen);
  const { tenant } = useTenantSector();
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(12,22,18,.45)] backdrop-blur-[3px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className={cn(EV_PORTAL, "fixed left-1/2 top-1/2 z-50 w-[min(542px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] bg-ev-surface text-ev-ink shadow-[0_30px_80px_rgba(12,22,18,.3)] outline-none data-[state=open]:animate-in data-[state=open]:zoom-in-95")}>
          <div className="relative bg-[linear-gradient(160deg,#0F5A44,#0B3B2E)] px-8 pb-7 pt-7 text-white">
            <DialogPrimitive.Close aria-label="Fermer" className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-[10px] bg-white/10 hover:bg-white/15">
              <X className="size-4" />
            </DialogPrimitive.Close>
            <div className="flex items-center gap-3">
              <span className="flex">
                <span className="flex size-12 items-center justify-center rounded-[12px] border-2 border-[#0B3B2E] bg-white text-sm font-bold text-[#0B3B2E]">{initialsOf(tenant?.name ?? "Org")}</span>
                <span className="-ml-3 flex size-12 items-center justify-center rounded-[12px] border-2 border-[#0B3B2E] bg-[#F5B83D] text-sm font-bold text-[#0E0C0A]">+</span>
              </span>
              <span className="rounded-full bg-[#F5B83D]/20 px-2.5 py-1 text-xs font-semibold text-[#F5B83D]">Business</span>
            </div>
            <DialogPrimitive.Title className="mt-5 text-[28px] font-bold leading-[1.15] tracking-[-0.02em]">
              Plusieurs organisations,
              <br />
              un seul compte
            </DialogPrimitive.Title>
          </div>
          <div className="flex flex-col gap-5 px-8 py-7">
            <DialogPrimitive.Description className="m-0 text-[15px] leading-relaxed text-ev-ink2">
              Gérez plusieurs marques ou entités séparément, chacune avec son site, ses événements et ses paiements, sans vous déconnecter.
            </DialogPrimitive.Description>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm">
              {["Passez de l'une à l'autre en un clic depuis le menu", "Reprenez les paiements, messages et modèles d'une organisation existante", "Une seule facture pour toutes vos organisations"].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-ev-bar" strokeWidth={2.5} />
                  {t}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between rounded-[12px] bg-ev-soft px-4 py-3 text-sm">
              <span className="text-ev-ink2">Formule Business</span>
              <span className="font-semibold">Tarif bientôt disponible</span>
            </div>
            <div className="flex gap-2.5">
              <button type="button" onClick={() => setOpen(false)} className="h-12 rounded-[10px] border border-ev-border px-5 text-sm font-medium">
                Plus tard
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(`${BASE}/settings?rubrique=abonnement`);
                }}
                className="h-12 flex-1 rounded-[10px] bg-ev-primary text-sm font-semibold text-white hover:bg-ev-primary-hover"
              >
                Passer à Business
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function CreateEventHost() {
  const router = useRouter();
  const open = useShellStore((s) => s.createEventOpen);
  const setOpen = useShellStore((s) => s.setCreateEventOpen);
  return <EventEditor open={open} event={null} onOpenChange={setOpen} onCreated={(id) => router.push(`${BASE}/events/${id}`)} />;
}

export function EventShellHosts() {
  useShortcuts();
  return (
    <>
      <CommandPalette />
      <ShortcutsDialog />
      <BusinessDialog />
      <NewOrganizationDrawer />
      <CreateEventHost />
    </>
  );
}

export { NAV_ICON };
