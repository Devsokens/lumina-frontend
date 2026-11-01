"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShowcaseCanvas } from "@/components/showcase/showcase-canvas";
import { useTenant } from "@/hooks/useTenant";
import { usePublicEvents } from "@/hooks/usePublicEvents";
import { toShowcaseEvent } from "@/lib/events";
import { showcaseFromConfig, useShowcaseStore } from "@/stores/useShowcaseStore";

// Vitrine publique d'un organisateur : le contenu publié depuis l'éditeur
// (tenant.config.showcase), les événements réellement en vente et le bouton
// « Réserver » qui mène à la page d'achat réelle (/{slug}/events/{id}).
export function LiveShowcase() {
  const tenant = useTenant();
  const router = useRouter();
  const { data } = usePublicEvents(tenant.slug);
  const liveEvents = useMemo(() => (data ?? []).map(toShowcaseEvent), [data]);

  // Contenu du compte appliqué avant le premier rendu de la vitrine.
  const [appliedFor, setAppliedFor] = useState<string | null>(null);
  if (appliedFor !== tenant.id) {
    useShowcaseStore.setState({
      ...showcaseFromConfig(tenant.config, tenant.name),
      deviceView: "desktop",
      isEditingInline: false,
    });
    setAppliedFor(tenant.id);
  }
  if (appliedFor !== tenant.id) return null;

  return (
    <ShowcaseCanvas
      isEditorMode={false}
      liveEvents={liveEvents}
      onReserve={(evt) => router.push(`/${tenant.slug}/events/${evt.id}`)}
    />
  );
}
