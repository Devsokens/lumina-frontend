"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage, formatXaf, normalizePhone } from "@/lib/events";
import { initializePayment, purchaseTickets } from "@/hooks/usePublicEvents";
import { TicketDownloads } from "@/components/vitrine/ticket-downloads";
import type { PublicEvent, PurchasedTicket } from "@/types/events";

const MAX_PER_ORDER = 10;
const PHONE_FORMAT = /^\+?[0-9]{8,15}$/;

// Achat de billets (EF-E05). Le montant affiché n'est qu'indicatif : le
// serveur recalcule le prix et réserve les places de façon atomique.
// Formule plus en vente : complète, ou date de fin (early bird) dépassée.
// Le serveur refuse de toute façon la vente ; ceci évite un formulaire voué à l'échec.
function saleClosed(t: PublicEvent["ticketTypes"][number]) {
  return t.remaining === 0 || (!!t.saleEndsAt && new Date(t.saleEndsAt).getTime() <= Date.now());
}

export function TicketPurchase({ event }: { event: PublicEvent }) {
  const available = event.ticketTypes.filter((t) => !saleClosed(t));
  const [ticketTypeId, setTicketTypeId] = useState(available[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [freeTickets, setFreeTickets] = useState<PurchasedTicket[] | null>(null);
  const idempotencyKey = useRef<string | null>(null);

  const selected = event.ticketTypes.find((t) => t.id === ticketTypeId);
  const maxQuantity = Math.min(MAX_PER_ORDER, selected?.remaining ?? 0);

  if (available.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Plus aucun billet en vente pour cet événement.
      </p>
    );
  }

  if (freeTickets) {
    return (
      <div className="space-y-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
        <p className="font-semibold text-foreground">Inscription confirmée !</p>
        <p className="text-sm text-muted-foreground">
          {email ? `Vos billets ont aussi été envoyés à ${email}. ` : ""}
          Présentez le QR code à l&apos;entrée.
        </p>
        <TicketDownloads tickets={freeTickets} />
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const customerPhone = normalizePhone(phone);
    if (!selected) return;
    if (!PHONE_FORMAT.test(customerPhone)) {
      toast.error("Numéro de téléphone invalide (8 à 15 chiffres, ex. +24177123456).");
      return;
    }
    setSubmitting(true);
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      const order = await purchaseTickets(
        event.id,
        {
          ticketTypeId: selected.id,
          quantity,
          customerPhone,
          ...(name.trim() ? { customerName: name.trim() } : {}),
          ...(email.trim() ? { customerEmail: email.trim() } : {}),
        },
        idempotencyKey.current
      );
      if (order.paymentStatus === "PAID") {
        setFreeTickets(order.tickets);
        return;
      }
      const { authorizationUrl } = await initializePayment(order.id);
      window.location.assign(authorizationUrl);
    } catch (err) {
      // Nouvelle tentative = nouvelle clé (les champs ont pu changer).
      idempotencyKey.current = null;
      toast.error(apiErrorMessage(err, "Réservation impossible, réessayez."));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-foreground">Formule</legend>
        {event.ticketTypes.map((t) => (
          <label
            key={t.id}
            className={`flex cursor-pointer items-start justify-between gap-3 rounded-2xl border p-3 ${
              t.id === ticketTypeId ? "border-primary bg-primary/5" : "border-border"
            } ${saleClosed(t) ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <span className="flex items-start gap-2">
              <input
                type="radio"
                name="ticketType"
                value={t.id}
                checked={t.id === ticketTypeId}
                disabled={saleClosed(t)}
                onChange={() => {
                  setTicketTypeId(t.id);
                  setQuantity(1);
                }}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">{t.name}</span>
                {t.description && (
                  <span className="block text-xs text-muted-foreground">{t.description}</span>
                )}
                <span className="block text-xs text-muted-foreground">
                  {t.remaining === 0
                    ? "Complet"
                    : saleClosed(t)
                      ? "Ventes terminées"
                      : `${t.remaining} place(s) restante(s)`}
                </span>
                {t.saleEndsAt && !saleClosed(t) && (
                  <span className="block text-xs font-semibold text-warning">
                    Tarif valable jusqu&apos;au{" "}
                    {new Date(t.saleEndsAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                )}
              </span>
            </span>
            <span className="shrink-0 text-sm font-bold text-foreground">
              {t.price === 0 ? "Gratuit" : formatXaf(t.price)}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex items-center justify-between rounded-2xl border border-border p-3">
        <span className="text-sm font-semibold">Quantité</span>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Retirer un billet"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-6 text-center font-semibold">{quantity}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Ajouter un billet"
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="buyer-name">Nom complet</Label>
          <Input id="buyer-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="buyer-phone">Téléphone *</Label>
          <Input
            id="buyer-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+241 77 12 34 56"
            autoComplete="tel"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="buyer-email">E-mail (recommandé)</Label>
          <Input
            id="buyer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Pour recevoir vos billets"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-display text-xl font-bold">
          {selected && selected.price === 0 ? "Gratuit" : formatXaf((selected?.price ?? 0) * quantity)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Taxes éventuelles calculées à la commande. Paiement sécurisé Paystack (Mobile Money ou
        carte). Une réservation non payée est libérée après 30 min.
      </p>

      <Button type="submit" size="lg" className="w-full" disabled={submitting || !selected}>
        <Ticket className="size-4" />
        {submitting
          ? "Réservation…"
          : selected?.price === 0
            ? "Réserver gratuitement"
            : "Payer et recevoir mes billets"}
      </Button>
    </form>
  );
}
