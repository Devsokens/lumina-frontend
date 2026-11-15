"use client";

import { useState, useSyncExternalStore } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { CheckCircle2, Loader2, Ticket, WifiOff, X } from "lucide-react";
import { DoneView } from "@/components/event-site/checkout-dialog";
import { useSiteLook } from "@/components/event-site/site-look";
import { usePaymentStatus } from "@/hooks/usePublicEvents";
import { siteStyle } from "@/lib/event-site-theme";
import { eventSiteFontVariables } from "@/lib/event-site-fonts";
import { clearPendingPayment, parsePendingPayment, readPendingPayment, subscribePendingPayment } from "@/lib/pending-payment";
import type { PublicEvent } from "@/types/events";
import { cn } from "@/lib/utils";

// Reprise après une coupure : l'acheteur a payé mais la fenêtre de
// réservation s'est fermée (réseau perdu, page rechargée, téléphone verrouillé
// pendant la saisie du code). En revenant sur la page de l'événement, il
// retrouve l'état de son paiement et ses billets, sans dépendre de l'e-mail.

export function PaymentRecovery({ event, variant }: { event: PublicEvent; variant: "nuit" | "lumiere" }) {
  const look = useSiteLook();
  const nuit = variant === "nuit";
  const raw = useSyncExternalStore(
    subscribePendingPayment,
    () => readPendingPayment(event.id),
    () => null
  );
  const pending = parsePendingPayment(raw);
  const { data, isError, refetch, isFetching } = usePaymentStatus(pending?.reference ?? null);
  const [open, setOpen] = useState(false);

  if (!pending) return null;
  const status = data?.paymentStatus;
  // Paiement refusé ou remboursé : plus rien à retrouver.
  if (status === "FAILED" || status === "REFUNDED") return null;

  const tickets = status === "PAID" ? (data?.tickets ?? []) : [];
  const paid = tickets.length > 0;
  const dismiss = () => clearPendingPayment(event.id, pending.reference);
  const box = cn("flex items-start gap-3 rounded-[18px] border p-4 text-sm", nuit ? "border-(--s-accent) bg-(--s-accent-tint)" : "border-(--s-dark) bg-(--s-surface2)");

  return (
    <div className={box} role="status">
      {paid ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" /> : isError ? <WifiOff className="mt-0.5 size-5 shrink-0" /> : <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin" />}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {paid ? (
          <>
            <span className="font-semibold">Votre paiement est confirmé.</span>
            <span className="text-(--s-body)">Vos billets sont prêts : affichez-les ou téléchargez-les ici.</span>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cn("flex h-11 items-center justify-center gap-2 self-start rounded-full px-5 text-sm font-bold", nuit ? "bg-(--s-accent) text-(--s-accent-ink)" : "bg-(--s-dark) text-(--s-dark-ink)")}
            >
              <Ticket className="size-4" /> Voir mes billets
            </button>
          </>
        ) : isError ? (
          <>
            <span className="font-semibold">Impossible de vérifier votre paiement pour le moment.</span>
            <span className="text-(--s-body)">Si vous avez été débité, vos billets sont enregistrés : réessayez dès que le réseau revient.</span>
            <button type="button" disabled={isFetching} onClick={() => void refetch()} className="flex h-10 items-center justify-center gap-2 self-start rounded-full border border-(--s-line3) px-4 text-sm font-semibold disabled:opacity-60">
              {isFetching && <Loader2 className="size-4 animate-spin" />} Réessayer
            </button>
          </>
        ) : status === "PAID" ? (
          <span className="text-(--s-body)">Paiement reçu, mais les places n&apos;étaient plus disponibles : l&apos;organisateur va vous rembourser.</span>
        ) : (
          <>
            <span className="font-semibold">Vérification de votre paiement…</span>
            <span className="text-(--s-body)">Si vous avez validé sur votre téléphone, vos billets s&apos;affichent ici dans un instant.</span>
          </>
        )}
      </div>
      <button type="button" aria-label="Masquer" onClick={dismiss} className="flex size-8 shrink-0 items-center justify-center rounded-full text-(--s-soft) hover:bg-(--s-surface2)">
        <X className="size-4" />
      </button>

      {open && paid && data && (
        <DialogPrimitive.Root open onOpenChange={(o) => !o && setOpen(false)}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[3px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
            <DialogPrimitive.Content
              style={siteStyle(look)}
              data-radius={look.radius}
              aria-describedby={undefined}
              className={cn(
                eventSiteFontVariables,
                "fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col overflow-hidden rounded-t-[28px] bg-(--s-bg) font-(family-name:--s-font-body) text-(--s-text) antialiased shadow-[0_30px_80px_rgba(0,0,0,.35)] outline-none",
                "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90dvh] sm:w-[min(580px,calc(100%-32px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]"
              )}
            >
              <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs font-semibold tracking-[0.14em] text-(--s-muted)">MES BILLETS</span>
                  <DialogPrimitive.Title className="m-0 truncate font-(family-name:--s-font-display) text-[22px] font-extrabold leading-tight tracking-[-0.02em]">{event.title}</DialogPrimitive.Title>
                </div>
                <DialogPrimitive.Close aria-label="Fermer" className="flex size-10 shrink-0 items-center justify-center rounded-full border border-(--s-line2) text-(--s-soft) hover:bg-(--s-surface2)">
                  <X className="size-4" />
                </DialogPrimitive.Close>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto border-t border-(--s-line) px-5 py-6 sm:px-7">
                <DoneView
                  done={{ tickets, orderId: data.orderId, documentToken: data.documentToken, paid: true }}
                  email={pending.email}
                  nuit={nuit}
                  gift={false}
                  typeName={(id) => event.ticketTypes.find((t) => t.id === id)?.name ?? null}
                />
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}
    </div>
  );
}
