"use client";

import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Check, X } from "lucide-react";
import { EventEditor } from "@/components/events/editor/event-editor";
import { EV_PORTAL, initialsOf } from "@/components/events/ev-ui";
import { CommandPalette } from "@/components/dashboard/event-shell/command-palette";
import { NewOrganizationDrawer } from "@/components/dashboard/event-shell/new-organization";
import { BASE, NAV_ICON } from "@/components/dashboard/event-shell/shell-model";
import { OnboardingTour } from "@/components/experience/onboarding-tour";
import { FeedbackModal, FeedbackPrompter } from "@/components/experience/feedback-modal";
import { SupportDrawer } from "@/components/support/support-drawer";
import { useTenantSector } from "@/hooks/useTenantSector";
import { useShellStore } from "@/stores/useShellStore";
import { cn } from "@/lib/utils";

// Éléments communs du cadre événementiel, montés une fois : palette de
// recherche, visite guidée, demande d'avis, création d'événement, offre
// Business, nouvelle organisation.

// Offre Business : plusieurs organisations sous un même compte.
function BusinessDialog() {
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
              {/* Formule Business pas encore ouverte. */}
              <button type="button" disabled className="h-12 flex-1 cursor-not-allowed rounded-[10px] border border-dashed border-ev-border bg-ev-soft text-sm font-semibold text-ev-ink2">
                Bientôt disponible
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
  return (
    <>
      <CommandPalette />
      <OnboardingTour />
      <FeedbackModal />
      <FeedbackPrompter />
      <BusinessDialog />
      <NewOrganizationDrawer />
      <SupportDrawer />
      <CreateEventHost />
    </>
  );
}

export { NAV_ICON };
