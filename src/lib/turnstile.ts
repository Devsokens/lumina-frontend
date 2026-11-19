// Cloudflare Turnstile (anti-robot, gratuit) : le widget <TurnstileWidget />
// dépose ici un jeton à usage unique ; l'intercepteur Axios (lib/api.ts) le
// joint en en-tête X-Turnstile-Token aux seules requêtes protégées, puis le
// consomme. Sans NEXT_PUBLIC_TURNSTILE_SITE_KEY : rien n'est fait.

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
export const TURNSTILE_HEADER = "X-Turnstile-Token";
export const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// Requêtes protégées côté serveur (TurnstileGuard) : à garder alignées.
const PROTECTED: RegExp[] = [
  /^\/auth\/(login|register|password\/forgot|otp\/request)$/,
  /^\/events\/[^/]+\/tickets$/,
  /^\/orders$/,
  /^\/tenants\/[^/]+\/listings\/[^/]+\/bookings$/,
  /^\/ai\/assistant$/,
];

export function isTurnstileProtected(method: string | undefined, url: string | undefined): boolean {
  if (!TURNSTILE_SITE_KEY || (method ?? "get").toLowerCase() !== "post" || !url) return false;
  const path = url.replace(/^https?:\/\/[^/]+/, "").replace(/^\/v1(?=\/)/, "").split("?")[0];
  return PROTECTED.some((re) => re.test(path));
}

import { useSyncExternalStore } from "react";

let token: string | null = null;
let waiters: ((t: string | null) => void)[] = [];
const resetters = new Set<() => void>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function setTurnstileToken(next: string | null) {
  token = next;
  notify();
  if (next) {
    waiters.forEach((w) => w(next));
    waiters = [];
  }
}

// Jeton disponible, ou attente (vérification en cours) jusqu'à `ms`. Large :
// sur un réseau mobile lent, la vérification peut prendre plusieurs secondes.
export function takeTurnstileToken(ms = 20_000): Promise<string | null> {
  const consume = (t: string | null) => {
    token = null;
    notify();
    // Jeton à usage unique : le widget en prépare un nouveau.
    if (t) resetters.forEach((r) => r());
    return t;
  };
  if (token) return Promise.resolve(consume(token));
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      waiters = waiters.filter((w) => w !== done);
      resolve(null);
    }, ms);
    const done = (t: string | null) => {
      clearTimeout(timer);
      resolve(consume(t));
    };
    waiters.push(done);
  });
}

// Demande un nouveau jeton (refus du serveur, jeton expiré).
export function resetTurnstile() {
  token = null;
  notify();
  resetters.forEach((r) => r());
}

// Message d'erreur du serveur quand la vérification anti-robot échoue.
export function isTurnstileRejection(status: number | undefined, message: unknown): boolean {
  return status === 403 && typeof message === "string" && message.includes("anti-robot");
}

// Vrai quand l'envoi peut partir : jeton prêt, ou Turnstile non configuré.
// Les formulaires protégés désactivent leur bouton tant que c'est faux, au
// lieu de laisser partir une requête qui serait refusée.
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function useTurnstileReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !TURNSTILE_SITE_KEY || token !== null,
    () => !TURNSTILE_SITE_KEY,
  );
}

export function onTurnstileConsumed(reset: () => void): () => void {
  resetters.add(reset);
  return () => resetters.delete(reset);
}
