/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// "Network First" pour l'API, "Cache First" pour les assets statiques.
// Aucune donnée sensible (token, commandes, paiements) en cache.
// Voir LUMINA_FRONTEND_CONTEXT.md 4.6.
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.startsWith("/v1/") || url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({ cacheName: "lumina-api" }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
