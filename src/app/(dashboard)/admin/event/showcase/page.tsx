"use client";

import { useMemo, useState } from "react";
import { ShowcaseEditorToolbar } from "@/components/showcase/showcase-editor-toolbar";
import { ShowcaseCanvas } from "@/components/showcase/showcase-canvas";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminTenantInfo } from "@/hooks/useAdmin";
import { usePublicEvents } from "@/hooks/usePublicEvents";
import { toShowcaseEvent } from "@/lib/events";
import { publicSiteUrl } from "@/lib/tenant-url";
import { showcaseFromConfig, useShowcaseStore } from "@/stores/useShowcaseStore";

export default function ShowcaseEditorPage() {
  const { data: tenant } = useAdminTenantInfo();
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  // Mêmes événements que le site public (en vente), jamais ceux de la démo :
  // l'aperçu est exactement ce que voient les visiteurs.
  const { data: publicEvents } = usePublicEvents(tenant?.slug ?? "");
  const liveEvents = useMemo(() => (publicEvents ?? []).map(toShowcaseEvent), [publicEvents]);

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
    <div className="flex flex-col h-[calc(100dvh-12rem)] sm:h-[calc(100vh-7.5rem)] max-w-7xl mx-auto gap-3 overflow-hidden">
      {/* Zone du haut fixe (Barre d'outils de l'éditeur) */}
      <div className="shrink-0">
        <ShowcaseEditorToolbar slug={tenant.slug} tenantName={tenant.name} config={tenant.config} />
      </div>

      {/* Zone d'affichage et de défilement dédiée de la vitrine (ne passe jamais derrière la barre) */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden rounded-3xl border border-border/60 bg-muted/20 p-1 sm:p-2 [scrollbar-width:thin]">
        <ShowcaseCanvas
          isEditorMode
          liveEvents={liveEvents}
          onReserve={(evt) => window.open(publicSiteUrl(tenant.slug, `/events/${evt.id}`), "_blank", "noopener")}
          allEventsHref={publicSiteUrl(tenant.slug, "/events")}
          manageEventsHref="/admin/event/events"
        />
      </div>
    </div>
  );
}
