"use client";

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { Tenant } from "@/types/api";

// Le tenant est résolu côté serveur (Server Component, GET /v1/tenants/:slug),
// puis injecté dans l'arbre via <TenantProvider>. Voir app/[tenant]/layout.tsx.
export const TenantContext = createContext<Tenant | null>(null);

// Relu côté client (retour sur l'onglet, toutes les 60 s) : une modification
// faite dans le back-office (vitrine publiée, nom…) apparaît sur le site
// public sans rechargement. Le rendu serveur sert de valeur initiale.
export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant;
  children: React.ReactNode;
}) {
  const { data } = useQuery({
    queryKey: ["public-tenant", tenant.slug],
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<Tenant>>(`/tenants/${tenant.slug}`);
      return res.data ?? tenant;
    },
    initialData: tenant,
    staleTime: 15_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: false,
  });

  return <TenantContext.Provider value={data ?? tenant}>{children}</TenantContext.Provider>;
}

export function useTenant(): Tenant {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant doit être utilisé sous <TenantProvider>.");
  return ctx;
}
