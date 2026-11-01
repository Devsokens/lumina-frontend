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

  // Contenu du compte appliqué avant le premier rendu, puis réappliqué à
  // chaque nouvelle publication (tenant relu en continu, voir TenantProvider).
  const showcase = (tenant.config as { showcase?: { updatedAt?: string } } | undefined)?.showcase;
  const version = `${tenant.id}:${tenant.name}:${showcase?.updatedAt ?? ""}`;
  const [appliedVersion, setAppliedVersion] = useState<string | null>(null);
  if (appliedVersion !== version) {
    useShowcaseStore.setState({
      ...showcaseFromConfig(tenant.config, tenant.name),
      deviceView: "desktop",
      isEditingInline: false,
    });
    setAppliedVersion(version);
  }
  if (appliedVersion === null) return null;

  return (
    <ShowcaseCanvas
      isEditorMode={false}
      liveEvents={liveEvents}
      onReserve={(evt) => router.push(`/${tenant.slug}/events/${evt.id}`)}
    />
  );
}
