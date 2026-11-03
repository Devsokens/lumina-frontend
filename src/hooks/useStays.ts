"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type {
  Booking,
  BookingResult,
  BookingStatus,
  Listing,
  ListingBlock,
  ListingInput,
  PublicListing,
  StayQuote,
  StayStats,
} from "@/types/stays";

// Airbnb — docs/API_CONTRACT.md §15. Prix et disponibilités calculés
// par le serveur ; ce fichier ne fait que transporter les données.

async function get<T>(url: string) {
  const { data } = await api.get<ApiResponse<T>>(url);
  return data.data as T;
}

const keys = {
  listings: ["admin-listings"] as const,
  listing: (id: string) => ["admin-listing", id] as const,
  calendar: (id: string, from: string, to: string) => ["admin-listing-calendar", id, from, to] as const,
  bookings: (scope: string) => ["admin-bookings", scope] as const,
  stats: ["admin-stay-stats"] as const,
};

// ---------- Back-office ----------

export function useListings() {
  return useQuery({ queryKey: keys.listings, queryFn: () => get<Listing[]>("/admin/listings") });
}

export function useListing(id: string | null) {
  return useQuery({
    queryKey: keys.listing(id ?? ""),
    queryFn: () => get<Listing>(`/admin/listings/${id}`),
    enabled: !!id,
  });
}

export function useSaveListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: Partial<ListingInput> }) => {
      const { data } = id
        ? await api.patch<ApiResponse<Listing>>(`/admin/listings/${id}`, input, { timeout: 60_000 })
        : await api.post<ApiResponse<Listing>>("/admin/listings", input, { timeout: 60_000 });
      return data.data as Listing;
    },
    onSuccess: (listing) => {
      void qc.invalidateQueries({ queryKey: keys.listings });
      qc.setQueryData(keys.listing(listing.id), listing);
    },
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/listings/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.listings }),
  });
}

export function useListingCalendar(id: string | null, from: string, to: string) {
  return useQuery({
    queryKey: keys.calendar(id ?? "", from, to),
    queryFn: () =>
      get<{ bookings: Booking[]; blocks: ListingBlock[] }>(
        `/admin/listings/${id}/calendar?from=${from}&to=${to}`
      ),
    enabled: !!id,
  });
}

export function useBlockDates() {
  const qc = useQueryClient();
  const refresh = () => void qc.invalidateQueries({ queryKey: ["admin-listing-calendar"] });
  return {
    create: useMutation({
      mutationFn: ({ listingId, ...body }: { listingId: string; startDate: string; endDate: string; reason?: string }) =>
        api.post(`/admin/listings/${listingId}/blocks`, body),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (blockId: string) => api.delete(`/admin/listing-blocks/${blockId}`),
      onSuccess: refresh,
    }),
  };
}

export function useBookings(scope: "upcoming" | "past" | "all" = "upcoming") {
  return useQuery({
    queryKey: keys.bookings(scope),
    queryFn: () => get<Booking[]>(`/admin/bookings?scope=${scope}`),
    refetchInterval: 60_000,
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Extract<BookingStatus, "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED"> }) =>
      api.patch(`/admin/bookings/${id}/status`, { status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      void qc.invalidateQueries({ queryKey: keys.stats });
      void qc.invalidateQueries({ queryKey: ["admin-listing-calendar"] });
    },
  });
}

// OWNER/MANAGER : 403 pour l'accueil (STAFF), la page s'affiche sans stats.
export function useStayStats(enabled = true) {
  return useQuery({
    queryKey: keys.stats,
    queryFn: () => get<StayStats>("/admin/stays/stats"),
    enabled,
    retry: false,
    refetchInterval: 60_000,
  });
}

// ---------- Site public ----------

export function usePublicListings(slug: string) {
  return useQuery({
    queryKey: ["public-listings", slug],
    queryFn: () => get<PublicListing[]>(`/tenants/${slug}/listings`),
  });
}

export function usePublicListing(slug: string, id: string) {
  return useQuery({
    queryKey: ["public-listing", slug, id],
    queryFn: () => get<PublicListing>(`/tenants/${slug}/listings/${id}`),
    retry: false,
  });
}

export function useStayQuote(
  slug: string,
  id: string,
  stay: { checkIn: string; checkOut: string; guests: number } | null
) {
  return useQuery({
    queryKey: ["stay-quote", slug, id, stay],
    queryFn: () =>
      get<StayQuote>(
        `/tenants/${slug}/listings/${id}/quote?checkIn=${stay?.checkIn}&checkOut=${stay?.checkOut}&guests=${stay?.guests}`
      ),
    enabled: !!stay,
    retry: false,
  });
}

export type BookingInput = {
  checkIn: string;
  checkOut: string;
  guests: number;
  customerPhone: string;
  customerName?: string;
  customerEmail?: string;
  note?: string;
};

// Une clé d'idempotence par tentative : un double clic ne réserve qu'une fois.
export async function bookStay(slug: string, id: string, input: BookingInput, idempotencyKey: string) {
  const { data } = await api.post<ApiResponse<BookingResult>>(
    `/tenants/${slug}/listings/${id}/bookings`,
    input,
    { headers: { "X-Idempotency-Key": idempotencyKey } }
  );
  return data.data as BookingResult;
}
