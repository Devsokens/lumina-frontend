"use client";

import Link from "next/link";
import { EvCard } from "@/components/events/ev-ui";
import { useRevenueByEvent } from "@/hooks/useRevenue";
import { useAuthStore } from "@/stores/useAuthStore";

// Encart « Revenus » de l'aperçu d'un événement (propriétaire) : ce que cet
// événement a rapporté et où en est l'argent, avec un lien vers le relevé du
// module Revenus déjà filtré sur lui. Montants en francs CFA entiers.

const francs = (n: number) => `${n.toLocaleString("fr-FR")} F`;

export function EventRevenueCard({ eventId }: { eventId: string }) {
  const owner = useAuthStore((s) => s.user?.role) === "OWNER";
  const { data } = useRevenueByEvent(eventId, owner);
  if (!owner) return null;
  const totals = data?.[0];
  // Aucune vente payante : rien à montrer.
  if (!totals) return null;

  const rows: [string, string][] = [
    ["Vendu", francs(totals.sold)],
    ["Commission GiyaX", `− ${francs(totals.commission)}`],
    ...(totals.refunds ? ([["Remboursé", `− ${francs(totals.refunds)}`]] as [string, string][]) : []),
    ["Déjà reversé", francs(totals.paidOut)],
  ];
  return (
    <EvCard className="flex flex-col gap-3.5 p-4 sm:p-[22px]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-[15px] font-semibold">Revenus</h2>
        <Link href={`/admin/event/revenue?onglet=releve&evenement=${eventId}`} className="text-[13px] font-semibold text-ev-link hover:underline">
          Voir le détail
        </Link>
      </div>
      <div className="flex items-baseline justify-between gap-3 rounded-[10px] bg-ev-bg p-3">
        <span className="text-[13px] text-ev-muted">Reste à recevoir</span>
        <span className="text-xl font-semibold tracking-[-0.01em]">{francs(totals.upcoming + totals.inProgress)}</span>
      </div>
      <dl className="m-0 flex flex-col gap-2 text-[13px]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <dt className="text-ev-muted">{label}</dt>
            <dd className="m-0 font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </EvCard>
  );
}
