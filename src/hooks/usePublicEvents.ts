"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type {
  PaymentStatusResult,
  PublicEvent,
  PurchaseResult,
} from "@/types/events";

// Vitrine publique de la billetterie (docs/API_CONTRACT.md §8, §14).
// Aucune authentification : le prix est recalculé par le serveur.

export function usePublicEvents(slug: string) {
  return useQuery({
    queryKey: ["public-events", slug],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PublicEvent[]>>(`/tenants/${slug}/events`);
      return data.data ?? [];
    },
  });
}

export function usePublicEvent(slug: string, eventId: string) {
  return useQuery({
    queryKey: ["public-event", slug, eventId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PublicEvent>>(
        `/tenants/${slug}/events/${eventId}`
      );
      return data.data as PublicEvent;
    },
    retry: false,
  });
}

export type PurchaseInput = {
  ticketTypeId: string;
  quantity: number;
  customerPhone: string;
  customerName?: string;
  customerEmail?: string;
};

// Une clé d'idempotence par tentative d'achat : un double clic ou un
// réessai réseau avec la même clé ne crée qu'une commande.
export async function purchaseTickets(eventId: string, input: PurchaseInput, idempotencyKey: string) {
  const { data } = await api.post<ApiResponse<PurchaseResult>>(
    `/events/${eventId}/tickets`,
    input,
    { headers: { "X-Idempotency-Key": idempotencyKey } }
  );
  return data.data as PurchaseResult;
}

export async function initializePayment(orderId: string) {
  const { data } = await api.post<ApiResponse<{ authorizationUrl: string; reference: string }>>(
    "/payments/initialize",
    { orderId }
  );
  return data.data as { authorizationUrl: string; reference: string };
}

const STATUS_POLL_MS = 3_000;
const STATUS_MAX_POLLS = 20; // ~1 min

// Page de retour Paystack : interroge le statut tant que le paiement est en
// attente (le webhook peut arriver quelques secondes après la redirection).
export function usePaymentStatus(reference: string | null) {
  return useQuery({
    queryKey: ["payment-status", reference],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaymentStatusResult>>(
        `/payments/status/${encodeURIComponent(reference ?? "")}`
      );
      return data.data as PaymentStatusResult;
    },
    enabled: !!reference,
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.paymentStatus === "PENDING" &&
      query.state.dataUpdateCount < STATUS_MAX_POLLS
        ? STATUS_POLL_MS
        : false,
  });
}
