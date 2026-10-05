"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShowcaseCanvas } from "@/components/showcase/showcase-canvas";
import { useTenant } from "@/hooks/useTenant";
import { usePublicEvents } from "@/hooks/usePublicEvents";
import { toShowcaseEvent } from "@/lib/events";

// Vitrine publique d'un organisateur : la mise en page de l'éditeur, avec
// les événements réellement en vente et le bouton « Réserver » qui mène à
// la page d'achat réelle (/{slug}/events/{id}).
export function LiveShowcase() {
  const tenant = useTenant();
  const router = useRouter();
  const { data } = usePublicEvents(tenant.slug);
  const liveEvents = useMemo(() => (data ?? []).map(toShowcaseEvent), [data]);

  return (
    <ShowcaseCanvas
      isEditorMode={false}
      liveEvents={liveEvents}
      onReserve={(evt) => router.push(`/${tenant.slug}/events/${evt.id}`)}
    />
  );
}
