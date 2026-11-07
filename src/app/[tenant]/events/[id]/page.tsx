"use client";

import { use } from "react";
import { PublicEventSiteEvent } from "@/components/event-site/event-site";

// Page d'un événement sur le site vitrine (modèle Nuit ou Lumière).
export default function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PublicEventSiteEvent id={id} />;
}
