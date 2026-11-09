"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiError } from "@/lib/api";
import { formatXAF } from "@/lib/format";
import { formatDay } from "@/lib/stays";
import { bookStay, useStayQuote } from "@/hooks/useStays";
import { initializePayment } from "@/hooks/usePublicEvents";
import { StayCalendar, type CalendarMark } from "@/components/stays/stay-calendar";
import { Counter } from "@/components/stays/counter";
import type { PublicListing } from "@/types/stays";

const PHONE = /^\+?[0-9]{8,15}$/;

// Réservation d'un séjour : dates → voyageurs → prix (calculé par le
// serveur) → coordonnées → paiement (PVit ou page simulée).
export function BookingWidget({ slug, listing }: { slug: string; listing: PublicListing }) {
  const [range, setRange] = useState<{ checkIn: string | null; checkOut: string | null }>({ checkIn: null, checkOut: null });
  const [guests, setGuests] = useState(1);
  const [step, setStep] = useState<"dates" | "details">("dates");
  const [contact, setContact] = useState({ name: "", phone: "", email: "", note: "" });
  const [busy, setBusy] = useState(false);
  // Une clé par tentative : un double clic ne réserve qu'une fois.
  const idempotencyKey = useRef<string | null>(null);

  const stay = range.checkIn && range.checkOut ? { checkIn: range.checkIn, checkOut: range.checkOut, guests } : null;
  const quote = useStayQuote(slug, listing.id, stay);
  const marks: CalendarMark[] = (listing.unavailable ?? []).map((r) => ({ ...r, tone: "blocked" }));

  async function book() {
    const phone = contact.phone.replace(/[\s.()-]/g, "");
    if (!stay || !PHONE.test(phone)) {
      toast.error("Numéro de téléphone invalide (ex. +24177123456).");
      return;
    }
    setBusy(true);
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      const result = await bookStay(
        slug,
        listing.id,
        {
          ...stay,
          customerPhone: phone,
          ...(contact.name.trim() ? { customerName: contact.name.trim() } : {}),
          ...(contact.email.trim() ? { customerEmail: contact.email.trim() } : {}),
          ...(contact.note.trim() ? { note: contact.note.trim() } : {}),
        },
        idempotencyKey.current
      );
      const payment = await initializePayment(result.id);
      window.location.assign(payment.authorizationUrl);
    } catch (err) {
      idempotencyKey.current = null;
      toast.error(apiError(err, "Réservation impossible."));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-lg">
      <p className="text-lg">
        <span className="font-display text-2xl font-bold">{formatXAF(listing.nightlyPrice)}</span>
        <span className="text-muted-foreground"> / nuit</span>
      </p>

      {step === "dates" ? (
        <>
          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border text-sm">
            <div className="border-r border-border p-3">
              <p className="text-[11px] font-bold uppercase">Arrivée</p>
              <p className="text-muted-foreground">{range.checkIn ? formatDay(range.checkIn) : "Choisir"}</p>
            </div>
            <div className="p-3">
              <p className="text-[11px] font-bold uppercase">Départ</p>
              <p className="text-muted-foreground">{range.checkOut ? formatDay(range.checkOut) : "Choisir"}</p>
            </div>
          </div>
          <StayCalendar marks={marks} selection={range} onSelect={setRange} />
          <div className="rounded-2xl border border-border">
            <Counter label="Voyageurs" value={guests} min={1} max={listing.maxGuests} onChange={setGuests} />
          </div>

          {stay && quote.isLoading && <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />}
          {stay && quote.isError && <p className="text-sm text-destructive">{apiError(quote.error, "Séjour impossible.")}</p>}
          {quote.data && stay && (
            <div className="space-y-2 text-sm">
              <Row label={`${formatXAF(quote.data.nightlyPrice)} × ${quote.data.nights} nuit(s)`} value={formatXAF(quote.data.nightlyPrice * quote.data.nights)} />
              {quote.data.cleaningFee > 0 && <Row label="Frais de ménage" value={formatXAF(quote.data.cleaningFee)} />}
              {quote.data.tax > 0 && <Row label="Taxes" value={formatXAF(quote.data.tax)} />}
              <div className="border-t border-border pt-2">
                <Row label={<strong>Total</strong>} value={<strong>{formatXAF(quote.data.total)}</strong>} />
              </div>
              {!quote.data.available && <p className="text-destructive">Ces dates viennent d&apos;être réservées.</p>}
            </div>
          )}

          <Button
            className="h-12 w-full rounded-xl text-base"
            disabled={!quote.data?.available || !stay}
            onClick={() => setStep("details")}
          >
            {stay ? "Réserver" : "Choisissez vos dates"}
          </Button>
          {listing.minNights > 1 && <p className="text-center text-xs text-muted-foreground">Séjour minimum : {listing.minNights} nuits</p>}
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {range.checkIn && range.checkOut && `${formatDay(range.checkIn)} → ${formatDay(range.checkOut)}`} · {guests} voyageur(s) ·{" "}
            <strong className="text-foreground">{quote.data && formatXAF(quote.data.total)}</strong>
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="stay-name">Nom complet</Label>
            <Input id="stay-name" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stay-phone">Téléphone *</Label>
            <Input id="stay-phone" type="tel" autoComplete="tel" placeholder="+241…" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stay-email">E-mail (confirmation du séjour)</Label>
            <Input id="stay-email" type="email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stay-note">Message à l&apos;hôte</Label>
            <Input id="stay-note" maxLength={500} placeholder="Heure d'arrivée, demande particulière…" value={contact.note} onChange={(e) => setContact({ ...contact, note: e.target.value })} />
          </div>
          <Button className="h-12 w-full rounded-xl text-base" disabled={busy} onClick={() => void book()}>
            {busy ? "Redirection vers le paiement…" : "Payer et confirmer"}
          </Button>
          <button type="button" className="w-full text-sm text-muted-foreground underline" onClick={() => setStep("dates")}>
            Modifier les dates
          </button>
          <p className="text-center text-xs text-muted-foreground">Dates retenues 30 minutes le temps du paiement.</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
