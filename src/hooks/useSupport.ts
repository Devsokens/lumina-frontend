"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";

// Assistance : la conversation de la personne connectée avec le support
// GiyaX — routes /admin/support (docs/API_CONTRACT.md). Pas de temps réel
// côté serveur : la conversation est relue toutes les 4 secondes quand le
// panneau est ouvert, toutes les minutes sinon (pastille « non lu »).

export type SupportMessage = { id: string; from: "me" | "support"; body: string; createdAt: string };
// handled : un conseiller suit la conversation ; seenAt : dernière lecture par l'équipe.
export type SupportConversation = { unread: number; waiting: boolean; handled: boolean; seenAt: string | null; messages: SupportMessage[] };

export const SUPPORT_MESSAGE_MAX = 2000;
const KEY = ["support"];

export function useSupport(open: boolean) {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SupportConversation>>("/admin/support");
      return data.data as SupportConversation;
    },
    refetchInterval: open ? 4_000 : 60_000,
    retry: false,
  });
}

export function useSendSupportMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const { data } = await api.post<ApiResponse<SupportMessage>>("/admin/support/messages", { body });
      return data.data as SupportMessage;
    },
    // Le message apparaît tout de suite ; retiré si l'envoi échoue.
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: KEY });
      const before = qc.getQueryData<SupportConversation>(KEY);
      const draft: SupportMessage = { id: `local-${Date.now()}`, from: "me", body, createdAt: new Date().toISOString() };
      qc.setQueryData<SupportConversation>(KEY, { unread: 0, waiting: true, handled: before?.handled ?? false, seenAt: before?.seenAt ?? null, messages: [...(before?.messages ?? []), draft] });
      return { before };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(KEY, ctx?.before),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarkSupportRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post("/admin/support/read");
    },
    onSuccess: () => {
      const current = qc.getQueryData<SupportConversation>(KEY);
      if (current) qc.setQueryData<SupportConversation>(KEY, { ...current, unread: 0 });
    },
  });
}
