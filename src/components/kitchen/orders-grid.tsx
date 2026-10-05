"use client";

import { toast } from "sonner";
import { OrderCard } from "./order-card";
import { useOrdersList, useOrdersRealtime, useUpdateOrderStatus } from "@/hooks/useOrders";
import { apiError } from "@/lib/api";
import type { OrderStatus } from "@/types/api";

// Écran cuisine : commandes confirmées (payées ou validées en salle) et en
// préparation. Les commandes PENDING attendent d'être confirmées au comptoir
// (page Commandes) — on ne cuisine pas une commande en ligne non payée.
export function OrdersGrid({ tenantId }: { tenantId: string }) {
  const { connected } = useOrdersRealtime(tenantId);
  const { data: orders } = useOrdersList({ poll: !connected });
  const updateStatus = useUpdateOrderStatus();

  const active = (orders ?? [])
    .filter((o) => o.status === "CONFIRMED" || o.status === "PREPARING")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  function handleAdvance(id: string, next: OrderStatus) {
    updateStatus.mutate(
      { id, status: next },
      { onError: (err) => toast.error(apiError(err, "Mise à jour impossible")) }
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 text-sm">
        <span className="font-display font-semibold">Cuisine · {active.length} commande(s)</span>
        <span className={connected ? "text-success" : "text-warning"}>
          {connected ? "● Temps réel" : "● Reconnexion… (actualisation toutes les 15 s)"}
        </span>
      </div>
      {active.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-2xl text-muted-foreground">
          Aucune commande en cuisine
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {active.map((order) => (
            <OrderCard key={order.id} order={order} onAdvance={handleAdvance} />
          ))}
        </div>
      )}
    </div>
  );
}
