"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import { useApiQuery } from "@/hooks/useApi";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Order, OrderItem, OrderType } from "@/types/api";

// Liste admin (authentifiée) — GET /v1/admin/orders?status=&page=&limit=
export function useOrdersList(status?: string) {
  const qs = status ? `?status=${status}` : "";
  return useApiQuery<Order[]>(["orders", status ?? "all"], `/admin/orders${qs}`);
}

type CreateOrderInput = {
  tenantSlug: string;
  type: OrderType;
  tableId?: string;
  customerName?: string;
  customerPhone: string;
  customerEmail?: string;
  items: Pick<OrderItem, "productId" | "quantity" | "notes">[];
};

// Création (public, vitrine) — POST /v1/orders avec clé d'idempotence.
// Voir LUMINA_Audit_Menaces_Complet.md 10.1 (double paiement / race condition).
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const idempotencyKey = crypto.randomUUID();
      const { data } = await api.post<ApiResponse<Order>>("/orders", input, {
        headers: { "X-Idempotency-Key": idempotencyKey },
      });
      return data.data as Order;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

// Mise à jour statut (KDS / dashboard) — PATCH /v1/admin/orders/:id/status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order["status"] }) => {
      const { data } = await api.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, {
        status,
      });
      return data.data as Order;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

// Temps réel KDS — WebSocket authentifié par access token (query param, la
// spec WebSocket ne permet pas de header Authorization). Voir
// docs/API_CONTRACT.md "Realtime".
export function useOrdersRealtime(tenantId: string | null, onOrderEvent: (order: Order) => void) {
  const [connected, setConnected] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!tenantId || !accessToken) return;

    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001").replace(
      /^http/,
      "ws"
    );
    const socket = new WebSocket(
      `${wsUrl}/orders?tenantId=${tenantId}&token=${encodeURIComponent(accessToken)}`
    );

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      try {
        const order = JSON.parse(event.data) as Order;
        onOrderEvent(order);
      } catch {
        // message non-JSON ignoré
      }
    };

    return () => socket.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, accessToken]);

  return { connected };
}
