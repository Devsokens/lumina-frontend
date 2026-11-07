"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiErrorMessage, normalizePhone } from "@/lib/events";
import { initializePayment, purchaseTickets } from "@/hooks/usePublicEvents";
import { TicketDownloads } from "@/components/vitrine/ticket-downloads";
import { formatPrice } from "@/components/event-site/site-data";
import type { PublicEvent, PurchasedTicket } from "@/types/events";
import { cn } from "@/lib/utils";

// Boîte « Billets » des pages événement (modèles Nuit et Lumière).
// Le serveur vend une formule par commande (POST /events/:id/tickets) :
// choisir une autre formule remplace la précédente. Le montant affiché est
// indicatif, le serveur recalcule le prix et réserve les places.

const MAX_PER_ORDER = 10;
const PHONE_FORMAT = /^\+?[0-9]{8,15}$/;

type Ticket = PublicEvent["ticketTypes"][number];
const closed = (t: Ticket) => t.remaining === 0 || (!!t.saleEndsAt && new Date(t.saleEndsAt).getTime() <= Date.now());

export function TicketBox({ event, variant, preview }: { event: PublicEvent; variant: "nuit" | "lumiere"; preview?: boolean }) {
  const router = useRouter();
  const nuit = variant === "nuit";
  const [sel, setSel] = useState<{ id: string; qty: number } | null>(null);
  const [step, setStep] = useState<"choose" | "details">("choose");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [free, setFree] = useState<PurchasedTicket[] | null>(null);
  const key = useRef<string | null>(null);

  const open = event.ticketTypes.filter((t) => !closed(t));
  const chosen = event.ticketTypes.find((t) => t.id === sel?.id) ?? null;
  const qty = sel?.qty ?? 0;
  const total = chosen ? chosen.price * qty : 0;

  function change(t: Ticket, delta: number) {
    const max = Math.min(MAX_PER_ORDER, t.remaining);
    const current = sel?.id === t.id ? sel.qty : 0;
    const next = Math.max(0, Math.min(max, current + delta));
    setSel(next === 0 ? null : { id: t.id, qty: next });
    if (next === 0) setStep("choose");
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!chosen || qty === 0) return;
    if (preview) return void toast.info("Aperçu : le paiement est désactivé dans l'éditeur.");
    const customerPhone = normalizePhone(phone);
    if (!PHONE_FORMAT.test(customerPhone)) return void toast.error("Numéro de téléphone invalide (ex. +241 77 12 34 56).");
    setBusy(true);
    key.current ??= crypto.randomUUID();
    try {
      const order = await purchaseTickets(
        event.id,
        {
          ticketTypeId: chosen.id,
          quantity: qty,
          customerPhone,
          ...(name.trim() ? { customerName: name.trim() } : {}),
          ...(email.trim() ? { customerEmail: email.trim() } : {}),
        },
        key.current
      );
      if (order.paymentStatus === "PAID") {
        setFree(order.tickets);
        setBusy(false);
        return;
      }
      const { authorizationUrl, simulated } = await initializePayment(order.id);
      if (simulated) router.push(authorizationUrl);
      else window.location.assign(authorizationUrl);
    } catch (err) {
      key.current = null;
      toast.error(apiErrorMessage(err, "Réservation impossible, réessayez."));
      setBusy(false);
    }
  }

  const box = cn(
    "flex flex-col gap-[18px] rounded-[28px] border p-5 sm:p-[26px]",
    nuit ? "border-(--s-line2) bg-(--s-surface)" : "border-(--s-line) bg-(--s-surface) shadow-[0_20px_50px_rgba(15,17,21,.08)]"
  );
  const field = cn(
    "h-12 w-full rounded-full border bg-transparent px-4 text-[15px] outline-none placeholder:text-(--s-faint) focus:border-(--s-accent)",
    nuit ? "border-(--s-line2) text-(--s-text)" : "border-(--s-line3) text-(--s-text)"
  );
  const primary = cn(
    "flex h-14 w-full items-center justify-center rounded-full text-base font-bold transition-opacity hover:opacity-90 disabled:opacity-50",
    nuit ? "bg-(--s-accent) text-(--s-accent-ink)" : "bg-(--s-dark) text-(--s-dark-ink)"
  );

  if (free) {
    return (
      <div className={box}>
        <span className="font-(family-name:--s-font-display) text-2xl font-extrabold">Inscription confirmée</span>
        <p className="m-0 text-sm text-(--s-body)">{email ? `Vos billets ont aussi été envoyés à ${email}. ` : ""}Présentez le QR code à l&apos;entrée.</p>
        <div className="rounded-2xl bg-white p-3 text-[#0F1115]">
          <TicketDownloads tickets={free} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={pay} className={box} noValidate>
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

      {step === "choose" ? (
        <div className="flex flex-col gap-2.5">
          {event.ticketTypes.map((t) => {
            const q = sel?.id === t.id ? sel.qty : 0;
            const active = q > 0;
            const off = closed(t);
            const max = Math.min(MAX_PER_ORDER, t.remaining);
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
          {event.ticketTypes.length > 1 && <span className="text-xs text-(--s-faint)">Une formule par commande.</span>}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button type="button" onClick={() => setStep("choose")} className="self-start text-[13px] font-semibold text-(--s-muted) underline underline-offset-4">
            ← {qty} × {chosen?.name}
          </button>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
            Nom complet
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" className={field} />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
            Téléphone (Mobile Money)
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+241 77 12 34 56" autoComplete="tel" className={field} />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
            E-mail <span className="font-normal text-(--s-muted)">pour recevoir vos billets</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" autoComplete="email" className={field} />
          </label>
        </div>
      )}

      <div className="flex items-baseline justify-between border-t border-(--s-line2) pt-3.5">
        <span className="text-[15px] text-(--s-muted)">
          Total · {qty} billet{qty > 1 ? "s" : ""}
        </span>
        <span className={cn("font-(family-name:--s-font-display) font-extrabold tracking-[-0.02em]", nuit ? "text-[30px]" : "text-[26px]")}>
          {!chosen ? "0 F" : chosen.price === 0 ? "Gratuit" : formatPrice(total)}
        </span>
      </div>

      {step === "choose" ? (
        <button type="button" disabled={!chosen} onClick={() => setStep("details")} className={primary}>
          {chosen?.price === 0 ? "Réserver gratuitement" : nuit ? "Payer avec Mobile Money" : "Continuer vers le paiement"}
        </button>
      ) : (
        <button type="submit" disabled={busy} className={primary}>
          {busy ? "Réservation…" : chosen?.price === 0 ? "Confirmer ma réservation" : `Payer ${formatPrice(total)}`}
        </button>
      )}

      {nuit ? (
        <span className="text-center text-[13px] text-(--s-muted)">Mobile Money ou carte · billet QR dès le paiement</span>
      ) : (
        <div className="flex justify-center gap-2 text-[13px]">
          {["Mobile Money", "Carte bancaire"].map((m) => (
            <span key={m} className="flex h-7 items-center rounded-lg bg-(--s-chip) px-2.5 font-semibold">
              {m}
            </span>
          ))}
        </div>
      )}
    </form>
  );
}
