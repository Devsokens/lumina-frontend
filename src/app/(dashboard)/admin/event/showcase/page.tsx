"use client";

import { useState } from "react";
import { ShowcaseEditorToolbar } from "@/components/showcase/showcase-editor-toolbar";
import { ShowcaseCanvas } from "@/components/showcase/showcase-canvas";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminTenantInfo } from "@/hooks/useAdmin";
import { showcaseFromConfig, useShowcaseStore } from "@/stores/useShowcaseStore";

export default function ShowcaseEditorPage() {
  const { data: tenant } = useAdminTenantInfo();
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  // Charge la vitrine enregistrée du compte (une fois par tenant) : l'éditeur
  // part toujours de ce qui est réellement publié, jamais de la démo.
  // (ajustement pendant le rendu : l'éditeur n'est pas encore monté).
  if (tenant && loadedFor !== tenant.id) {
    useShowcaseStore.setState({
      ...showcaseFromConfig(tenant.config, tenant.name),
      lastSavedAt: null,
    });
    setLoadedFor(tenant.id);
  }

  if (!tenant || loadedFor !== tenant.id) return <Skeleton className="h-[70vh]" />;

  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto">
      {/* Top Floating Editor Toolbar */}
      <ShowcaseEditorToolbar slug={tenant.slug} tenantName={tenant.name} config={tenant.config} />

      {/* Direct In-Context Visual Canvas */}
      <div className="w-full">
        <ShowcaseCanvas isEditorMode={true} />
      </div>
    </div>
  );
}
