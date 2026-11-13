"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";

// Album photo d'un événement (onglet Album) — routes /admin/events/:id/photos
// (docs/API_CONTRACT.md §6). Les fichiers sont stockés par le serveur ; ici,
// seulement des adresses d'images.

export type EventPhoto = {
  id: string;
  url: string | null;
  thumbUrl: string | null;
  width: number;
  height: number;
  size: number; // octets
  hidden: boolean;
  createdAt: string;
};

export type EventAlbum = {
  limit: number;
  count: number;
  bytes: number;
  // false : stockage des photos non configuré sur le serveur.
  storage: boolean;
  photos: EventPhoto[];
};

const key = (eventId: string) => ["event-photos", eventId];

export function useEventPhotos(eventId: string) {
  return useQuery({
    queryKey: key(eventId),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<EventAlbum>>(`/admin/events/${eventId}/photos`);
      return data.data as EventAlbum;
    },
  });
}

// Une photo (data URL déjà réduite par le navigateur) par requête.
export async function uploadEventPhoto(eventId: string, image: string, signal?: AbortSignal) {
  const { data } = await api.post<ApiResponse<EventPhoto>>(`/admin/events/${eventId}/photos`, { image }, { signal });
  return data.data as EventPhoto;
}

export function useHideEventPhotos(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, hidden }: { ids: string[]; hidden: boolean }) => {
      await api.patch(`/admin/events/${eventId}/photos`, { ids, hidden });
    },
    // Affichage immédiat, corrigé si le serveur refuse.
    onMutate: async ({ ids, hidden }) => {
      await qc.cancelQueries({ queryKey: key(eventId) });
      const before = qc.getQueryData<EventAlbum>(key(eventId));
      if (before) {
        const set = new Set(ids);
        qc.setQueryData<EventAlbum>(key(eventId), { ...before, photos: before.photos.map((p) => (set.has(p.id) ? { ...p, hidden } : p)) });
      }
      return { before };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.before) qc.setQueryData(key(eventId), ctx.before);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key(eventId) }),
  });
}

export function useDeleteEventPhotos(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await api.delete(`/admin/events/${eventId}/photos`, { data: { ids } });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key(eventId) }),
  });
}

export function useRefreshEventPhotos(eventId: string) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: key(eventId) });
}
