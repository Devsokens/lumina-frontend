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
    enabled: !!slug,
  });
}

// Événements passés (albums « Souvenirs ») : GET /tenants/:slug/past-events.
export type PastEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate: string | null;
  venueName: string | null;
  location: string | null;
  eventType: string | null;
  imageUrl: string | null;
  settings: { album?: string[] };
};

export function usePastEvents(slug: string) {
  return useQuery({
    queryKey: ["public-past-events", slug],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PastEvent[]>>(`/tenants/${slug}/past-events`);
      return data.data ?? [];
    },
    enabled: !!slug,
    // Serveur pas encore à jour : pas d'album, le site reste utilisable.
    retry: false,
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
  // Une ligne par formule (10 billets au plus au total).
  items: { ticketTypeId: string; quantity: number }[];
  customerPhone: string;
  customerName?: string;
  customerEmail?: string;
  // Un nom par billet (billet 1 = l'acheteur) ; billets envoyés à l'acheteur.
  attendees?: { name: string }[];
  // Questionnaire d'inscription : { [questionId]: valeur }.
  answers?: Record<string, string | number | string[]>;
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

// flow PUSH : demande envoyée sur le téléphone du client, authorizationUrl est
// la page d'attente de la vitrine. REDIRECT : formulaire bancaire de PVit.
// simulated : page de paiement simulée (/{slug}/pay/simulate?reference=SIM-…).
type PaymentInit = { authorizationUrl: string; reference: string; simulated?: boolean; flow?: "PUSH" | "REDIRECT" };
export type PaymentChoice = { method: "AIRTEL" | "MOOV" | "CARD"; phone: string };

// Paiement simulé (mode test du backend) validé sans quitter la page.
export async function confirmSimulatedPayment(reference: string, outcome: "success" | "failed") {
  const { data } = await api.post<ApiResponse<PaymentStatusResult>>(
    `/payments/simulate/${encodeURIComponent(reference)}`,
    { outcome }
  );
  return data.data as PaymentStatusResult;
}

// Sans choix (restaurant, séjour) : opérateur déduit du numéro de la commande.
export async function initializePayment(orderId: string, choice?: PaymentChoice) {
  const { data } = await api.post<ApiResponse<PaymentInit>>("/payments/initialize", { orderId, ...choice });
  return data.data as PaymentInit;
}

export async function fetchPaymentStatus(reference: string) {
  const { data } = await api.get<ApiResponse<PaymentStatusResult>>(`/payments/status/${encodeURIComponent(reference)}`);
  return data.data as PaymentStatusResult;
}

const STATUS_POLL_MS = 3_000;
const STATUS_MAX_POLLS = 60; // ~3 min : le temps de valider sur son téléphone

// Page d'attente : interroge le statut tant que le paiement n'est pas validé.
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
