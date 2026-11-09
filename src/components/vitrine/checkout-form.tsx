"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/stores/useCartStore";
import { useTenant } from "@/hooks/useTenant";
import { useSiteBase } from "@/hooks/useSiteBase";
import { localSiteUrl } from "@/lib/tenant-url";
import { freeSeats, usePublicTable } from "@/hooks/usePublicTable";
import { TableStatusCard } from "@/components/vitrine/table-status-card";
import { OrderDocumentButton } from "@/components/vitrine/order-document-button";
import { api, apiError, type ApiResponse } from "@/lib/api";
import { formatXAF } from "@/lib/format";
import { FEATURES } from "@/lib/features";
import type { Order, OrderType, PaymentMethod } from "@/types/api";

const checkoutSchema = z.object({
  customerName: z.string().max(120).optional(),
  customerPhone: z
    .string()
    .transform((v) => v.replace(/[\s.()-]/g, ""))
    .pipe(z.string().regex(/^\+?[0-9]{8,15}$/, "Numéro invalide (ex. +24177123456)")),
  customerEmail: z.string().email("E-mail invalide").optional().or(z.literal("")),
});

type CheckoutInput = z.input<typeof checkoutSchema>;
type CheckoutValues = z.output<typeof checkoutSchema>;

const ONLINE: PaymentMethod[] = ["MOBILE_MONEY", "CARD"];
const MAX_GUESTS = 30;

