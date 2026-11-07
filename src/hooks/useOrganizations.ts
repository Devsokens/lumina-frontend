"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";

// Organisations d'un même compte (formule Business, refonte 2026-11) :
// GET /admin/organizations, POST /admin/organizations,
// POST /auth/switch-organization (docs/API_CONTRACT.md §2).

export type Organization = {
  tenantId: string;
  name: string;
  slug: string;
  plan: string;
  logoUrl: string | null;
  role: string;
  current: boolean;
};

export function useOrganizations() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["organizations", userId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Organization[]>>("/admin/organizations");
      return data.data ?? [];
    },
    enabled: !!userId,
    retry: false,
    staleTime: 60_000,
  });
}

// Le serveur pose le cookie de session de l'autre organisation ; la page est
// ensuite rechargée (aucune donnée de l'ancienne organisation ne reste).
export function useSwitchOrganization() {
  return useMutation({
    mutationFn: (tenantId: string) => api.post("/auth/switch-organization", { tenantId }),
  });
}

export type NewOrganization = {
  name: string;
  slug: string;
  activity: string;
  logoUrl?: string;
  copy: { payouts: boolean; emails: boolean; certificate: boolean; siteTheme: boolean };
  members: { userId: string; role: "MANAGER" | "STAFF" }[];
  invites: { contact: string; role: "MANAGER" | "STAFF" }[];
};

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: NewOrganization) => {
      const { data } = await api.post<ApiResponse<{ tenantId: string; invites: { contact: string; inviteUrl: string }[] }>>("/admin/organizations", body);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organizations"] }),
  });
}
