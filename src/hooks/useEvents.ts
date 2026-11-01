"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import { FEATURES } from "@/lib/features";
import { toEventPayload, ticketTypeBody } from "@/lib/events";
import type { Event, EventStatus, Tenant } from "@/types/api";
import type {
  ApiEvent,
  ApiTicket,
  ApiTicketType,
  AuditEntry,
  EventOrder,
  EventStats,
  Paginated,
  RefundResult,
} from "@/types/events";

// Back-office événementiel — routes /admin/* (docs/API_CONTRACT.md §6, §13, §14).
// Les écrans ouverts pendant l'événement se rafraîchissent par polling
// (pas de canal temps réel côté backend pour la billetterie).
const LIVE_REFRESH_MS = 15_000;

async function get<T>(url: string) {
  const { data } = await api.get<ApiResponse<T>>(url);
  return data.data as T;
}

const keys = {
  events: ["admin-events"] as const,
  event: (id: string) => ["admin-event", id] as const,
  stats: (id?: string) => ["admin-event-stats", id ?? "all"] as const,
  tickets: (id: string) => ["admin-event-tickets", id] as const,
  orders: (id: string, page: number) => ["admin-event-orders", id, page] as const,
};

export function useAdminTenant() {
  return useQuery({ queryKey: ["admin-tenant"], queryFn: () => get<Tenant>("/admin/tenant") });
}

export function useAdminEvents() {
  return useQuery({ queryKey: keys.events, queryFn: () => get<ApiEvent[]>("/admin/events") });
}

export function useAdminEvent(id: string) {
  return useQuery({
    queryKey: keys.event(id),
    queryFn: () => get<ApiEvent>(`/admin/events/${id}`),
  });
}

// OWNER/MANAGER uniquement : en cas de 403 (STAFF) la page s'affiche sans stats.
export function useEventStats(eventId?: string) {
  return useQuery({
    queryKey: keys.stats(eventId),
    queryFn: () =>
      get<EventStats[]>(`/admin/analytics/events${eventId ? `?eventId=${eventId}` : ""}`),
    refetchInterval: LIVE_REFRESH_MS,
    retry: false,
  });
}

export function useEventTickets(eventId: string | null) {
  return useQuery({
    queryKey: keys.tickets(eventId ?? ""),
    queryFn: () => get<ApiTicket[]>(`/admin/events/${eventId}/tickets`),
    enabled: !!eventId,
    refetchInterval: LIVE_REFRESH_MS,
  });
}

export function useEventOrders(eventId: string | null, page = 1, limit = 20) {
  return useQuery({
    queryKey: keys.orders(eventId ?? "", page),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<EventOrder[]>>(
        `/admin/events/${eventId}/orders?page=${page}&limit=${limit}`
      );
      return { data: data.data ?? [], meta: data.meta } as Paginated<EventOrder>;
    },
    enabled: !!eventId,
    retry: false,
  });
}

// Actions d'audit qui demandent une intervention humaine
// (voir docs/ACTIONS_MANUELLES.md §3 du backend). OWNER uniquement.
export const MANUAL_CASE_ACTIONS = [
  "REFUND_FAILED",
  "REFUND_PARTIAL_REVIEW",
  "TICKETS_REFUND_NEEDED",
] as const;

export function useManualCases(enabled: boolean) {
  return useQuery({
    queryKey: ["admin-manual-cases"],
    queryFn: () =>
      get<AuditEntry[]>(`/admin/audit-logs?limit=50&actions=${MANUAL_CASE_ACTIONS.join(",")}`),
    enabled,
    retry: false,
  });
}

function useInvalidateEvents() {
  const qc = useQueryClient();
  return (eventId?: string) => {
    void qc.invalidateQueries({ queryKey: keys.events });
    void qc.invalidateQueries({ queryKey: ["admin-event-stats"] });
    if (eventId) {
      void qc.invalidateQueries({ queryKey: keys.event(eventId) });
      void qc.invalidateQueries({ queryKey: keys.tickets(eventId) });
      void qc.invalidateQueries({ queryKey: ["admin-event-orders", eventId] });
    }
  };
}

