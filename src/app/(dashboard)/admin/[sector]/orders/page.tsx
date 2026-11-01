"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useTenantSector } from "@/hooks/useTenantSector";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ACTION_LABELS,
  NEXT_STATUSES,
  STATUS_LABELS,
  useOrdersList,
  useOrdersRealtime,
  useUpdateOrderStatus,
} from "@/hooks/useOrders";
import { apiError } from "@/lib/api";
import { formatXAF } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/api";

const TABS: { value: string; label: string; statuses: OrderStatus[] }[] = [
  { value: "pending", label: "À confirmer", statuses: ["PENDING"] },
  { value: "kitchen", label: "En cuisine", statuses: ["CONFIRMED", "PREPARING"] },
  { value: "ready", label: "Prêtes", statuses: ["READY"] },
  { value: "done", label: "Terminées", statuses: ["DELIVERED", "COMPLETED"] },
  { value: "cancelled", label: "Annulées", statuses: ["CANCELLED"] },
];

const PAYMENT_LABELS: Record<Order["paymentStatus"], string> = {
  PENDING: "Non payée",
  PAID: "Payée",
  FAILED: "Paiement échoué",
  REFUNDED: "Remboursée",
};

const TYPE_LABELS: Record<Order["type"], string> = {
  DINE_IN: "Sur place",
  TAKEAWAY: "À emporter",
  DELIVERY: "Livraison",
  EVENT: "Billetterie",
};

function OrderTile({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus();
  const onlineUnpaid =
    order.paymentStatus !== "PAID" && (order.paymentMethod === "MOBILE_MONEY" || order.paymentMethod === "CARD");

  async function move(status: OrderStatus) {
    if (status === "CANCELLED" && !window.confirm(`Annuler la commande ${order.orderNumber} ?`)) return;
    try {
      await updateStatus.mutateAsync({ id: order.id, status });
    } catch (err) {
      toast.error(apiError(err, "Échec de la mise à jour"));
    }
  }

  return (
    <Card>
      <CardContent className="space-y-2 pt-6">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono font-medium">{order.orderNumber}</p>
          <p className="font-mono text-sm">{formatXAF(order.total)}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{TYPE_LABELS[order.type]}</Badge>
          <Badge variant={order.paymentStatus === "PAID" ? "secondary" : "outline"}>
            {PAYMENT_LABELS[order.paymentStatus]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {order.customerName ?? "Client"} · {order.customerPhone ?? ""}
        </p>
        <ul className="text-sm">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.quantity}× {item.product?.name ?? item.productId}
              {item.notes && <span className="text-muted-foreground"> — {item.notes}</span>}
            </li>
          ))}
        </ul>
        {onlineUnpaid && order.status === "PENDING" && (
          <p className="text-xs text-warning">Paiement en ligne en attente : confirmez seulement si réglé autrement.</p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {NEXT_STATUSES[order.status].map((next) => (
            <Button
              key={next}
              size="sm"
              variant={next === "CANCELLED" ? "ghost" : "default"}
              className={next === "CANCELLED" ? "text-destructive" : "flex-1"}
              disabled={updateStatus.isPending}
              onClick={() => void move(next)}
            >
              {ACTION_LABELS[next]}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const tenantId = useAuthStore((s) => s.user?.tenantId ?? null);
  const { connected } = useOrdersRealtime(tenantId);
  const { data: orders, isLoading } = useOrdersList({ poll: !connected });
  // Pas de cuisine en boutique : même statuts, libellé métier.
  const { sector } = useTenantSector();
  const tabs = sector === "shop" ? TABS.map((t) => (t.value === "kitchen" ? { ...t, label: "En préparation" } : t)) : TABS;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-semibold">Commandes</h1>
        <span className={`text-xs ${connected ? "text-success" : "text-warning"}`}>
          {connected ? "● Temps réel" : "● Actualisation toutes les 15 s"}
        </span>
      </div>
      <Tabs defaultValue="pending">
        <TabsList className="flex-wrap">
          {tabs.map((tab) => {
            const count = (orders ?? []).filter((o) => tab.statuses.includes(o.status)).length;
            return (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>
        {tabs.map((tab) => {
          const filtered = (orders ?? []).filter((o) => tab.statuses.includes(o.status));
          return (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              {isLoading ? (
                <Skeleton className="h-40" />
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Aucune commande.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((order) => (
                    <OrderTile key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
      <p className="text-xs text-muted-foreground">
        100 dernières commandes. Statuts : {Object.values(STATUS_LABELS).join(" · ")}.
      </p>
    </div>
  );
}
