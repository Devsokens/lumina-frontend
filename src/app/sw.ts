/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type {
  PrecacheEntry,
  RouteMatchCallback,
  RouteMatchCallbackOptions,
  SerwistGlobalConfig,
} from "serwist";
import { Serwist, NetworkFirst, NetworkOnly, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// API publique en lecture (vitrine, menu, événements en vente) : consultable
// hors ligne. Aucune donnée privée n'est mise en cache : les routes /admin,
// /auth, paiements, commandes… passent toujours par le réseau (appareils
// partagés, données sensibles).
const PUBLIC_API = /^\/v1\/(tenants\/[^/]+(\/(menu|categories|products|events)(\/[^/]+)?)?)$/;

// Évalue un matcher Serwist (RegExp sur l'URL complète, chaîne = URL exacte,
// ou fonction), comme le fait le routeur.
function matches(matcher: RegExp | string | RouteMatchCallback, opts: RouteMatchCallbackOptions) {
  if (typeof matcher === "function") return Boolean(matcher(opts));
  if (typeof matcher === "string") return new URL(matcher, self.location.href).href === opts.url.href;
  return matcher.test(opts.url.href);
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url, request }) => request.method === "GET" && PUBLIC_API.test(url.pathname),
      handler: new NetworkFirst({
        cacheName: "giya-public-api",
        networkTimeoutSeconds: 5,
        plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 3600 })],
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/v1/") || url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    // Règles par défaut limitées au même domaine : une ressource externe
    // (images Unsplash, affiches collées par URL) re-téléchargée par le
    // worker passe par fetch() et tombe sous connect-src (bloquée par la
    // CSP). Non interceptée, le navigateur la charge en <img> (img-src).
    ...defaultCache.map((entry) => ({
      ...entry,
      matcher: (opts: RouteMatchCallbackOptions) => opts.sameOrigin && matches(entry.matcher, opts),
    })),
  ],
  // Page hors ligne pour toute navigation sans réseau ni cache.
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