// Création / modification d'un événement et de ses formules de billets.
// L'ordre des appels respecte la règle serveur « Σ quantités ≤ jauge » :
// jauge augmentée → événement d'abord ; jauge réduite → formules d'abord.
export function useSaveEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: async ({ existing, form }: { existing: ApiEvent | null; form: Partial<Event> }) => {
      const body = toEventPayload(form);
      const formulas = form.ticketTypes ?? [];

      if (!existing) {
        const created = await api.post<ApiResponse<ApiEvent>>("/admin/events", body);
        const event = created.data.data as ApiEvent;
        for (const f of formulas) {
          await api.post(`/admin/events/${event.id}/ticket-types`, ticketTypeBody(f));
        }
        if (form.status === "PUBLISHED") {
          await api.patch(`/admin/events/${event.id}`, { status: "PUBLISHED" });
        }
        return event.id;
      }

      const existingIds = new Set(existing.ticketTypes.map((t) => t.id));
      const keptIds = new Set(formulas.map((f) => f.id));
      const removed = existing.ticketTypes.filter((t) => !keptIds.has(t.id));
      const updated = formulas.filter((f) => existingIds.has(f.id));
      const added = formulas.filter((f) => !existingIds.has(f.id));

      const syncTypes = async () => {
        for (const t of removed) await api.delete(`/admin/ticket-types/${t.id}`);
        for (const f of updated) {
          const before = existing.ticketTypes.find((t) => t.id === f.id) as ApiTicketType;
          const patch = {
            ...(f.name !== before.name ? { name: f.name } : {}),
            ...(f.price !== before.price ? { price: f.price } : {}),
            ...(f.quantity !== before.quantity ? { quantity: f.quantity } : {}),
            ...((f.description ?? null) !== before.description
              ? { description: f.description ?? "" }
              : {}),
            ...(FEATURES.ticketExtras && (f.saleEndsAt ?? null) !== (before.saleEndsAt ?? null)
              ? { saleEndsAt: f.saleEndsAt ?? null }
              : {}),
            ...(FEATURES.ticketExtras && (f.ticketTemplate ?? null) !== (before.template ?? null)
              ? { template: f.ticketTemplate ?? null }
              : {}),
          };
          if (Object.keys(patch).length > 0) {
            await api.patch(`/admin/ticket-types/${f.id}`, patch);
          }
        }
        for (const f of added) {
          await api.post(`/admin/events/${existing.id}/ticket-types`, ticketTypeBody(f));
        }
      };

      const shrinking = (body.capacity ?? Infinity) < (existing.capacity ?? Infinity);
      if (shrinking) {
        await syncTypes();
        await api.patch(`/admin/events/${existing.id}`, body);
      } else {
        await api.patch(`/admin/events/${existing.id}`, body);
        await syncTypes();
      }
      return existing.id;
    },
    onSettled: (id) => invalidate(id ?? undefined),
  });
}

export function useSetEventStatus() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EventStatus }) =>
      api.patch(`/admin/events/${id}`, { status }),
    onSettled: (_r, _e, { id }) => invalidate(id),
  });
}

export function useDeleteEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/events/${id}`),
    onSettled: () => invalidate(),
  });
}

export function useRefundOrder(eventId: string) {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: async ({ orderId, releaseSeats }: { orderId: string; releaseSeats: boolean }) => {
      const { data } = await api.post<ApiResponse<RefundResult>>(
        `/admin/orders/${orderId}/refund`,
        { releaseSeats }
      );
      return data.data as RefundResult;
    },
    onSettled: () => invalidate(eventId),
  });
}

// Pointage manuel à l'entrée : même endpoint que le scanner (/scan).
export function useCheckIn(eventId: string) {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.post<
        ApiResponse<{ status: "valid" | "used" | "invalid"; detail?: string }>
      >("/admin/scan/validate", { code, eventId });
      return data.data as { status: "valid" | "used" | "invalid"; detail?: string };
    },
    onSettled: () => invalidate(eventId),
  });
}
