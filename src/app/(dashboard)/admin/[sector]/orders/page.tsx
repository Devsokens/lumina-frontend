"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersList, useUpdateOrderStatus } from "@/hooks/useOrders";
import { formatXAF } from "@/lib/format";
import { toast } from "sonner";
import type { OrderStatus } from "@/types/api";

const TABS: { value: string; label: string; statuses: OrderStatus[]; nextStatus?: OrderStatus; nextLabel?: string }[] = [
  { value: "in-progress", label: "En cours", statuses: ["PENDING", "CONFIRMED", "PREPARING"], nextStatus: "READY", nextLabel: "Marquer prêt" },
  { value: "ready", label: "Prêtes", statuses: ["READY"], nextStatus: "DELIVERED", nextLabel: "Marquer livrée" },
  { value: "delivered", label: "Livrées", statuses: ["DELIVERED", "COMPLETED"] },
  { value: "cancelled", label: "Annulées", statuses: ["CANCELLED"] },
];

function OrdersForTab({ tab }: { tab: (typeof TABS)[number] }) {
  const { data: orders, isLoading } = useOrdersList();
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) return <Skeleton className="h-40" />;

  const filtered = (orders ?? []).filter((o) => tab.statuses.includes(o.status));

  if (filtered.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Aucune commande.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((order) => (
        <Card key={order.id}>
          <CardContent className="space-y-2 pt-6">
            <div className="flex items-center justify-between">
              <p className="font-mono font-medium">{order.orderNumber}</p>
              <p className="font-mono text-sm">{formatXAF(order.total)}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {order.customerName ?? "Client anonyme"}
              {order.tableId ? ` · Table` : ""}
            </p>
            <ul className="text-sm">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity}× {item.product?.name ?? item.productId}
                </li>
              ))}
            </ul>
            {tab.nextStatus && (
              <Button
                size="sm"
                className="w-full"
                onClick={async () => {
                  try {
                    await updateStatus.mutateAsync({ id: order.id, status: tab.nextStatus! });
                  } catch {
                    toast.error("Échec de la mise à jour");
                  }
                }}
              >
                {tab.nextLabel}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Commandes</h1>
      <Tabs defaultValue="in-progress">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <OrdersForTab tab={tab} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
