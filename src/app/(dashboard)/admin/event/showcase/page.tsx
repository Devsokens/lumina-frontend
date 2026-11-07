"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SiteEditor } from "@/components/site-editor/site-editor";
import { useAdminTenantInfo } from "@/hooks/useAdmin";

// Éditeur du site vitrine (refonte Claude Design 2026-11, écrans 19 et 20).
export default function ShowcaseEditorPage() {
  const { data: tenant } = useAdminTenantInfo();
  if (!tenant) return <Skeleton className="m-6 h-[70vh]" />;
  // Clé : un autre compte (ou une nouvelle connexion) repart de son contenu publié.
  return <SiteEditor key={tenant.id} tenant={tenant} />;
}
