"use client";

import { useState } from "react";
import { formatPrice } from "@/components/event-site/site-data";
import { CheckoutDialog } from "@/components/event-site/checkout-dialog";
import type { PublicEvent } from "@/types/events";
import { cn } from "@/lib/utils";
import { OperatorLogo } from "@/components/shared/operator-logo";
import { contributionFloor, isContribution, quickAmounts } from "@/lib/contribution";

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
  // Cotisation : montant choisi par formule (centimes, suggéré par défaut) et
  // saisie libre en cours (texte, en francs).
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [typed, setTyped] = useState<Record<string, string>>({});
  const amountOf = (t: Ticket) => (isContribution(t) ? (amounts[t.id] ?? t.price) : t.price);
  const tooLow = (t: Ticket) => isContribution(t) && amountOf(t) < contributionFloor(t);

  const open = event.ticketTypes.filter((t) => !closed(t));
  const lines = event.ticketTypes
    .filter((t) => (sel[t.id] ?? 0) > 0)
    .map((t) => ({ ticket: t, quantity: sel[t.id], ...(isContribution(t) ? { amount: amountOf(t) } : {}) }));
  const qty = lines.reduce((n, l) => n + l.quantity, 0);
  const total = lines.reduce((sum, l) => sum + (l.amount ?? l.ticket.price) * l.quantity, 0);
  // Cotisation choisie sous le minimum : réservation bloquée.
  const invalid = lines.some((l) => tooLow(l.ticket));
  const full = qty >= MAX_PER_ORDER;
  // Rien à payer : sélection gratuite, ou événement sans billet payant.
  const freeOnly = qty > 0 ? total === 0 : event.ticketTypes.every((t) => t.price === 0);

  function pick(t: Ticket, value: number, text = "") {
    setAmounts((prev) => ({ ...prev, [t.id]: value }));
    setTyped((prev) => ({ ...prev, [t.id]: text }));
    // Choisir un montant vaut choix de la formule (1 billet).
    if (!sel[t.id] && !closed(t) && qty < MAX_PER_ORDER) change(t, 1);
  }

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
                  <span className={cn("flex flex-col items-end whitespace-nowrap font-(family-name:--s-font-display)", nuit ? "text-xl font-bold" : "text-[17px] font-extrabold")}>
                    {isContribution(t) && <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-(--s-muted)">Cotisation</span>}
                    {formatPrice(amountOf(t))}
                  </span>
                </div>
                {isContribution(t) && !off && (
                  <ContributionPicker
                    ticket={t}
                    value={amountOf(t)}
                    text={typed[t.id] ?? ""}
                    nuit={nuit}
                    onPick={(v) => pick(t, v)}
                    // Champ vidé : retour au montant suggéré.
                    onType={(text) => pick(t, text.trim() ? Number(text.replace(/\D/g, "")) * 100 : t.price, text)}
                  />
                )}
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
          {invalid && (
            <span role="alert" className="text-xs font-semibold text-[#E5484D]">
              Montant de cotisation sous le minimum demandé par l&apos;organisateur.
            </span>
          )}
      </div>

      <div className="flex items-baseline justify-between border-t border-(--s-line2) pt-3.5">
        <span className="text-[15px] text-(--s-muted)">
          Total · {qty} billet{qty > 1 ? "s" : ""}
        </span>
        <span className={cn("font-(family-name:--s-font-display) font-extrabold tracking-[-0.02em]", nuit ? "text-[30px]" : "text-[26px]")}>
          {qty === 0 ? "0 F" : total === 0 ? "Gratuit" : formatPrice(total)}
        </span>
      </div>

      <button type="button" disabled={qty === 0 || invalid} onClick={() => setCheckout(true)} className={primary}>
        {lines.length > 0 && lines.every((l) => isContribution(l.ticket)) ? "Cotiser" : "Continuer"}
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
            if (done) {
              setSel({});
              setAmounts({});
              setTyped({});
            }
          }}
        />
      )}
    </div>
  );
}

// Cotisation : montants en un clic (minimum, suggéré, plus généreux) ou
// montant libre. Le serveur refuse tout montant sous le minimum.
function ContributionPicker({
  ticket,
  value,
  text,
  nuit,
  onPick,
  onType,
}: {
  ticket: Ticket;
  value: number;
  text: string;
  nuit: boolean;
  onPick: (value: number) => void;
  onType: (text: string) => void;
}) {
  const floor = contributionFloor(ticket);
  const chips = quickAmounts(ticket);
  const low = value < floor;
  const on = nuit ? "border-(--s-accent) bg-(--s-accent) text-(--s-accent-ink)" : "border-(--s-dark) bg-(--s-dark) text-(--s-dark-ink)";
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-label={`Montant de la cotisation (${ticket.name})`} className="flex flex-wrap gap-1.5">
        {chips.map((a) => {
          const sel = !text && value === a;
          return (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={sel}
              onClick={() => onPick(a)}
              className={cn("relative h-9 rounded-full border px-3.5 text-[13px] font-semibold transition-colors", sel ? on : "border-(--s-line3) text-(--s-text) hover:bg-(--s-surface2)")}
            >
              {formatPrice(a)}
              {a === ticket.price && a !== floor && (
                <span className={cn("ml-1.5 text-[10px] font-bold uppercase tracking-[0.06em]", sel ? "opacity-80" : "text-(--s-accent)")}>suggéré</span>
              )}
            </button>
          );
        })}
      </div>
      <label className={cn("flex h-11 items-center overflow-hidden rounded-[14px] border transition-colors", text ? (low ? "border-[#E5484D]" : nuit ? "border-(--s-accent)" : "border-(--s-dark)") : "border-(--s-line2)")}>
        <span className="sr-only">Autre montant, en francs CFA</span>
        <input
          inputMode="numeric"
          value={text}
          placeholder="Autre montant"
          onChange={(e) => onType(e.target.value.replace(/[^\d\s]/g, "").slice(0, 9))}
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-3.5 text-[15px] text-(--s-text) outline-none placeholder:text-(--s-faint)"
        />
        <span className="flex h-full items-center px-3.5 text-[13px] font-semibold text-(--s-muted)">F</span>
      </label>
      <span className={cn("text-xs", low ? "font-semibold text-[#E5484D]" : "text-(--s-muted)")}>
        Minimum {formatPrice(floor)} · votre billet sert aussi d&apos;entrée
      </span>
    </div>
  );
}
