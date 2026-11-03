"use client";

import { useQuery } from "@tanstack/react-query";
import { Coins, Receipt, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DonutChart } from "@/components/charts/charts";
import { StatCard } from "@/components/charts/stat-card";
import { PageTitle, Panel, Pill } from "@/components/vision/vision-ui";
import { PLAN_LABELS, fcfa, visionGet } from "@/lib/vision";

type Costs = {
  periodDays: number;
  lines: { label: string; amount: number; kind: "fixed" | "usage" }[];
  total: number;
  mrr: number;
  margin: number;
  assumptions: { usdRate: number; paymentFeePct: number; fixedConfigured: boolean; planPrices: Record<string, number> };
};

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function VisionCostsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["vision-costs"], queryFn: () => visionGet<Costs>("/costs") });

  return (
    <>
      <PageTitle title="Coûts & revenus" subtitle="Estimation sur les 30 derniers jours, en FCFA" />
      {isLoading || !data ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard index={0} label="Revenu récurrent (MRR)" value={data.mrr} format={fcfa} icon={TrendingUp} />
            <StatCard index={1} label="Coûts estimés" value={data.total} format={fcfa} icon={Receipt} />
            <StatCard index={2} label="Marge estimée" value={data.margin} format={fcfa} icon={Coins} hint={data.mrr ? `${Math.round((data.margin / data.mrr) * 100)} % du MRR` : undefined} />
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <Panel title="Détail des coûts" className="lg:col-span-7">
              <ul className="divide-y divide-border">
                {data.lines.map((l) => (
                  <li key={l.label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="flex items-center gap-2">
                      {l.label} <Pill tone={l.kind === "fixed" ? "muted" : "accent"}>{l.kind === "fixed" ? "fixe" : "à l'usage"}</Pill>
                    </span>
                    <span className="font-semibold tabular-nums">{fcfa(l.amount)}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between py-2.5 text-sm font-bold">
                  <span>Total</span>
                  <span className="tabular-nums">{fcfa(data.total)}</span>
                </li>
              </ul>
              {!data.assumptions.fixedConfigured && (
                <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                  Coûts d&apos;hébergement non renseignés : définissez <code>VISION_FIXED_COSTS</code> sur le serveur, par
                  exemple <code>{'{"Render":4500,"Supabase":15000,"Vercel":12000}'}</code> (FCFA / mois).
                </p>
              )}
            </Panel>
            <Panel title="Répartition" className="lg:col-span-5">
              <DonutChart
                data={data.lines.filter((l) => l.amount > 0).map((l, i) => ({ label: l.label, value: l.amount, color: COLORS[i % 5] }))}
                centerValue={Math.round(data.total / 1000).toLocaleString("fr-FR") + " k"}
                centerLabel="FCFA"
              />
            </Panel>
          </div>

          <Panel title="Hypothèses de calcul">
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <li>Taux de change IA : 1 $ = {data.assumptions.usdRate} FCFA (<code>VISION_USD_XAF</code>)</li>
              <li>Frais de paiement : {data.assumptions.paymentFeePct} % des paiements en ligne (<code>VISION_PAYMENT_FEE_PCT</code>)</li>
              <li className="sm:col-span-2">
                Prix des offres (<code>VISION_PLAN_PRICES</code>) :{" "}
                {Object.entries(data.assumptions.planPrices)
                  .map(([k, v]) => `${PLAN_LABELS[k] ?? k} ${fcfa(v)}`)
                  .join(" · ")}
              </li>
            </ul>
          </Panel>
        </div>
      )}
    </>
  );
}
