"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { usePaymentStatus } from "@/hooks/usePublicEvents";
import { formatXaf } from "@/lib/events";

// Retour de Paystack pour une commande (restaurant / boutique) :
// ?reference=… — même statut public que la billetterie (§8).
function OrderConfirmation() {
  const tenant = useTenant();
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref");
  const { data, isLoading, isError } = usePaymentStatus(reference);
  const back = (
    <Link href={`/${tenant.slug}/menu`} className="text-sm text-primary underline">
      Retour au menu
    </Link>
  );

  if (!reference || isError) {
    return (
      <div className="space-y-3">
        <XCircle className="size-10 text-destructive" />
        <p className="font-semibold">Paiement introuvable.</p>
        <p className="text-sm text-muted-foreground">
          Si vous avez été débité, présentez votre reçu Paystack à l&apos;établissement.
        </p>
        {back}
      </div>
    );
  }

  if (isLoading || !data || data.paymentStatus === "PENDING") {
    return (
      <div className="space-y-3">
        <Clock className="size-10 animate-pulse text-warning" />
        <p className="font-semibold">Confirmation du paiement en cours…</p>
        <p className="text-sm text-muted-foreground">Cela peut prendre quelques secondes.</p>
      </div>
    );
  }

  if (data.paymentStatus === "PAID") {
    return (
      <div className="space-y-3">
        <CheckCircle2 className="size-10 text-success" />
        <p className="font-display text-xl font-bold">Commande {data.orderNumber} payée</p>
        <p className="text-sm text-muted-foreground">
          {formatXaf(data.total)} · votre commande est transmise à l&apos;équipe.
        </p>
        {back}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <XCircle className="size-10 text-destructive" />
      <p className="font-semibold">Paiement non abouti.</p>
      <p className="text-sm text-muted-foreground">
        Votre commande {data.orderNumber} n&apos;est pas payée. Vous pouvez réessayer ou régler sur place.
      </p>
      {back}
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}>
        <OrderConfirmation />
      </Suspense>
    </main>
  );
}
