"use client";

import Link from "next/link";
import { Wallet, ClipboardList, PackageX, Users, QrCode } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/useApi";
import { useOrdersList } from "@/hooks/useOrders";
import { useParams } from "next/navigation";

type DashboardKpis = {
  salesToday: number; // centimes
  ordersInProgress: number;
  lowStockCount: number;
  customersCount: number;
};

export default function DashboardHomePage() {
  const { sector } = useParams<{ sector: string }>();
  const { data: kpis, isLoading: kpisLoading } = useApiQuery<DashboardKpis>(
    ["dashboard-kpis"],
    "/admin/analytics/kpis"
  );
  const { data: orders, isLoading: ordersLoading } = useOrdersList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Tableau de bord</h1>
        <Button asChild variant="outline">
          <Link href={`/admin/${sector}/qr`}>
            <QrCode className="size-4" />
            Voir mon QR code
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <KpiCard
              label="Ventes du jour"
              value={`${((kpis?.salesToday ?? 0) / 100).toLocaleString("fr-FR")} FCFA`}
              icon={Wallet}
            />
            <KpiCard
              label="Commandes en cours"
              value={String(kpis?.ordersInProgress ?? 0)}
              icon={ClipboardList}
            />
            <KpiCard label="Stock alerte" value={String(kpis?.lowStockCount ?? 0)} icon={PackageX} />
            <KpiCard label="Clients" value={String(kpis?.customersCount ?? 0)} icon={Users} />
          </>
        )}
      </div>

      <Card>
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
