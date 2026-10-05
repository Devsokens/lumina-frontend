import axios, { type InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";

// Client HTTP centralisé — voir LUMINA_FRONTEND_CONTEXT.md 4.2.
// withCredentials: true envoie le cookie httpOnly refresh_token au backend
// (domaine api.lumina.ga, cross-domain avec lumina.ga en prod → CORS + SameSite=None; Secure).
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

// Forme uniforme de réponse backend — voir docs/API_CONTRACT.md (Conventions).
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { page: number; limit: number; total: number };
};

// Une seule rotation du refresh token à la fois : le backend invalide
// l'ancien refresh token à chaque usage, et révoque toute la session s'il
// voit un token déjà consommé. Plusieurs 401 simultanés doivent donc
// attendre le même rafraîchissement au lieu d'en lancer chacun un.
let refreshInFlight: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  refreshInFlight ??= axios
    .post<ApiResponse<{ accessToken: string }>>(`${API_URL}/auth/refresh`, {}, {
      withCredentials: true,
      timeout: 15_000,
    })
    .then(({ data }) => {
      const token = data.data?.accessToken;
      if (!token) throw new Error("Session expirée.");
      useAuthStore.getState().setAccessToken(token);
      return token;
    })
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as RetryableConfig | undefined;
    const isAuthRoute = original?.url?.startsWith("/auth/") ?? false;
    const hadSession = !!original?.headers?.Authorization;

    // Un 401 sur /auth/* (mauvais mot de passe, code OTP faux…) ou sur une
    // requête publique n'est pas une session expirée.
    if (err.response?.status === 401 && original && !original._retry && !isAuthRoute && hadSession) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        }
      }
    }

    return Promise.reject(err);
  }
);

// Message d'erreur lisible depuis l'enveloppe { success: false, error }.
export function apiError(err: unknown, fallback = "Une erreur est survenue."): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { error?: unknown } | undefined;
    if (typeof body?.error === "string" && body.error) return body.error;
    if (!err.response) return "Réseau indisponible, réessayez.";
    if (err.response.status === 403) return "Action non autorisée pour votre rôle.";
    if (err.response.status === 429) return "Trop de tentatives, patientez quelques minutes.";
  }
  return fallback;
}
