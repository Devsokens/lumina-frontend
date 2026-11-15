"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { PayoutRow } from "@/hooks/useAdmin";

// Module « Revenus » (propriétaire) — routes /admin/payouts/*
// (docs/API_CONTRACT.md). Montants en francs CFA entiers, comme le grand
// livre du serveur (pas en centimes).

export type MoneyState = "PAID" | "IN_PROGRESS" | "UPCOMING";

export type EventRevenue = {
  eventId: string | null;
  title: string;
  startDate: string | null;
  sales: number;
  sold: number;
  commission: number;
  refunds: number;
  net: number;
  paidOut: number;
  inProgress: number;
  upcoming: number;
  // Cotisations pas encore versées et fenêtre de retrait avant l'événement
  // (phase : avant, pendant ou après la fenêtre ; open : retrait possible
  // maintenant). null : aucune cotisation à retirer.
  contribution?: { available: number; opensAt: string; closesAt: string; min: number; phase: "BEFORE" | "OPEN" | "AFTER"; open: boolean } | null;
};

export type StatementLine = {
  id: string;
  type: "SALE" | "REFUND";
  date: string;
  eventId: string | null;
  eventTitle: string | null;
  orderNumber: string;
  customerName: string | null;
  gross: number;
  commission: number;
  net: number;
  commissionBps: number;
  state: MoneyState;
  payoutId: string | null;
  paidAt: string | null;
};

export type Statement = { rows: StatementLine[]; page: number; limit: number; total: number };

export type PayoutDetail = PayoutRow & {
  holderName: string;
  events: { eventId: string | null; title: string; lines: number; net: number }[];
};

async function get<T>(url: string) {
  const { data } = await api.get<ApiResponse<T>>(url);
  return data.data as T;
}

const query = (params: Record<string, string | number | undefined>) => {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  return q ? `?${q}` : "";
};

// enabled : false pour un rôle qui n'a pas accès (évite un 403 inutile).
export function useRevenueByEvent(eventId?: string, enabled = true) {
  return useQuery({
    queryKey: ["revenue-events", eventId ?? "all"],
    queryFn: () => get<EventRevenue[]>(`/admin/payouts/events${query({ eventId })}`),
    enabled,
  });
}

export function useStatement(page: number, eventId?: string) {
  return useQuery({
    queryKey: ["revenue-statement", eventId ?? "all", page],
    queryFn: () => get<Statement>(`/admin/payouts/statement${query({ page, limit: 20, eventId })}`),
    placeholderData: (previous) => previous,
  });
}

export function fetchStatementExport(eventId?: string) {
  return get<{ truncated: boolean; rows: StatementLine[] }>(`/admin/payouts/statement/export${query({ eventId })}`);
}

// Retrait des cotisations d'un événement (fenêtre fixée par GiyaX).
export function useWithdrawContributions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data } = await api.post<ApiResponse<{ id: string; status: string; amount: number }>>(`/admin/payouts/events/${eventId}/contributions/withdraw`);
      return data.data as { id: string; status: string; amount: number };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["revenue-events"] });
      void qc.invalidateQueries({ queryKey: ["revenue-statement"] });
      void qc.invalidateQueries({ queryKey: ["admin-payouts"] });
    },
  });
}

export function usePayoutDetail(id: string | null) {
  return useQuery({
    queryKey: ["revenue-payout", id],
    queryFn: () => get<PayoutDetail>(`/admin/payouts/${id}`),
    enabled: !!id,
  });
}
