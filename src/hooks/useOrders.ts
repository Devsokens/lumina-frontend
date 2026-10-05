"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, refreshAccessToken, type ApiResponse } from "@/lib/api";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Order, OrderStatus } from "@/types/api";

// Commandes admin (docs/API_CONTRACT.md §5).

const ORDERS_KEY = ["orders"] as const;
const FALLBACK_POLL_MS = 15_000;

// Transitions acceptées par le backend (sinon 409).
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "PREPARING", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["DELIVERED", "COMPLETED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  READY: "Prête",
  DELIVERED: "Livrée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: "Confirmer",
  PREPARING: "En préparation",
  READY: "Prête",
  DELIVERED: "Servie / livrée",
  COMPLETED: "Terminer",
  CANCELLED: "Annuler",
};

// Liste admin : les 100 dernières commandes (limite serveur). Une seule
// requête partagée par toutes les vues (dashboard, onglets, KDS). Polling
// de secours uniquement quand le temps réel est coupé.
export function useOrdersList(options: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: ORDERS_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Order[]>>("/admin/orders?limit=100");
      return data.data ?? [];
    },
    refetchInterval: options.poll ? FALLBACK_POLL_MS : false,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { data } = await api.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status });
      return data.data as Order;
    },
    onSuccess: (order) => upsertOrder(queryClient, order),
  });
}

function upsertOrder(queryClient: ReturnType<typeof useQueryClient>, order: Order) {
  queryClient.setQueryData<Order[]>(ORDERS_KEY, (orders) => {
    if (!orders) return orders;
    const index = orders.findIndex((o) => o.id === order.id);
    if (index === -1) return [order, ...orders].slice(0, 100);
    const next = orders.slice();
    next[index] = { ...orders[index], ...order };
    return next;
  });
  void queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
}

function wsUrl() {
  // Même hôte et préfixe /v1 que l'API REST (le backend écoute /v1/orders).
  const base = process.env.NEXT_PUBLIC_WS_URL ?? API_URL;
  return `${base.replace(/^http/, "ws").replace(/\/$/, "")}/orders`;
}

// Temps réel KDS — WebSocket natif authentifié par l'access token en query
// param (pas de header possible). Chaque message est une commande complète :
// elle est fusionnée dans le cache, sans recharger la liste. Reconnexion
// avec délai croissant (1 s → 30 s) ; token rafraîchi si la connexion a été
// refusée.
export function useOrdersRealtime(tenantId: string | null) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    let socket: WebSocket | null = null;
    let retry = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const connect = () => {
      const token = useAuthStore.getState().accessToken;
      if (!token || stopped) return;
      socket = new WebSocket(`${wsUrl()}?tenantId=${encodeURIComponent(tenantId)}&token=${encodeURIComponent(token)}`);
      socket.onopen = () => {
        retry = 0;
        setConnected(true);
        // Rattrape ce qui a pu arriver pendant la coupure.
        void queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
      };
      socket.onmessage = (event) => {
        try {
          const order = JSON.parse(event.data as string) as Order;
          if (order?.id) upsertOrder(queryClient, order);
        } catch {
          // message non-JSON ignoré
        }
      };
      socket.onclose = () => {
        setConnected(false);
        if (stopped) return;
        const delay = Math.min(30_000, 1_000 * 2 ** retry);
        retry += 1;
        timer = setTimeout(() => {
          // Token peut-être expiré (15 min) : on le renouvelle avant de réessayer.
          void refreshAccessToken().catch(() => undefined).finally(connect);
        }, delay);
      };
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(timer);
      socket?.close();
    };
  }, [tenantId, queryClient]);

  return { connected };
}
