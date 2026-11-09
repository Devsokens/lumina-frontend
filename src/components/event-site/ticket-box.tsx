"use client";

import { useState } from "react";
import { formatPrice } from "@/components/event-site/site-data";
import { CheckoutDialog } from "@/components/event-site/checkout-dialog";
import type { PublicEvent } from "@/types/events";
import { cn } from "@/lib/utils";
import { OperatorLogo } from "@/components/shared/operator-logo";

// Boîte « Billets » des pages événement (modèles Nuit et Lumière) : nombre de
// billets par formule (plusieurs formules possibles dans une commande), puis
// « Continuer » ouvre la réservation par-dessus la page (checkout-dialog.tsx),
// sans la quitter. Le montant affiché est indicatif : le serveur recalcule les
// prix et réserve les places (POST /events/:id/tickets).

// Billets au plus par commande, toutes formules confondues (comme le serveur).
const MAX_PER_ORDER = 10;

type Ticket = PublicEvent["ticketTypes"][number];
const closed = (t: Ticket) => t.remaining === 0 || (!!t.saleEndsAt && new Date(t.saleEndsAt).getTime() <= Date.now());
// Places restantes, dans la limite fixée par formule (contrôlée aussi par l'API).
const capOf = (t: Ticket) => Math.min(t.remaining, t.maxPerOrder ?? MAX_PER_ORDER);

