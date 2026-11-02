"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api, type ApiResponse } from "@/lib/api";

// Occupation d'une table, lue à l'ouverture du QR (docs/API_CONTRACT.md §4) :
// GET /tenants/:slug/tables/:tableId — public, aucune donnée client.
export type TableOccupancy = {
  id: string;
  number: number;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
  // Couverts déjà déclarés par les commandes en cours de la table.
  seatedGuests: number;
  // Commandes non terminées de la table (plusieurs convives peuvent commander).
  openOrders: number;
};

export function freeSeats(t: TableOccupancy) {
  return Math.max(0, t.capacity - t.seatedGuests);
}

export function usePublicTable(slug: string, tableId: string | null) {
  return useQuery({
    queryKey: ["public-table", slug, tableId],
    queryFn: async () => {
      try {
        const { data } = await api.get<ApiResponse<TableOccupancy>>(
          `/tenants/${slug}/tables/${encodeURIComponent(tableId ?? "")}`
        );
        return data.data ?? null;
      } catch (err) {
        // Route absente ou table supprimée : on commande quand même, sans
        // afficher d'occupation inventée.
        if (isAxiosError(err) && err.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!tableId,
    // D'autres convives commandent en même temps : occupation rafraîchie.
    refetchInterval: 30_000,
    retry: false,
  });
}
