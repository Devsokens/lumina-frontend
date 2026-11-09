"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { saveBlob } from "@/lib/download";
import { api } from "@/lib/api";
import type { Order } from "@/types/api";

// Factures des paiements, tous secteurs — docs/API_CONTRACT.md §16.

export type InvoiceRow = Pick<
  Order,
  "id" | "orderNumber" | "type" | "status" | "paymentMethod" | "paymentStatus" | "total" | "customerName" | "customerPhone" | "createdAt"
>;

type InvoicePage = { data: InvoiceRow[]; meta: { page: number; limit: number; total: number; amount: number } };

export function useInvoices(params: { page: number; type?: string; search?: string }) {
  const qs = new URLSearchParams({ page: String(params.page), limit: "20" });
  if (params.type) qs.set("type", params.type);
  if (params.search) qs.set("search", params.search);
  return useQuery({
    queryKey: ["admin-invoices", params],
    queryFn: async () => {
      const { data } = await api.get<{ data: InvoiceRow[]; meta: InvoicePage["meta"] }>(`/admin/invoices?${qs}`);
      return data as InvoicePage;
    },
    placeholderData: keepPreviousData,
  });
}

// PDF authentifié : téléchargé en blob (le jeton d'accès voyage en en-tête).
export async function downloadInvoice(row: Pick<InvoiceRow, "id" | "orderNumber">) {
  const { data } = await api.get<Blob>(`/admin/invoices/${row.id}/pdf`, { responseType: "blob", timeout: 60_000 });
  saveBlob(data, `facture-${row.orderNumber}.pdf`);
}
