"use client";

import { useState } from "react";
import { ShoppingBag, TrendingUp, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/useApi";
import { BarList, DonutChart } from "@/components/charts/charts";
import { ComparisonChart, Heatmap, KpiTile } from "@/components/charts/advanced";
import { cn } from "@/lib/utils";

// Synthèse avancée, tous secteurs — GET /admin/analytics/overview
// (docs/API_CONTRACT.md §6). Tous les calculs sont faits par l'API.

type Totals = { revenue: number; orders: number; avgBasket: number; customers: number };
type Split = { key: string; revenue: number; orders: number };
type Overview = {
  days: number;
  current: Totals;
  previous: Totals;
  series: { date: string; revenue: number; orders: number; previousRevenue: number }[];
  heatmap: number[][];
  paymentMethods: Split[];
  types: Split[];
  top: { label: string; quantity: number; revenue: number }[];
};

const RANGES = [7, 30, 90] as const;
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const METHOD_LABELS: Record<string, string> = {
  MOBILE_MONEY: "Mobile Money",
  CARD: "Carte",
  CASH: "Espèces",
  PAY_ON_DELIVERY: "À la livraison",
};
const TYPE_LABELS: Record<string, string> = {
  DINE_IN: "Sur place",
  TAKEAWAY: "À emporter",
  DELIVERY: "Livraison",
  EVENT: "Billetterie",
  STAY: "Séjours",
};

const fcfa = (c: number) => `${Math.round(c / 100).toLocaleString("fr-FR")} FCFA`;
const short = (c: number) => {
  const v = c / 100;
  return v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)} M` : v >= 1000 ? `${Math.round(v / 1000)} k` : String(Math.round(v));
};

export function AnalyticsOverview({
  ordersLabel = "Commandes",
  topTitle = "Meilleures ventes",
  topUnit = "vendus",
}: {
  ordersLabel?: string;
  topTitle?: string;
  topUnit?: string;
}) {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const { data, isLoading } = useApiQuery<Overview>(["analytics-overview", days], `/admin/analytics/overview?days=${days}`);

  const series = (data?.series ?? []).map((p) => ({
    label: new Date(`${p.date}T12:00:00`).toLocaleDateString("fr-FR", days === 7 ? { weekday: "short", day: "2-digit" } : { day: "2-digit", month: "short" }),
    value: p.revenue,
    previous: p.previousRevenue,
    count: p.orders,
  }));
  const split = (rows: Split[], labels: Record<string, string>) =>
    rows.map((r, i) => ({ label: labels[r.key] ?? r.key, value: r.revenue, color: COLORS[i % COLORS.length] }));

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-base font-bold">Performance</h2>
        <div className="flex gap-1 rounded-xl bg-muted p-1 text-xs font-medium" role="tablist" aria-label="Période">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={days === r}
              onClick={() => setDays(r)}
              className={cn("rounded-lg px-3 py-1.5", days === r ? "bg-background shadow-sm" : "text-muted-foreground")}
            >
              {r} jours
            </button>
          ))}
        </div>
      </div>

      {isLoading || !data ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile index={0} label="Chiffre d'affaires" value={data.current.revenue} previous={data.previous.revenue} format={fcfa} icon={Wallet} trend={data.series.map((s) => s.revenue)} />
            <KpiTile index={1} label={ordersLabel} value={data.current.orders} previous={data.previous.orders} icon={ShoppingBag} trend={data.series.map((s) => s.orders)} />
            <KpiTile index={2} label="Panier moyen" value={data.current.avgBasket} previous={data.previous.avgBasket} format={fcfa} icon={TrendingUp} />
            <KpiTile index={3} label="Clients uniques" value={data.current.customers} previous={data.previous.customers} icon={Users} />
          </div>

          <Card className="gap-2 rounded-2xl py-4">
            <CardHeader className="pb-0">
              <CardTitle className="font-display text-sm">Chiffre d&apos;affaires · {days} derniers jours</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparisonChart data={series} format={fcfa} countLabel={ordersLabel.toLowerCase()} />
            </CardContent>
          </Card>

          <div className="grid gap-3 lg:grid-cols-12">
            <Card className="gap-2 rounded-2xl py-4 lg:col-span-7">
              <CardHeader className="pb-0">
                <CardTitle className="font-display text-sm">Affluence par jour et heure</CardTitle>
              </CardHeader>
              <CardContent>
                <Heatmap data={data.heatmap} unit={ordersLabel.toLowerCase()} />
              </CardContent>
            </Card>
            <Card className="gap-2 rounded-2xl py-4 lg:col-span-5">
              <CardHeader className="pb-0">
                <CardTitle className="font-display text-sm">Moyens de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={split(data.paymentMethods, METHOD_LABELS)}
                  centerValue={short(data.current.revenue)}
                  centerLabel="FCFA"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 lg:grid-cols-12">
            <Card className={cn("gap-2 rounded-2xl py-4", data.types.length > 1 ? "lg:col-span-7" : "lg:col-span-12")}>
              <CardHeader className="pb-0">
                <CardTitle className="font-display text-sm">{topTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList data={data.top.map((t) => ({ label: `${t.label} · ${t.quantity} ${topUnit}`, value: t.revenue }))} format={fcfa} />
              </CardContent>
            </Card>
            {data.types.length > 1 && (
              <Card className="gap-2 rounded-2xl py-4 lg:col-span-5">
                <CardHeader className="pb-0">
                  <CardTitle className="font-display text-sm">Répartition par service</CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart data={split(data.types, TYPE_LABELS)} centerValue={String(data.current.orders)} centerLabel={ordersLabel.toLowerCase()} />
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </section>
  );
}
