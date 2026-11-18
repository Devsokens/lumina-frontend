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

let token: string | null = null;
let waiters: ((t: string | null) => void)[] = [];
const resetters = new Set<() => void>();

export function setTurnstileToken(next: string | null) {
  token = next;
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
  resetters.forEach((r) => r());
}

// Message d'erreur du serveur quand la vérification anti-robot échoue.
export function isTurnstileRejection(status: number | undefined, message: unknown): boolean {
  return status === 403 && typeof message === "string" && message.includes("anti-robot");
}

export function onTurnstileConsumed(reset: () => void): () => void {
  resetters.add(reset);
  return () => resetters.delete(reset);
}
