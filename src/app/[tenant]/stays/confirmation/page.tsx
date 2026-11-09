"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { OrderDocumentButton } from "@/components/vitrine/order-document-button";
import { usePaymentStatus } from "@/hooks/usePublicEvents";
import { formatXAF } from "@/lib/format";

// Attente du paiement (ou retour de la page simulée) d'une réservation de séjour.
function Confirmation() {
  const tenant = useTenant();
  const params = useSearchParams();
  const reference = params.get("reference");
  const { data, isLoading, isError } = usePaymentStatus(reference);
  const back = (
    <Link href={`/${tenant.slug}`} className="text-sm text-primary underline">
      Retour aux logements
    </Link>
  );

  if (!reference || isError) {
    return (
      <div className="space-y-3">
        <XCircle className="size-10 text-destructive" />
        <p className="font-semibold">Paiement introuvable.</p>
        <p className="text-sm text-muted-foreground">Si vous avez été débité, contactez l&apos;hôte avec votre reçu.</p>
        {back}
      </div>
    );
  }

  if (isLoading || !data || data.paymentStatus === "PENDING") {
    return (
      <div className="space-y-3">
        <Clock className="size-10 animate-pulse text-warning" />
        <p className="font-semibold">Confirmation du paiement en cours…</p>
        <p className="text-sm text-muted-foreground">Si vous payez par Mobile Money, validez la demande reçue sur votre téléphone. Ne fermez pas cette page.</p>
      </div>
    );
  }

  if (data.paymentStatus === "PAID") {
    return (
      <div className="space-y-4">
        <CheckCircle2 className="size-10 text-success" />
        <div>
          <p className="font-display text-xl font-bold">Séjour réservé !</p>
          <p className="text-sm text-muted-foreground">
            Réservation {data.orderNumber} · {formatXAF(data.total)}. La confirmation vous est envoyée par
            e-mail ; l&apos;hôte vous contactera avant votre arrivée.
          </p>
        </div>
        {data.documentToken && <OrderDocumentButton orderId={data.orderId} token={data.documentToken} kind="INVOICE" />}
        {back}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <XCircle className="size-10 text-destructive" />
      <p className="font-semibold">Paiement non abouti.</p>
      <p className="text-sm text-muted-foreground">Vos dates ne sont pas réservées. Vous pouvez réessayer.</p>
      {back}
    </div>
  );
}

export default function StayConfirmationPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12">
      <Suspense>
        <Confirmation />
      </Suspense>
    </main>
  );
}
