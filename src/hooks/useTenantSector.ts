"use client";

import { useAdminTenantInfo } from "@/hooks/useAdmin";

// Secteur réel du compte (fourni par le serveur), jamais déduit de l'URL :
// un compte restaurant ne doit pas voir les écrans événementiels en tapant
// /admin/event, et inversement.
export function useTenantSector() {
  const { data: tenant, isLoading } = useAdminTenantInfo();
  return {
    tenant,
    sector: tenant?.sector.toLowerCase(),
    isLoading,
  };
}
