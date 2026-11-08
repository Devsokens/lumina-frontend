"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";

// Expérience du membre connecté (docs/API_CONTRACT.md §19) : visite guidée
// vue ou non, demande d'avis due, envoi de l'avis.

export type ExperienceState = { onboardingDone: boolean; feedbackDue: boolean; feedbackAnsweredAt: string | null };

export type FeedbackInput = {
  mode: "survey" | "free" | "both";
  rating?: number;
  nps?: number;
  likes?: string[];
  improvements?: string[];
  category?: "idee" | "probleme" | "autre";
  message?: string;
  page?: string;
};

export function useExperience(enabled = true) {
  return useQuery({
    queryKey: ["me-experience"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ExperienceState>>("/me/experience");
      return data.data as ExperienceState;
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}

function useRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["me-experience"] });
}

export function useCompleteOnboarding() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: () => api.post("/me/onboarding"), onSuccess: refresh });
}

export function useSnoozeFeedback() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: () => api.post("/me/feedback/snooze"), onSuccess: refresh });
}

export function useSendFeedback() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (body: FeedbackInput) => api.post("/me/feedback", body), onSuccess: refresh });
}
