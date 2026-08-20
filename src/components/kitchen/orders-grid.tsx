"use client";

import { useQueryClient } from "@tanstack/react-query";
import { OrderCard } from "./order-card";
import { useOrdersList, useUpdateOrderStatus, useOrdersRealtime } from "@/hooks/useOrders";
import type { Order } from "@/types/api";

export function OrdersGrid({ tenantId }: { tenantId: string }) {
  const { data: orders } = useOrdersList();
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  useOrdersRealtime(tenantId, () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  });

  const active = (orders ?? []).filter((o) => o.status === "CONFIRMED" || o.status === "PREPARING");

  function handleAdvance(id: string, next: Order["status"]) {
    updateStatus.mutate({ id, status: next });
  }

  if (active.length === 0) {
    return (
      <p className="flex h-full items-center justify-center text-2xl text-muted-foreground">
        Aucune commande en cuisine
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
      {active.map((order) => (
        <OrderCard key={order.id} order={order} onAdvance={handleAdvance} />
      ))}
    </div>
  );
}
