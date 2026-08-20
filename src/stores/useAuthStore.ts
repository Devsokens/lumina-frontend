import { create } from "zustand";
import type { Role } from "@/lib/constants";

export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  role: Role;
  tenantId: string;
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
  logout: () => set({ accessToken: null, user: null, status: "unauthenticated" }),
}));
