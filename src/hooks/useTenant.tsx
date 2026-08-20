"use client";

import { createContext, useContext } from "react";
import type { Tenant } from "@/types/api";

// Le tenant est résolu côté serveur (Server Component, GET /v1/tenants/:slug),
// puis injecté dans l'arbre via <TenantProvider>. Voir app/[tenant]/layout.tsx.
export const TenantContext = createContext<Tenant | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant;
  children: React.ReactNode;
}) {
  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>;
}

export function useTenant(): Tenant {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant doit être utilisé sous <TenantProvider>.");
  return ctx;
}
