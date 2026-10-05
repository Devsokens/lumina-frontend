"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/stores/useCartStore";
import { useTenant } from "@/hooks/useTenant";
import { api, apiError, type ApiResponse } from "@/lib/api";
import { formatXAF } from "@/lib/format";
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

// Commande vitrine (docs/API_CONTRACT.md §5) : le serveur recalcule le
// montant ; paiement en ligne → Paystack, sinon paiement sur place.
export function CheckoutForm() {
  const tenant = useTenant();
  const { items, tableId, clear } = useCartStore();
  const [type, setType] = useState<OrderType>(tableId ? "DINE_IN" : "TAKEAWAY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOBILE_MONEY");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  // Même clé tant que la commande n'a pas abouti : un double clic ou un
  // réessai réseau ne crée qu'une commande.
  const idempotencyKey = useRef<string | null>(null);

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
        <p className="text-sm text-muted-foreground">
          Total {formatXAF(placed.total)} à régler{" "}
          {placed.type === "DINE_IN" ? "sur place" : "au retrait"}. Gardez ce numéro.
        </p>
        <Button asChild variant="outline">
          <Link href={`/${tenant.slug}/menu`}>Retour au menu</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(values: CheckoutValues) {
    if (items.length === 0) return;
    setSubmitting(true);
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      const { data } = await api.post<ApiResponse<Order>>(
        "/orders",
        {
          tenantSlug: tenant.slug,
          type,
          paymentMethod,
          ...(type === "DINE_IN" && tableId ? { tableId } : {}),
          ...(values.customerName?.trim() ? { customerName: values.customerName.trim() } : {}),
          customerPhone: values.customerPhone,
          ...(values.customerEmail ? { customerEmail: values.customerEmail } : {}),
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            ...(i.notes ? { notes: i.notes } : {}),
          })),
        },
        { headers: { "X-Idempotency-Key": idempotencyKey.current } }
      );
      const order = data.data as Order;

      if (!ONLINE.includes(paymentMethod)) {
        clear();
        setPlaced(order);
        return;
      }
      // Montant TOUJOURS recalculé côté serveur (LUMINA_Audit_Menaces_Complet.md 10.2).
      const init = await api.post<ApiResponse<{ authorizationUrl: string }>>(
        "/payments/initialize",
        { orderId: order.id }
      );
      clear();
      window.location.assign(init.data.data?.authorizationUrl ?? `/${tenant.slug}/menu`);
    } catch (err) {
      idempotencyKey.current = null;
      toast.error(apiError(err, "Échec de la commande. Réessayez."));
      setSubmitting(false);
    }
  }

  const choice = (active: boolean) =>
    `rounded-xl border p-3 text-left text-sm transition-colors ${
      active ? "border-primary bg-primary/5" : "border-border"
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Mode</legend>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className={choice(type === "DINE_IN")} onClick={() => setType("DINE_IN")}>
            Sur place{tableId ? " (table du QR)" : ""}
          </button>
          <button type="button" className={choice(type === "TAKEAWAY")} onClick={() => setType("TAKEAWAY")}>
            À emporter
          </button>
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Paiement</legend>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={choice(ONLINE.includes(paymentMethod))}
            onClick={() => setPaymentMethod("MOBILE_MONEY")}
          >
            En ligne
            <span className="block text-xs text-muted-foreground">Mobile Money ou carte</span>
          </button>
          <button
            type="button"
            className={choice(paymentMethod === "CASH")}
            onClick={() => setPaymentMethod("CASH")}
          >
            {type === "DINE_IN" ? "Sur place" : "Au retrait"}
            <span className="block text-xs text-muted-foreground">Espèces / comptoir</span>
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

      <p className="text-xs text-muted-foreground">
        Le total définitif (taxes comprises) est calculé à la validation.
      </p>

      <Button type="submit" size="lg" className="w-full" disabled={submitting || items.length === 0}>
        {submitting
          ? "Traitement..."
          : ONLINE.includes(paymentMethod)
            ? "Commander et payer"
            : "Envoyer la commande"}
      </Button>
    </form>
  );
}
