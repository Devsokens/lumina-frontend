"use client";

import { createContext, useContext } from "react";
import type { SiteLook } from "@/lib/event-site-theme";

// Apparence du site en cours (modèle, palette, typographie) : les fenêtres
// ouvertes par-dessus la page (réservation) sont rendues hors du cadre du
// site et reprennent ses couleurs et polices grâce à ce contexte.

export const DEFAULT_LOOK: SiteLook = { model: "nuit", palette: "amber", typo: "expressive", radius: "arrondis" };

export const SiteLookContext = createContext<SiteLook | null>(null);

export function useSiteLook(): SiteLook {
  return useContext(SiteLookContext) ?? DEFAULT_LOOK;
}
