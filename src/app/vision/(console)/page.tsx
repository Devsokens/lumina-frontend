"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Coins, Cpu, ShoppingBag, UserCheck, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, BarList, DonutChart } from "@/components/charts/charts";
import { ComparisonChart, KpiTile } from "@/components/charts/advanced";
import { StatCard } from "@/components/charts/stat-card";
import { PageTitle, Panel, Segmented, StackBar } from "@/components/vision/vision-ui";
import { PLAN_LABELS, SECTOR_LABELS, compact, fcfa, fcfaCents, visionGet } from "@/lib/vision";

type Overview = {
  days: number;
  tenants: {
    total: number;
    bySector: { key: string; count: number }[];
    byStatus: { key: string; count: number }[];
    byPlan: { key: string; count: number; mrr: number }[];
  };
  users: { total: number; active: number; passive: number; neverLoggedIn: number; disabled: number; activeWindowDays: number };
  gmv: {
    current: number;
    previous: number;
    orders: number;
    previousOrders: number;
    online: number;
    bySector: { key: string; revenue: number; orders: number }[];
  };
  mrr: number;
  ai: { calls: number; costUsd: number; tokens: number };
  series: { date: string; revenue: number; orders: number; previousRevenue: number; newTenants: number; newUsers: number }[];
};

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function VisionOverviewPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useQuery({
    queryKey: ["vision-overview", days],
    queryFn: () => visionGet<Overview>(`/overview?days=${days}`),
    refetchInterval: 60_000,
  });

  const label = (d: string) =>
    new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", days === 7 ? { weekday: "short", day: "2-digit" } : { day: "2-digit", month: "short" });

  return (
    <>
      <PageTitle
        title="Vue d'ensemble"
        subtitle="Santé de la plateforme, tous comptes confondus"
        actions={
          <Segmented
            value={days}
            onChange={setDays}
            options={[
              { value: 7, label: "7 j" },
              { value: 30, label: "30 j" },
              { value: 90, label: "90 j" },
            ]}
          />
        }
      />

      {isLoading || !data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard index={0} label="Revenu mensuel récurrent (estimé)" value={data.mrr} format={fcfa} icon={Coins} hint="Abonnements actifs × prix des offres" />
            <KpiTile index={1} label="Volume encaissé par les clients" value={data.gmv.current} previous={data.gmv.previous} format={fcfaCents} icon={Wallet} trend={data.series.map((s) => s.revenue)} />
            <KpiTile index={2} label="Commandes réglées" value={data.gmv.orders} previous={data.gmv.previousOrders} icon={ShoppingBag} trend={data.series.map((s) => s.orders)} />
            <StatCard index={3} label="Comptes clients" value={data.tenants.total} icon={Building2} hint={`${data.series.reduce((n, s) => n + s.newTenants, 0)} nouveaux sur la période`} />
          </div>

          <Panel title={`Volume encaissé · ${days} jours vs période précédente`}>
            <ComparisonChart
              data={data.series.map((s) => ({ label: label(s.date), value: s.revenue, previous: s.previousRevenue, count: s.orders }))}
              format={fcfaCents}
            />
          </Panel>

          <div className="grid gap-4 lg:grid-cols-12">
            <Panel title="Inscriptions (utilisateurs)" className="lg:col-span-7">
              <AreaChart data={data.series.map((s) => ({ label: label(s.date), value: s.newUsers }))} height={180} />
            </Panel>
            <Panel title="Activité des utilisateurs" className="lg:col-span-5" aside={<UserCheck className="size-4 text-muted-foreground" />}>
              <p className="mb-4 font-display text-3xl font-bold">
                {data.users.total.toLocaleString("fr-FR")} <span className="text-sm font-normal text-muted-foreground">utilisateurs</span>
              </p>
              <StackBar
                items={[
                  { label: `Actifs (${data.users.activeWindowDays} j)`, value: data.users.active, color: "var(--chart-1)" },
                  { label: "Passifs", value: Math.max(0, data.users.passive - data.users.disabled), color: "var(--chart-2)" },
                  { label: "Désactivés", value: data.users.disabled, color: "var(--chart-5)" },
                ]}
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Dont {data.users.neverLoggedIn.toLocaleString("fr-FR")} jamais connecté(s). Actif = connexion depuis moins de {data.users.activeWindowDays} jours.
              </p>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Comptes par secteur">
              <DonutChart
                data={data.tenants.bySector.map((s, i) => ({ label: SECTOR_LABELS[s.key] ?? s.key, value: s.count, color: COLORS[i % 5] }))}
                centerValue={String(data.tenants.total)}
                centerLabel="comptes"
              />
            </Panel>
            <Panel title="Volume par secteur">
              <BarList data={data.gmv.bySector.map((s) => ({ label: SECTOR_LABELS[s.key] ?? s.key, value: s.revenue }))} format={(v) => `${compact(v / 100)} FCFA`} />
            </Panel>
            <Panel title="Revenu récurrent par offre">
              <BarList data={data.tenants.byPlan.map((p) => ({ label: `${PLAN_LABELS[p.key] ?? p.key} · ${p.count} compte(s)`, value: p.mrr }))} format={fcfa} />
            </Panel>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard index={0} label="Paiements en ligne" value={data.gmv.online} format={fcfaCents} icon={Wallet} hint="Mobile Money et carte" />
            <StatCard index={1} label="Appels IA" value={data.ai.calls} icon={Cpu} hint={`${compact(data.ai.tokens)} jetons · ${data.ai.costUsd.toFixed(2)} $`} />
            <StatCard
              index={2}
              label="Comptes suspendus"
              value={data.tenants.byStatus.find((s) => s.key === "SUSPENDED")?.count ?? 0}
              icon={Building2}
            />
          </div>
        </div>
      )}
    </>
  );
}