export function TicketBox({ event, variant, preview }: { event: PublicEvent; variant: "nuit" | "lumiere"; preview?: boolean }) {
  const nuit = variant === "nuit";
  // Billets choisis par formule (id → nombre).
  const [sel, setSel] = useState<Record<string, number>>({});
  const [checkout, setCheckout] = useState(false);

  const open = event.ticketTypes.filter((t) => !closed(t));
  const lines = event.ticketTypes.filter((t) => (sel[t.id] ?? 0) > 0).map((t) => ({ ticket: t, quantity: sel[t.id] }));
  const qty = lines.reduce((n, l) => n + l.quantity, 0);
  const total = lines.reduce((sum, l) => sum + l.ticket.price * l.quantity, 0);
  const full = qty >= MAX_PER_ORDER;
  // Rien à payer : sélection gratuite, ou événement sans billet payant.
  const freeOnly = qty > 0 ? total === 0 : event.ticketTypes.every((t) => t.price === 0);

  function change(t: Ticket, delta: number) {
    const current = sel[t.id] ?? 0;
    // Plafond : places restantes de la formule et 10 billets en tout.
    const max = Math.min(capOf(t), current + MAX_PER_ORDER - qty);
    const next = Math.max(0, Math.min(max, current + delta));
    setSel((prev) => {
      const rest = { ...prev };
      if (next === 0) delete rest[t.id];
      else rest[t.id] = next;
      return rest;
    });
  }

  const box = cn(
    "flex flex-col gap-[18px] rounded-[28px] border p-5 sm:p-[26px]",
    nuit ? "border-(--s-line2) bg-(--s-surface)" : "border-(--s-line) bg-(--s-surface) shadow-[0_20px_50px_rgba(15,17,21,.08)]"
  );
  const primary = cn(
    "flex h-14 w-full items-center justify-center rounded-full text-base font-bold transition-opacity hover:opacity-90 disabled:opacity-50",
    nuit ? "bg-(--s-accent) text-(--s-accent-ink)" : "bg-(--s-dark) text-(--s-dark-ink)"
  );

  return (
    <div className={box}>
      <div className="flex items-center justify-between">
        <span className={cn("font-(family-name:--s-font-display) font-extrabold", nuit ? "text-2xl" : "text-xl tracking-[-0.02em]")}>Billets</span>
        {open.length === 0 ? (
          <span className="text-[13px] font-semibold text-(--s-muted)">Complet</span>
        ) : nuit ? (
          <span className="flex items-center gap-1.5 text-[13px] text-(--s-soft)">
            <span className="size-[7px] rounded-full bg-[#3DD68C]" />
            En vente
          </span>
        ) : (
          <span className="text-[13px] font-semibold text-(--s-accent)">Ventes ouvertes</span>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
          {event.ticketTypes.map((t) => {
            const q = sel[t.id] ?? 0;
            const active = q > 0;
            const off = closed(t);
            const max = Math.min(capOf(t), q + MAX_PER_ORDER - qty);
            return (
              <div
                key={t.id}
                className={cn(
                  "flex flex-col gap-3 rounded-[18px] p-4",
                  active
                    ? nuit
                      ? "border-[1.5px] border-(--s-accent) bg-(--s-accent-tint)"
                      : "border-[1.5px] border-(--s-dark)"
                    : "border border-(--s-line2)",
                  off && "opacity-55"
                )}
              >
                <div className="flex justify-between gap-3">
                  <span className="flex min-w-0 flex-col gap-[3px]">
                    <span className={cn("text-base", nuit ? "font-semibold" : "font-bold")}>{t.name}</span>
                    {t.description && <span className="text-[13px] text-(--s-muted)">{t.description}</span>}
                  </span>
                  <span className={cn("whitespace-nowrap font-(family-name:--s-font-display)", nuit ? "text-xl font-bold" : "text-[17px] font-extrabold")}>
                    {formatPrice(t.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-(--s-muted)">
                    {t.remaining === 0 ? "Complet" : off ? "Ventes terminées" : `${t.remaining} place${t.remaining > 1 ? "s" : ""} restante${t.remaining > 1 ? "s" : ""}`}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Retirer un ${t.name}`}
                      disabled={q === 0}
                      onClick={() => change(t, -1)}
                      className={cn(
                        "flex size-[34px] items-center justify-center rounded-full border text-lg leading-none transition-colors disabled:cursor-not-allowed",
                        q > 0 ? (nuit ? "border-(--s-line3) text-(--s-text)" : "border-(--s-dark) text-(--s-text)") : "border-(--s-line2) text-(--s-faint)"
                      )}
                    >
                      −
                    </button>
                    <span className="w-3.5 text-center font-semibold">{q}</span>
                    <button
                      type="button"
                      aria-label={`Ajouter un ${t.name}`}
                      disabled={off || q >= max}
                      onClick={() => change(t, 1)}
                      className={cn(
                        "flex size-[34px] items-center justify-center rounded-full text-lg leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                        active
                          ? nuit
                            ? "bg-(--s-accent) font-bold text-(--s-accent-ink)"
                            : "bg-(--s-dark) text-(--s-dark-ink)"
                          : nuit
                            ? "border border-(--s-line3) text-(--s-text)"
                            : "border border-(--s-dark) text-(--s-text)"
                      )}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {full && <span className="text-xs text-(--s-faint)">{MAX_PER_ORDER} billets au plus par commande.</span>}
      </div>

      <div className="flex items-baseline justify-between border-t border-(--s-line2) pt-3.5">
        <span className="text-[15px] text-(--s-muted)">
          Total · {qty} billet{qty > 1 ? "s" : ""}
        </span>
        <span className={cn("font-(family-name:--s-font-display) font-extrabold tracking-[-0.02em]", nuit ? "text-[30px]" : "text-[26px]")}>
          {qty === 0 ? "0 F" : total === 0 ? "Gratuit" : formatPrice(total)}
        </span>
      </div>

      <button type="button" disabled={qty === 0} onClick={() => setCheckout(true)} className={primary}>
        Continuer
      </button>

      {freeOnly ? (
        <span className="text-center text-[13px] text-(--s-muted)">Inscription gratuite · billet envoyé par e-mail</span>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2 text-[13px]">
            <OperatorLogo operator="AIRTEL" />
            <OperatorLogo operator="MOOV" />
            <span className="flex h-8 items-center rounded-lg bg-(--s-chip) px-2.5 font-semibold">Carte bancaire</span>
          </div>
          <span className="text-center text-[13px] text-(--s-muted)">Billets envoyés par e-mail</span>
        </div>
      )}

      {checkout && qty > 0 && (
        <CheckoutDialog
          event={event}
          lines={lines}
          variant={variant}
          preview={preview}
          onClose={(done) => {
            setCheckout(false);
            if (done) setSel({});
          }}
        />
      )}
    </div>
  );
}