// Commande vitrine (docs/API_CONTRACT.md §5) : le serveur recalcule le
// montant ; paiement en ligne → PVit (facture à la confirmation), sinon
// paiement sur place (addition téléchargeable tout de suite).
export function CheckoutForm() {
  const tenant = useTenant();
  const base = useSiteBase(tenant.slug);
  const { items, tableId, clear } = useCartStore();
  const [type, setType] = useState<OrderType>(tableId ? "DINE_IN" : "TAKEAWAY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOBILE_MONEY");
  const [guests, setGuests] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<(Order & { documentToken: string; tableNumber: number | null }) | null>(null);
  // Même clé tant que la commande n'a pas abouti : un double clic ou un
  // réessai réseau ne crée qu'une commande.
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  const dineIn = type === "DINE_IN" && !!tableId;
  const { data: table } = usePublicTable(tenant.slug, dineIn ? tableId : null);
  const tooManyGuests = !!table && guests > freeSeats(table);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput, unknown, CheckoutValues>({ resolver: zodResolver(checkoutSchema) });

  if (placed) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <p className="font-display text-xl font-semibold">Commande {placed.orderNumber} envoyée</p>
        <p className="text-muted-foreground">
          Total {formatXAF(placed.total)} à régler{" "}
          {placed.type === "DINE_IN"
            ? `sur place${placed.tableNumber ? ` (table ${placed.tableNumber})` : ""}`
            : "au retrait"}
          . Gardez ce numéro.
        </p>
        <OrderDocumentButton orderId={placed.id} token={placed.documentToken} kind="BILL" />
        <Button asChild variant="outline" className="w-full">
          <Link href={`${base}/menu`}>Retour au menu</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(values: CheckoutValues) {
    if (items.length === 0) return;
    if (dineIn && tooManyGuests) {
      toast.error("Plus assez de places libres à cette table.");
      return;
    }
    setSubmitting(true);
    const key = idempotencyKey ?? crypto.randomUUID();
    setIdempotencyKey(key);
    try {
      const { data } = await api.post<ApiResponse<Order & { documentToken: string }>>(
        "/orders",
        {
          tenantSlug: tenant.slug,
          type,
          paymentMethod,
          ...(dineIn ? { tableId } : {}),
          ...(dineIn && FEATURES.tableOccupancy ? { guestCount: guests } : {}),
          ...(values.customerName?.trim() ? { customerName: values.customerName.trim() } : {}),
          customerPhone: values.customerPhone,
          ...(values.customerEmail ? { customerEmail: values.customerEmail } : {}),
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            ...(i.notes ? { notes: i.notes } : {}),
          })),
        },
        { headers: { "X-Idempotency-Key": key } }
      );
      const order = data.data as Order & { documentToken: string };
      if (!ONLINE.includes(paymentMethod)) {
        clear();
        setPlaced({ ...order, tableNumber: dineIn ? (table?.number ?? null) : null });
        return;
      }
      // Montant TOUJOURS recalculé côté serveur (LUMINA_Audit_Menaces_Complet.md 10.2).
      const init = await api.post<ApiResponse<{ authorizationUrl: string }>>(
        "/payments/initialize",
        { orderId: order.id }
      );
      clear();
      window.location.assign(localSiteUrl(base, tenant.slug, init.data.data?.authorizationUrl ?? `${base}/menu`));
    } catch (err) {
      setIdempotencyKey(null);
      toast.error(apiError(err, "Échec de la commande. Réessayez."));
      setSubmitting(false);
    }
  }

  const choice = (active: boolean) =>
    `rounded-xl border p-3 text-left transition-colors ${
      active ? "border-primary bg-primary/5" : "border-border"
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <fieldset className="space-y-2">
        <legend className="font-medium">Mode</legend>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className={choice(type === "DINE_IN")} onClick={() => setType("DINE_IN")}>
            Sur place{tableId ? " (table du QR)" : ""}
          </button>
          <button type="button" className={choice(type === "TAKEAWAY")} onClick={() => setType("TAKEAWAY")}>
            À emporter
          </button>
        </div>
      </fieldset>

      {dineIn && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="guests" className="text-base">
              Nombre de personnes
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Une personne de moins"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <Input
                id="guests"
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_GUESTS}
                value={guests}
                onChange={(e) => setGuests(Math.min(MAX_GUESTS, Math.max(1, Number(e.target.value) || 1)))}
                className="w-16 text-center font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Une personne de plus"
                onClick={() => setGuests((g) => Math.min(MAX_GUESTS, g + 1))}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
          {table && <TableStatusCard table={table} guests={guests} />}
        </div>
      )}

      <fieldset className="space-y-2">
        <legend className="font-medium">Paiement</legend>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={choice(ONLINE.includes(paymentMethod))}
            onClick={() => setPaymentMethod("MOBILE_MONEY")}
          >
            En ligne
            <span className="block text-sm text-muted-foreground">Mobile Money ou carte · facture PDF</span>
          </button>
          <button
            type="button"
            className={choice(paymentMethod === "CASH")}
            onClick={() => setPaymentMethod("CASH")}
          >
            {type === "DINE_IN" ? "Sur place" : "Au retrait"}
            <span className="block text-sm text-muted-foreground">Espèces · addition PDF</span>
          </button>
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="customerName">Nom (optionnel)</Label>
        <Input id="customerName" autoComplete="name" {...register("customerName")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customerPhone">Téléphone</Label>
        <Input id="customerPhone" type="tel" autoComplete="tel" placeholder="+241 77 12 34 56" {...register("customerPhone")} />
        {errors.customerPhone && <p className="text-sm text-destructive">{errors.customerPhone.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customerEmail">E-mail (optionnel, pour le reçu)</Label>
        <Input id="customerEmail" type="email" autoComplete="email" {...register("customerEmail")} />
        {errors.customerEmail && <p className="text-sm text-destructive">{errors.customerEmail.message}</p>}
      </div>

      <p className="text-sm text-muted-foreground">
        Le total définitif (taxes comprises) est calculé à la validation.
      </p>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={submitting || items.length === 0 || (dineIn && tooManyGuests)}
      >
        {submitting
          ? "Traitement..."
          : ONLINE.includes(paymentMethod)
            ? "Commander et payer"
            : "Envoyer la commande"}
      </Button>
    </form>
  );
}
