"use client";

import { usePayoutSummary, type PayoutRow } from "@/hooks/useAdmin";
import { SettingsCard } from "@/components/events/settings/settings-ui";
import { cn } from "@/lib/utils";

// Recettes de l'organisation : ce qui a été encaissé, retenu et versé.

const francs = (n: number) => `${n.toLocaleString("fr-FR")} F`;
const day = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

const STATUS: Record<PayoutRow["status"], { label: string; tone: string }> = {
  PENDING_APPROVAL: { label: "En préparation", tone: "text-ev-muted" },
  PROCESSING: { label: "En cours d'envoi", tone: "text-ev-muted" },
  FAILED: { label: "En cours de traitement", tone: "text-ev-muted" },
  REVIEW: { label: "En cours de traitement", tone: "text-ev-muted" },
  PAID: { label: "Versé", tone: "text-ev-link" },
  REJECTED: { label: "Non effectué", tone: "text-ev-muted" },
  CANCELLED: { label: "Annulé", tone: "text-ev-muted" },
};

function Figure({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[13px] text-ev-muted">{label}</span>
      <span className={cn("font-semibold", strong ? "text-xl" : "text-[15px]")}>{value}</span>
    </div>
  );
}

export function PayoutBalance() {
  const { data, isLoading, isError } = usePayoutSummary();

  if (isLoading) return <div className="h-40 animate-pulse rounded-[16px] bg-ev-line" />;
  if (isError || !data) return <p className="m-0 text-sm text-ev-danger">Impossible de charger vos recettes.</p>;

  const { balance, payouts, commissionBps, test } = data;
  const rate = String(commissionBps / 100).replace(".", ",");

  return (
    <SettingsCard className="overflow-hidden">
      <div className="flex flex-col gap-0.5 border-b border-ev-line px-5 py-[18px] sm:px-6">
        <span className="text-[15px] font-semibold">Vos recettes</span>
        <span className="text-[13px] text-ev-muted">Commission GiyaX de {rate} % par billet payant, frais de paiement compris.</span>
      </div>
      {test && (
        <p className="m-0 border-b border-ev-line bg-ev-warn-bg px-5 py-2.5 text-[13px] text-ev-gold-text sm:px-6">
          Mode test : ces montants ne seront pas versés.
        </p>
      )}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-5 py-5 sm:px-6 lg:grid-cols-3">
        <Figure label="À venir" value={francs(balance.upcoming)} strong />
        <Figure label="Versement en cours" value={francs(balance.inProgress)} strong />
        <Figure label="Déjà versé" value={francs(balance.paidOut)} strong />
        <Figure label="Ventes encaissées" value={francs(balance.sold)} />
        <Figure label="Commission" value={francs(balance.commission)} />
        <Figure label="Remboursements" value={francs(balance.refunds)} />
      </div>
      {payouts.length > 0 && (
        <ul className="m-0 list-none border-t border-ev-line p-0">
          {payouts.map((p) => {
            const status = STATUS[p.status];
            return (
              <li key={p.id} className="flex items-center justify-between gap-3 border-b border-ev-line px-5 py-3 text-sm last:border-b-0 sm:px-6">
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium">{francs(p.amount)}</span>
                  <span className="truncate text-[13px] text-ev-muted">
                    {day(p.paidAt ?? p.createdAt)} · {p.operator === "MOOV" ? "Moov Money" : "Airtel Money"} {p.phone}
                  </span>
                </span>
                <span className={cn("shrink-0 text-[13px] font-medium", status.tone)}>{status.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </SettingsCard>
  );
}
