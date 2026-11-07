"use client";

import { useSyncExternalStore } from "react";
import { ROOT_DOMAIN } from "@/lib/constants";

// Préfixe des liens internes d'un site public : vide sur nom.giyax.com (le
// middleware sert déjà /nom), « /nom » sur giyax.vercel.app/nom et en local.
// Rendu serveur : toujours « /nom », valable partout (le middleware évite le
// double préfixe) ; remplacé à l'hydratation pour des adresses propres.
const subscribe = () => () => {};

export function useSiteBase(slug: string): string {
  return useSyncExternalStore(
    subscribe,
    () => (window.location.hostname.toLowerCase() === `${slug}.${ROOT_DOMAIN}` ? "" : `/${slug}`),
    () => `/${slug}`
  );
}
