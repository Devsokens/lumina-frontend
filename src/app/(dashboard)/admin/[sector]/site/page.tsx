"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SiteEditor } from "@/components/site/site-editor";
import { useAdminTenantInfo } from "@/hooks/useAdmin";

export default function SitePage() {
  const { data: tenant } = useAdminTenantInfo();
  // key : l'éditeur repart du site enregistré si le compte change.
  return tenant ? <SiteEditor key={tenant.id} tenant={tenant} /> : <Skeleton className="h-[70vh]" />;
}
