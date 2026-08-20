import axios from "axios";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";

// Client HTTP centralisé — voir LUMINA_FRONTEND_CONTEXT.md 4.2.
// withCredentials: true envoie le cookie httpOnly refresh_token au backend
// (domaine api.lumina.ga, cross-domain avec lumina.ga en prod → CORS + SameSite=None; Secure).
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Types étendus pour marquer une requête comme déjà retentée.
type RetryableConfig = import("axios").InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as RetryableConfig | undefined;

    if (err.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        useAuthStore.getState().setAccessToken(data.accessToken);
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") window.location.assign("/login");
      }
    }

    return Promise.reject(err);
  }
);

// Forme uniforme de réponse backend — voir LUMINA_BACKEND_CONTEXT.md 4.5.
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { page: number; limit: number; total: number };
};
