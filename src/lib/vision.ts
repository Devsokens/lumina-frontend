import axios from "axios";
import { API_URL } from "@/lib/constants";

// Console plateforme /vision (administrateurs du SaaS) — docs/API_CONTRACT.md
// §17. Session distincte des comptes tenants : jeton de 30 min gardé dans
// sessionStorage (fermé avec l'onglet), envoyé en Bearer, jamais en cookie.

const KEY = "giyax-vision-session";

export type VisionSession = {
  token: string;
  expiresAt: string;
  admin: { id: string; email: string; name: string };
};

export function getVisionSession(): VisionSession | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as VisionSession;
    return new Date(s.expiresAt).getTime() > Date.now() ? s : null;
  } catch {
    return null;
  }
}

// Session brute (chaîne stable) pour useSyncExternalStore.
export function readVisionSessionRaw(): string | null {
  return getVisionSession() ? sessionStorage.getItem(KEY) : null;
}

export function subscribeVisionSession(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("vision-session", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("vision-session", onChange);
  };
}

export function setVisionSession(s: VisionSession | null) {
  try {
    if (s) sessionStorage.setItem(KEY, JSON.stringify(s));
    else sessionStorage.removeItem(KEY);
  } catch {
    // stockage indisponible : session limitée à la page
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event("vision-session"));
}

export const visionApi = axios.create({ baseURL: `${API_URL}/vision`, timeout: 30_000 });

visionApi.interceptors.request.use((config) => {
  const s = getVisionSession();
  if (s) config.headers.Authorization = `Bearer ${s.token}`;
  return config;
});

// Session expirée ou révoquée : retour à l'écran de connexion.
visionApi.interceptors.response.use(undefined, (err) => {
  if (axios.isAxiosError(err) && err.response?.status === 401 && !err.config?.url?.includes("auth/login")) {
    setVisionSession(null);
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/vision/login")) {
      window.location.replace("/vision/login");
    }
  }
  return Promise.reject(err);
});

export async function visionGet<T>(url: string): Promise<T> {
  const { data } = await visionApi.get<{ data: T }>(url);
  return data.data;
}

// Réponses paginées : { data, meta } (enveloppe de l'API).
export async function visionPage<T>(url: string) {
  const { data } = await visionApi.get<{ data: T[]; meta: { page: number; limit: number; total: number } }>(url);
  return data;
}

export const SECTOR_LABELS: Record<string, string> = {
  RESTAURANT: "Restauration",
  SHOP: "Commerce",
  EVENT: "Événementiel",
  ACCOMMODATION: "Airbnb",
};

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  DELETED: "Supprimé",
};

export const PLAN_LABELS: Record<string, string> = {
  FREE: "Gratuit",
  STANDARD: "Standard",
  PRO: "Pro",
  ENTERPRISE: "Entreprise",
};

export const fcfaCents = (c: number) => `${Math.round(c / 100).toLocaleString("fr-FR")} FCFA`;
export const fcfa = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} FCFA`;
export const compact = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)} M` : v >= 10_000 ? `${Math.round(v / 1000)} k` : Math.round(v).toLocaleString("fr-FR");

export function relative(date: string | null) {
  if (!date) return "Jamais";
  const diff = Date.now() - new Date(date).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d >= 1) return `il y a ${d} j`;
  const h = Math.floor(diff / 3_600_000);
  return h >= 1 ? `il y a ${h} h` : "à l'instant";
}
