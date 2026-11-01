"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Wallet, ClipboardList, PackageX, Users, QrCode } from "lucide-react";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/useApi";
import { useOrdersList } from "@/hooks/useOrders";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { AreaChart, BarList, DonutChart } from "@/components/charts/charts";
import { StatCard } from "@/components/charts/stat-card";

type DashboardKpis = {
  salesToday: number; // centimes
  ordersInProgress: number;
  lowStockCount: number;
  customersCount: number;
};

const fcfa = (centimes: number) => `${Math.round(centimes / 100).toLocaleString("fr-FR")} FCFA`;

const STATUS_GROUPS: { label: string; statuses: string[]; color: string }[] = [
  { label: "À confirmer", statuses: ["PENDING"], color: "var(--chart-2)" },
  { label: "En préparation", statuses: ["CONFIRMED", "PREPARING", "READY"], color: "var(--chart-3)" },
  { label: "Terminées", statuses: ["COMPLETED", "DELIVERED"], color: "var(--chart-1)" },
  { label: "Annulées", statuses: ["CANCELLED"], color: "var(--chart-5)" },
];

export default function DashboardHomePage() {
  const { sector } = useParams<{ sector: string }>();
  const role = useAuthStore((st) => st.user?.role);
  // KPIs réservés OWNER/MANAGER côté serveur.
  const canSeeKpis = role === "OWNER" || role === "MANAGER";
  const { data: kpis, isLoading: kpisLoading } = useApiQuery<DashboardKpis>(
    ["dashboard-kpis"],
    "/admin/analytics/kpis",
    canSeeKpis
  );
  const { data: orders, isLoading: ordersLoading } = useOrdersList();
  const [now] = useState(() => Date.now());

  // Graphiques calculés sur les commandes chargées (affichage uniquement).
  const charts = useMemo(() => {
    const list = orders ?? [];
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * 86_400_000);
      return { key: d.toDateString(), label: d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" }), value: 0 };
    });
    const byDay = new Map(days.map((d) => [d.key, d]));
    const products = new Map<string, number>();
    for (const o of list) {
      if (o.status === "CANCELLED") continue;
      const day = byDay.get(new Date(o.createdAt).toDateString());
      if (day) day.value += o.total;
      for (const it of o.items ?? []) {
        const name = it.product?.name ?? "Article";
        products.set(name, (products.get(name) ?? 0) + it.quantity);
      }
    }
    return {
      revenue: days.map(({ label, value }) => ({ label, value })),
      status: STATUS_GROUPS.map((g) => ({
        label: g.label,
        color: g.color,
        value: list.filter((o) => g.statuses.includes(o.status)).length,
      })),
      top: [...products.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
      count: list.length,
    };
  }, [orders, now]);

  if (sector === "accommodation") {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold">Tableau de bord</h1>
        <p className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Le module Hébergement (propriétés, calendrier, réservations) est en préparation. Vous pouvez
          déjà gérer votre équipe et les informations de votre activité.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Tableau de bord</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Activité des 7 derniers jours</p>
        </div>
        {sector === "restaurant" && (
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/admin/${sector}/qr`}>
              <QrCode className="size-4" />
              Voir mon QR code
            </Link>
          </Button>
        )}
      </div>

      {canSeeKpis && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpisLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
          ) : (
            <>
              <StatCard index={0} label="Ventes du jour" value={kpis?.salesToday ?? 0} format={fcfa} icon={Wallet} />
              <StatCard index={1} label="Commandes en cours" value={kpis?.ordersInProgress ?? 0} icon={ClipboardList} />
              <StatCard index={2} label="Stock alerte" value={kpis?.lowStockCount ?? 0} icon={PackageX} />
              <StatCard index={3} label="Clients" value={kpis?.customersCount ?? 0} icon={Users} />
            </>
          )}
        </div>
      )}

      {ordersLoading ? (
        <Skeleton className="h-64 rounded-3xl" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-3xl lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Chiffre d&apos;affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <AreaChart data={charts.revenue} format={fcfa} />
            </CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Statut des commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart data={charts.status} centerValue={String(charts.count)} centerLabel="commandes" />
            </CardContent>
          </Card>
          <Card className="rounded-3xl lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">
                {sector === "shop" ? "Produits les plus vendus" : "Plats les plus commandés"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarList data={charts.top} />
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="font-display">Dernières commandes</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <OrdersTable orders={(orders ?? []).slice(0, 10)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
