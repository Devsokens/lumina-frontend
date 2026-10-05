"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { usePaymentStatus } from "@/hooks/usePublicEvents";
import { TicketDownloads } from "@/components/vitrine/ticket-downloads";
import { formatXaf } from "@/lib/events";

// Retour de Paystack : ?reference=… (et ?trxref=…, même valeur).
function Confirmation() {
  const tenant = useTenant();
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref");
  const { data, isLoading, isError } = usePaymentStatus(reference);

  const back = (
    <Link href={`/${tenant.slug}/events`} className="text-sm text-primary underline">
      Retour aux événements
    </Link>
  );

  if (!reference || isError) {
    return (
      <div className="space-y-3">
        <XCircle className="size-10 text-destructive" />
        <p className="font-semibold">Paiement introuvable.</p>
        <p className="text-sm text-muted-foreground">
          Si vous avez été débité, vos billets vous seront envoyés par e-mail. Sinon, contactez
          l&apos;organisateur avec votre reçu Paystack.
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
        <p className="text-sm text-muted-foreground">
          Cela peut prendre quelques secondes. Ne fermez pas cette page.
          {data && " Si l'attente se prolonge, vos billets arriveront par e-mail dès la confirmation."}
        </p>
      </div>
    );
  }

  if (data.paymentStatus === "PAID") {
    return (
      <div className="space-y-4">
        <CheckCircle2 className="size-10 text-success" />
        <div>
          <p className="font-display text-xl font-bold">Paiement confirmé</p>
          <p className="text-sm text-muted-foreground">
            Commande {data.orderNumber} · {formatXaf(data.total)}. Présentez le QR code de chaque
            billet à l&apos;entrée.
          </p>
        </div>
        {data.tickets.length > 0 ? (
          <TicketDownloads tickets={data.tickets} />
        ) : (
          <p className="rounded-2xl border border-warning/50 bg-warning/10 p-3 text-sm">
            Paiement reçu après expiration de la réservation et plus de places disponibles :
            l&apos;organisateur va vous rembourser.
          </p>
        )}
        {back}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <XCircle className="size-10 text-destructive" />
      <p className="font-semibold">
        {data.paymentStatus === "REFUNDED" ? "Commande remboursée." : "Paiement non abouti."}
      </p>
      {back}
    </div>
  );
}

export default function PaymentConfirmationPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}>
        <Confirmation />
      </Suspense>
    </main>
  );
}
