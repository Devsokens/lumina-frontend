import { create } from "zustand";
import type { Role } from "@/lib/constants";

export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  role: Role;
  tenantId: string;
  // Membre créé par l'OWNER avec un mot de passe temporaire : toutes les
  // routes /admin/* répondent 403 tant qu'il n'est pas changé.
  mustChangePassword?: boolean;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  setAccessToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthState["status"]) => void;
  logout: () => void;
};

// Indice (non sensible) qu'une session a été ouverte sur ce navigateur :
// évite d'appeler /auth/refresh pour chaque visiteur anonyme (vitrine,
// landing), route limitée à 5 appels / 15 min par IP.
const SESSION_HINT_KEY = "lumina-session";

export function hasSessionHint(): boolean {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSessionHint(active: boolean) {
  try {
    if (active) localStorage.setItem(SESSION_HINT_KEY, "1");
    else localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // stockage indisponible (navigation privée) : sans conséquence
  }
}

// Access token gardé UNIQUEMENT en mémoire (jamais localStorage/cookie côté JS).
// Voir LUMINA_FRONTEND_CONTEXT.md 4.5 et LUMINA_Audit_Menaces_Complet.md 3.1.
// Pas de middleware `persist` ici, volontairement.
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  status: "idle",
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  logout: () => {
    setSessionHint(false);
    set({ accessToken: null, user: null, status: "unauthenticated" });
  },
}));
