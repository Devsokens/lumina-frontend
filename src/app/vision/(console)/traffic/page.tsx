"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, Gauge, ServerCrash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart } from "@/components/charts/charts";
import { StatCard } from "@/components/charts/stat-card";
import { PageTitle, Panel, Segmented, StackBar } from "@/components/vision/vision-ui";
import { compact, visionGet } from "@/lib/vision";
import { cn } from "@/lib/utils";

type Row = { requests: number; errors4xx: number; errors5xx: number; avgMs: number };
type Traffic = {
  days: number;
  granularity: "hour" | "day";
  totals: Row & { errorRate: number };
  series: (Row & { at: string })[];
  routes: (Row & { route: string })[];
};

export default function VisionTrafficPage() {
  const [days, setDays] = useState(7);
  const { data, isLoading } = useQuery({
    queryKey: ["vision-traffic", days],
    queryFn: () => visionGet<Traffic>(`/traffic?days=${days}`),
    refetchInterval: 60_000,
  });
  const label = (at: string) =>
    data?.granularity === "hour"
      ? new Date(at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      : new Date(at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  const maxRoute = Math.max(1, ...(data?.routes ?? []).map((r) => r.requests));

  return (
    <>
      <PageTitle
        title="Trafic API"
        subtitle="Requêtes reçues par l'API, agrégées par heure (données mises à jour chaque minute)"
        actions={
          <Segmented
            value={days}
            onChange={setDays}
            options={[
              { value: 1, label: "24 h" },
              { value: 7, label: "7 j" },
              { value: 30, label: "30 j" },
            ]}
          />
        }
      />
      {isLoading || !data ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard index={0} label="Requêtes" value={data.totals.requests} format={compact} icon={Activity} />
            <StatCard index={1} label="Temps de réponse moyen" value={data.totals.avgMs} format={(v) => `${Math.round(v)} ms`} icon={Gauge} />
            <StatCard index={2} label="Taux d'erreur" value={data.totals.errorRate * 100} format={(v) => `${v.toFixed(1)} %`} icon={AlertTriangle} hint={`${data.totals.errors4xx} erreurs client`} />
            <StatCard index={3} label="Erreurs serveur (5xx)" value={data.totals.errors5xx} icon={ServerCrash} />
          </div>

          <Panel title={`Requêtes par ${data.granularity === "hour" ? "heure" : "jour"}`}>
            {data.series.length ? (
              <AreaChart data={data.series.map((s) => ({ label: label(s.at), value: s.requests }))} height={220} format={(v) => `${v.toLocaleString("fr-FR")} req.`} />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">Pas encore de trafic enregistré sur cette période.</p>
            )}
          </Panel>

          <div className="grid gap-4 lg:grid-cols-12">
            <Panel title="Routes les plus sollicitées" className="lg:col-span-8">
              <ul className="space-y-2.5">
                {data.routes.map((r) => {
                  const errRate = r.requests ? (r.errors4xx + r.errors5xx) / r.requests : 0;
                  return (
                    <li key={r.route} className="space-y-1">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <code className="truncate font-mono text-foreground/90">{r.route}</code>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {r.requests.toLocaleString("fr-FR")} · {r.avgMs} ms ·{" "}
                          <span className={cn(errRate > 0.05 && "text-amber-400", r.errors5xx > 0 && "text-red-400")}>
                            {(errRate * 100).toFixed(1)} % err.
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary" style={{ width: `${(r.requests / maxRoute) * 100}%` }} />
                      </div>
                    </li>
                  );
                })}
                {!data.routes.length && <p className="text-sm text-muted-foreground">Aucune donnée.</p>}
              </ul>
            </Panel>
            <Panel title="Répartition des réponses" className="lg:col-span-4">
              <StackBar
                items={[
                  { label: "Succès", value: Math.max(0, data.totals.requests - data.totals.errors4xx - data.totals.errors5xx), color: "var(--chart-1)" },
                  { label: "Erreurs client (4xx)", value: data.totals.errors4xx, color: "var(--chart-3)" },
                  { label: "Erreurs serveur (5xx)", value: data.totals.errors5xx, color: "var(--chart-4)" },
                ]}
              />
              <p className="mt-4 text-xs text-muted-foreground">
                Les 4xx incluent les accès refusés et validations échouées (normal en faible proportion) ; les 5xx signalent un incident.
              </p>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
