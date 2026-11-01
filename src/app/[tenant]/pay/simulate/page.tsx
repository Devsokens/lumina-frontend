"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FlaskConical, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/hooks/useTenant";
import { api, type ApiResponse } from "@/lib/api";
import { apiErrorMessage, formatXaf } from "@/lib/events";
import { PublicTopBar } from "@/components/vitrine/public-top-bar";
import type { PaymentStatusResult } from "@/types/events";

// Page de paiement simulée (mode test du backend, sans Paystack) : remplace
// la page Paystack pour tester tout le parcours de réservation. Le backend
// marque la commande payée et délivre les billets comme un vrai paiement.
function SimulatedCheckout() {
  const tenant = useTenant();
  const router = useRouter();
  const reference = useSearchParams().get("reference") ?? "";
  const [operator, setOperator] = useState<"AIRTEL" | "MOOV">("AIRTEL");
  const [pending, setPending] = useState<"success" | "failed" | null>(null);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["simulated-payment", reference],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaymentStatusResult>>(
        `/payments/status/${encodeURIComponent(reference)}`
      );
      return data.data as PaymentStatusResult;
    },
    enabled: reference.startsWith("SIM-"),
    retry: false,
  });

  function confirmationUrl(type: string) {
    const page = type === "EVENT" ? "events" : "orders";
    return `/${tenant.slug}/${page}/confirmation?reference=${encodeURIComponent(reference)}`;
  }

  async function pay(outcome: "success" | "failed") {
    setPending(outcome);
    try {
      const { data } = await api.post<ApiResponse<PaymentStatusResult>>(
        `/payments/simulate/${encodeURIComponent(reference)}`,
        { outcome }
      );
      router.replace(confirmationUrl(data.data?.type ?? order?.type ?? "EVENT"));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Paiement simulé impossible."));
      setPending(null);
    }
  }

  if (!reference.startsWith("SIM-") || isError) {
    return <p className="text-sm text-muted-foreground">Paiement introuvable ou expiré.</p>;
  }
  if (isLoading || !order) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (order.paymentStatus !== "PENDING") {
    return (
      <div className="space-y-3 text-sm">
        <p>Cette commande a déjà été traitée.</p>
        <Button asChild variant="outline">
          <Link href={confirmationUrl(order.type)}>Voir le résultat</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-warning/50 bg-warning/10 p-3 text-sm">
        <FlaskConical className="mt-0.5 size-4 shrink-0 text-warning" />
        <p>
          <strong>Paiement simulé (mode test).</strong> Aucun débit réel : les billets sont délivrés
          comme après un vrai paiement Mobile Money.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <p className="text-xs text-muted-foreground">Commande {order.orderNumber}</p>
        <p className="font-display text-3xl font-bold">{formatXaf(order.total)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{tenant.name}</p>

        <fieldset className="mt-5 grid grid-cols-2 gap-2">
          <legend className="mb-2 text-sm font-semibold">Opérateur</legend>
          {(["AIRTEL", "MOOV"] as const).map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => setOperator(op)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold ${
                operator === op ? "border-primary bg-primary/10 text-primary" : "border-border"
              }`}
            >
              <Smartphone className="size-4" />
              {op === "AIRTEL" ? "Airtel Money" : "Moov Money"}
            </button>
          ))}
        </fieldset>
      </div>

      <Button size="lg" className="w-full" disabled={pending !== null} onClick={() => pay("success")}>
        {pending === "success" ? "Paiement en cours…" : `Payer ${formatXaf(order.total)}`}
      </Button>
      <Button
        variant="outline"
        className="w-full"
        disabled={pending !== null}
        onClick={() => pay("failed")}
      >
        {pending === "failed" ? "…" : "Simuler un échec de paiement"}
      </Button>
    </div>
  );
}

export default function SimulatedPaymentPage() {
  return (
    <>
      <PublicTopBar backLabel="Annuler" />
      <main className="mx-auto w-full max-w-md px-4 py-8">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}>
          <SimulatedCheckout />
        </Suspense>
      </main>
    </>
  );
}
