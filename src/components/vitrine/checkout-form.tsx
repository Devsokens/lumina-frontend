"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCartStore } from "@/stores/useCartStore";
import { useTenant } from "@/hooks/useTenant";
import { api, type ApiResponse } from "@/lib/api";

const checkoutSchema = z.object({
  type: z.enum(["DINE_IN", "TAKEAWAY"]),
  customerName: z.string().max(120).optional(),
  customerPhone: z.string().regex(/^\+?[0-9]{8,15}$/, "Numéro invalide"),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table") ?? undefined;
  const tenant = useTenant();
  const { items, clear } = useCartStore();
  const createOrder = useCreateOrder();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { type: tableId ? "DINE_IN" : "TAKEAWAY" },
  });

  async function onSubmit(values: CheckoutInput) {
    setSubmitting(true);
    try {
      const order = await createOrder.mutateAsync({
        tenantSlug: tenant.slug,
        type: values.type,
        tableId,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, notes: i.notes ?? null })),
      });

      // Le montant est TOUJOURS recalculé côté serveur — jamais transmis par
      // le client. Voir LUMINA_Audit_Menaces_Complet.md 10.2.
      const { data } = await api.post<ApiResponse<{ authorizationUrl: string }>>(
        "/payments/initialize",
        { orderId: order.id }
      );

      clear();
      if (data.data?.authorizationUrl) {
        window.location.assign(data.data.authorizationUrl);
      }
    } catch {
      toast.error("Échec de la commande. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label>Mode</Label>
        <Select
          defaultValue={tableId ? "DINE_IN" : "TAKEAWAY"}
          onValueChange={(v) => setValue("type", v as CheckoutInput["type"])}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DINE_IN">Sur place{tableId ? " (table détectée)" : ""}</SelectItem>
            <SelectItem value="TAKEAWAY">À emporter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customerName">Nom (optionnel)</Label>
        <Input id="customerName" {...register("customerName")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customerPhone">Téléphone</Label>
        <Input id="customerPhone" placeholder="+241..." {...register("customerPhone")} />
        {errors.customerPhone && (
          <p className="text-sm text-destructive">{errors.customerPhone.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting || items.length === 0}>
        {submitting ? "Traitement..." : "Payer maintenant"}
      </Button>
    </form>
  );
}
