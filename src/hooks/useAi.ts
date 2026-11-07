"use client";

import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api, apiError, type ApiResponse } from "@/lib/api";
import type { EventType } from "@/types/api";

// Assistant IA — appels au backend uniquement (la clé du fournisseur IA ne
// doit jamais être exposée au navigateur). Routes : docs/API_CONTRACT.md §15.

export type DescriptionInput = {
  title: string;
  eventType?: EventType;
  venueName?: string;
  startDate?: string;
  tone?: "festif" | "professionnel" | "premium";
  // Notes libres de l'organisateur (artistes, programme...).
  notes?: string;
};

export type VisualInput = {
  title: string;
  eventType?: EventType;
  style: string;
  prompt?: string;
};

export function useGenerateDescription() {
  return useMutation({
    mutationFn: async (input: DescriptionInput) => {
      const { data } = await api.post<ApiResponse<{ description: string }>>("/admin/ai/event-description", input);
      return data.data?.description ?? "";
    },
  });
}

export function useGenerateVisual() {
  return useMutation({
    mutationFn: async (input: VisualInput) => {
      const { data } = await api.post<ApiResponse<{ url: string }>>("/admin/ai/event-visual", input, {
        timeout: 90_000,
      });
      return data.data?.url ?? "";
    },
  });
}

// 402/403 : fonction réservée à une formule supérieure.
export function isPlanLimited(err: unknown) {
  return isAxiosError(err) && (err.response?.status === 402 || err.response?.status === 403);
}

export function aiError(err: unknown) {
  if (isAxiosError(err) && err.response?.status === 404) {
    return "L'assistant IA n'est pas encore disponible sur le serveur.";
  }
  return apiError(err, "La génération a échoué, réessayez.");
}

// Texte libre (POST /ai/generate, docs/API_CONTRACT.md §9) : réécriture des
// textes du site vitrine. Consigne de 500 caractères au plus (DTO backend).
export function useAiText() {
  return useMutation({
    mutationFn: async ({ prompt, language = "fr" }: { prompt: string; language?: "fr" | "en" }) => {
      const { data } = await api.post<ApiResponse<{ text: string }>>("/ai/generate", { prompt: prompt.slice(0, 500), language });
      return (data.data?.text ?? "").trim();
    },
  });
}
