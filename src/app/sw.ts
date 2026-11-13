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

// --- Notifications push (ventes, cotisations, versements) ---
// Le serveur envoie { title, body, url?, tag?, kind? }. La notification
// s'affiche même GiyaX fermé ; si un onglet est ouvert, il est aussi prévenu
// pour jouer le son de l'application (lib/push.ts, PushListener).
type PushPayload = { title?: string; body?: string; url?: string; tag?: string; kind?: string };

self.addEventListener("push", (event) => {
  let data: PushPayload = {};
  try {
    data = (event.data?.json() ?? {}) as PushPayload;
  } catch {
    data = { body: event.data?.text() };
  }
  const title = data.title || "GiyaX";
  // Lien interne uniquement : jamais d'adresse externe ouverte au clic.
  const url = typeof data.url === "string" && data.url.startsWith("/") && !data.url.startsWith("//") ? data.url : "/admin";
  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, {
        body: data.body ?? "",
        icon: "/brand/giyax-favicon-192.png",
        badge: "/brand/giyax-favicon-192.png",
        tag: data.tag,
        data: { url },
      });
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) client.postMessage({ type: "giyax-push", title, body: data.body ?? "", url, kind: data.kind });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL((event.notification.data as { url?: string } | null)?.url ?? "/admin", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // Un onglet GiyaX déjà ouvert : on le réutilise.
      const open = windows.find((c) => new URL(c.url).origin === self.location.origin);
      if (open) {
        await open.focus();
        await open.navigate(url).catch(() => undefined);
        return;
      }
      await self.clients.openWindow(url);
    })()
  );
});
