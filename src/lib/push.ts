import { api, type ApiResponse } from "@/lib/api";

// Notifications push de cet appareil (norme Web Push). L'abonnement vit dans
// le navigateur ; le serveur garde son adresse pour y envoyer les ventes.
// Aucune clé secrète ici : seule la clé publique du serveur est utilisée.

export type PushStatus = { enabled: boolean; publicKey: string | null; devices: number };
export type PushState = "unsupported" | "needs-install" | "blocked" | "off" | "on";

export const PUSH_MESSAGE = "giyax-push";
export type PushEvent = { type: typeof PUSH_MESSAGE; title: string; body: string; url: string; kind?: string };

export function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

// iPhone / iPad : les notifications n'existent que pour l'application
// installée sur l'écran d'accueil.
function iosNotInstalled(): boolean {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return ios && !standalone;
}

async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!pushSupported()) return null;
  return (await navigator.serviceWorker.getRegistration()) ?? null;
}

export async function fetchPushStatus(): Promise<PushStatus> {
  const { data } = await api.get<ApiResponse<PushStatus>>("/admin/push");
  return data.data as PushStatus;
}

export async function pushState(): Promise<PushState> {
  if (typeof window === "undefined") return "unsupported";
  if (!pushSupported()) return iosNotInstalled() ? "needs-install" : "unsupported";
  if (Notification.permission === "denied") return "blocked";
  const reg = await registration();
  const sub = await reg?.pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "on" : "off";
}

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

// À appeler depuis un clic : le navigateur n'affiche sa demande
// d'autorisation qu'après un geste de l'utilisateur.
export async function enablePush(): Promise<void> {
  if (!pushSupported()) throw new Error(iosNotInstalled() ? "Installez d'abord GiyaX sur l'écran d'accueil." : "Ce navigateur ne prend pas en charge les notifications.");
  const status = await fetchPushStatus();
  if (!status.enabled || !status.publicKey) throw new Error("Les notifications ne sont pas encore activées sur GiyaX.");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Autorisation refusée : autorisez les notifications pour ce site dans votre navigateur.");
  const reg = await registration();
  if (!reg) throw new Error("Application pas encore prête sur cet appareil : rechargez la page puis réessayez.");
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(status.publicKey) }));
  const json = sub.toJSON();
  await api.post("/admin/push/subscriptions", { endpoint: sub.endpoint, keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth } });
}

export async function disablePush(): Promise<void> {
  const reg = await registration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await api.delete("/admin/push/subscriptions", { data: { endpoint: sub.endpoint } }).catch(() => undefined);
  await sub.unsubscribe();
}

export async function testPush(): Promise<{ devices: number; sent: number }> {
  const { data } = await api.post<ApiResponse<{ devices: number; sent: number }>>("/admin/push/test");
  return data.data as { devices: number; sent: number };
}
