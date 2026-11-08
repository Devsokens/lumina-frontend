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

// Image d'affiche (data URL JPEG 1080 × 1350). Appel direct : le studio en
// lance 4 en parallèle, chaque carte se remplit à l'arrivée de son image.
export async function generateVisual(input: VisualInput) {
  const { data } = await api.post<ApiResponse<{ url: string }>>("/admin/ai/event-visual", input, {
    timeout: 90_000,
  });
  return data.data?.url ?? "";
}

export function useGenerateVisual() {
  return useMutation({ mutationFn: generateVisual });
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

// GiyaX AI (docs/API_CONTRACT.md §9) : POST /ai/assistant pour les visiteurs
// de la page d'accueil, /admin/ai/assistant pour les membres connectés.
export type ChatMessage = { role: "user" | "assistant"; content: string };

export function useAssistant(mode: "public" | "admin") {
  return useMutation({
    mutationFn: async (body: { messages: ChatMessage[]; page?: string }) => {
      const { data } = await api.post<ApiResponse<{ reply: string }>>(mode === "admin" ? "/admin/ai/assistant" : "/ai/assistant", body, { timeout: 45_000 });
      return (data.data?.reply ?? "").trim();
    },
  });
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
