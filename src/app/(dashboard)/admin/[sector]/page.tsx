"use client";

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
import { StatCard } from "@/components/charts/stat-card";
import { StaysDashboard } from "@/components/stays/stays-dashboard";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";

type DashboardKpis = {
  salesToday: number; // centimes
  ordersInProgress: number;
  lowStockCount: number;
  customersCount: number;
};

const fcfa = (centimes: number) => `${Math.round(centimes / 100).toLocaleString("fr-FR")} FCFA`;

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
  if (sector === "accommodation") return <StaysDashboard />;

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold sm:text-2xl">Tableau de bord</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Activité en temps réel et tendances</p>
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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpisLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
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

      {canSeeKpis && (
        <AnalyticsOverview topTitle={sector === "shop" ? "Top produits" : "Top plats"} topUnit="vendus" />
      )}

      <Card className="rounded-2xl gap-2 py-4">
        <CardHeader className="pb-0">
          <CardTitle className="font-display text-sm">Dernières commandes</CardTitle>
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
