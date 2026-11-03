"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ShieldAlert, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type ApiResponse } from "@/lib/api";
import { formatXAF } from "@/lib/format";

// Vérification d'authenticité d'un document GiyaX (QR imprimé sur les
// factures, additions et billets) — GET /documents/verify/:code. Le serveur
// recalcule la signature depuis ses données : un PDF retouché est rejeté.

type Result =
  | { valid: false }
  | {
      valid: true;
      type: "INVOICE" | "BILL";
      number: string;
      total: number;
      issuedAt: string;
      paymentStatus: string;
      business: string;
    }
  | {
      valid: true;
      type: "TICKET";
      event: string;
      startDate: string;
      ticketType: string;
      status: string;
      business: string;
    };

const TYPE_LABELS = { INVOICE: "Facture", BILL: "Addition", TICKET: "Billet" };
const TICKET_STATUS: Record<string, string> = {
  VALID: "Valide, pas encore utilisé",
  USED: "Déjà utilisé à l'entrée",
  PENDING: "En attente de paiement",
  CANCELLED: "Annulé",
  REFUNDED: "Remboursé",
};
const PAYMENT_STATUS: Record<string, string> = {
  PAID: "Payé",
  PENDING: "À régler",
  FAILED: "Paiement échoué",
  REFUNDED: "Remboursé",
};

export default function VerifyPage() {
  const { code } = useParams<{ code: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["verify", code],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Result>>(`/documents/verify/${encodeURIComponent(code)}`);
      return data.data as Result;
    },
    retry: false,
  });

  const date = (iso: string) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <p className="text-center font-display text-sm font-semibold tracking-wide text-muted-foreground">GiyaX · Vérification de document</p>
        {isLoading ? (
          <Skeleton className="h-72 rounded-3xl" />
        ) : isError || !data || !data.valid ? (
          <div className="space-y-3 rounded-3xl border border-destructive/40 bg-destructive/5 p-8 text-center">
            <ShieldAlert className="mx-auto size-12 text-destructive" />
            <h1 className="font-display text-2xl font-bold">Document non authentique</h1>
            <p className="text-sm text-muted-foreground">
              Ce code ne correspond à aucun document émis par GiyaX, ou le document a été modifié (montant, numéro).
              Ne l&apos;acceptez pas et contactez l&apos;établissement.
            </p>
          </div>
        ) : (
          <div className="space-y-5 rounded-3xl border border-success/40 bg-success/5 p-8">
            <div className="space-y-2 text-center">
              <ShieldCheck className="mx-auto size-12 text-success" />
              <h1 className="font-display text-2xl font-bold">Document authentique</h1>
              <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <BadgeCheck className="size-4 text-success" /> {TYPE_LABELS[data.type]} émis par {data.business} via GiyaX
              </p>
            </div>
            <dl className="divide-y divide-border rounded-2xl border border-border bg-card text-sm">
              {data.type === "TICKET" ? (
                <>
                  <Row label="Événement" value={data.event} />
                  <Row label="Date" value={date(data.startDate)} />
                  <Row label="Billet" value={data.ticketType} />
                  <Row label="Statut" value={TICKET_STATUS[data.status] ?? data.status} />
                </>
              ) : (
                <>
                  <Row label="Numéro" value={data.number} />
                  <Row label="Émis le" value={date(data.issuedAt)} />
                  <Row label="Montant" value={formatXAF(data.total)} />
                  <Row label="Paiement" value={PAYMENT_STATUS[data.paymentStatus] ?? data.paymentStatus} />
                </>
              )}
            </dl>
            <p className="text-center text-xs text-muted-foreground">
              Vérifiez que ces informations correspondent au document présenté.
            </p>
          </div>
        )}
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="underline">
            giyax
          </Link>{" "}
          · signature Ed25519 vérifiée par le serveur
        </p>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
