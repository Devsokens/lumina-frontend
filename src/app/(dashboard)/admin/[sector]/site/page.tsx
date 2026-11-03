"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SiteEditor } from "@/components/site/site-editor";
import { StaySiteEditor } from "@/components/stays/stay-site-editor";
import { useAdminTenantInfo } from "@/hooks/useAdmin";

export default function SitePage() {
  const { data: tenant } = useAdminTenantInfo();
  if (!tenant) return <Skeleton className="h-[70vh]" />;
  // key : l'éditeur repart du site enregistré si le compte change.
  if (tenant.sector === "ACCOMMODATION") return <StaySiteEditor key={tenant.id} tenant={tenant} />;
  return <SiteEditor key={tenant.id} tenant={tenant} />;
}
