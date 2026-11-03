"use client";

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { Tenant } from "@/types/api";

// Le tenant est résolu côté serveur (Server Component, GET /v1/tenants/:slug),
// puis injecté dans l'arbre via <TenantProvider>. Voir app/[tenant]/layout.tsx.
export const TenantContext = createContext<Tenant | null>(null);

// Relu côté client au retour sur l'onglet (au plus une fois par minute) : une
// modification du back-office (vitrine publiée, nom…) apparaît sans
// rechargement. Pas de relecture périodique : un visiteur immobile ne coûte
// aucune requête. Le rendu serveur sert de valeur initiale.
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
    staleTime: 60_000,
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
