"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, refreshAccessToken, type ApiResponse } from "@/lib/api";
import type { Sector } from "@/lib/constants";
import { setSessionHint, useAuthStore, type AuthUser } from "@/stores/useAuthStore";
import type { Tenant } from "@/types/api";

type LoginPayload = { email?: string; phone?: string; password: string };
type SignupPayload = {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  businessName: string;
  slug: string;
  sector: Sector;
  acceptedTerms: true;
};
type GoogleCompletePayload = {
  token: string;
  businessName: string;
  slug: string;
  sector: Sector;
  acceptedTerms: true;
};
type OtpVerifyPayload = { phone: string; code: string };
type SessionResponse = { accessToken: string; user: AuthUser };
export type AccountOption = { sector: Sector; businessName: string; slug: string };
// Même identité, un compte par secteur : le backend demande lequel ouvrir
// (docs/API_CONTRACT.md « Un compte par secteur »).
type LoginResponse = SessionResponse | { accountChoice: { token: string; accounts: AccountOption[] } };

export function selectAccountPath(token: string) {
  return `/auth/select-account?token=${encodeURIComponent(token)}`;
}

// Toute la logique d'auth passe par le backend (JWT access en mémoire +
// refresh httpOnly côté api). Réponses enveloppées { success, data }
// (docs/API_CONTRACT.md §1).
export function useAuth() {
  const { user, accessToken, status, setAccessToken, setUser, setStatus, logout } =
    useAuthStore();
  const router = useRouter();

  const openSession = useCallback(
    (session: SessionResponse | undefined) => {
      if (!session?.accessToken) throw new Error("Réponse de connexion invalide.");
      setAccessToken(session.accessToken);
      setUser(session.user);
      setStatus("authenticated");
      setSessionHint(true);
      return session.user;
    },
    [setAccessToken, setUser, setStatus]
  );

  // Session ouverte → l'utilisateur ; plusieurs comptes → écran de choix, null.
  const openOrChoose = useCallback(
    (response: LoginResponse | undefined) => {
      if (response && "accountChoice" in response) {
        router.push(selectAccountPath(response.accountChoice.token));
        return null;
      }
      return openSession(response);
    },
    [openSession, router]
  );

  const accountChoices = useCallback(async (token: string) => {
    const { data } = await api.post<ApiResponse<{ accounts: AccountOption[] }>>(
      "/auth/account-choice/options",
      { token }
    );
    return data.data?.accounts ?? [];
  }, []);

  const selectAccount = useCallback(
    async (token: string, sector: Sector) => {
      const { data } = await api.post<ApiResponse<SessionResponse>>("/auth/account-choice", {
        token,
        sector,
      });
      return openSession(data.data);
    },
    [openSession]
  );

  const fetchMe = useCallback(async () => {
    const { data } = await api.get<ApiResponse<{ user: AuthUser }>>("/auth/me");
    const me = data.data?.user ?? null;
    setUser(me);
    return me;
  }, [setUser]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/login", payload);
      return openOrChoose(data.data);
    },
    [openOrChoose]
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      const { data } = await api.post<ApiResponse<SessionResponse>>("/auth/register", payload);
      return openSession(data.data);
    },
    [openSession]
  );

  const completeGoogleSignup = useCallback(
    async (payload: GoogleCompletePayload) => {
      const { data } = await api.post<ApiResponse<SessionResponse>>("/auth/google/complete", payload);
      return openSession(data.data);
    },
    [openSession]
  );

  const requestOtp = useCallback(async (phone: string) => {
    await api.post("/auth/otp/request", { phone });
  }, []);

  const verifyOtp = useCallback(
    async (payload: OtpVerifyPayload) => {
      const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/otp/verify", payload);
      return openOrChoose(data.data);
    },
    [openOrChoose]
  );

  // Cookie httpOnly → nouvel access token (rechargement de page, retour Google).
  const restoreSession = useCallback(async () => {
    setStatus("loading");
    try {
      await refreshAccessToken();
      const me = await fetchMe();
      if (!me) throw new Error("Session invalide.");
      setStatus("authenticated");
      setSessionHint(true);
      return me;
    } catch {
      logout();
      return null;
    }
  }, [setStatus, fetchMe, logout]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      // Le backend ferme toutes les sessions : reconnexion obligatoire.
      await api.post("/auth/change-password", { currentPassword, newPassword });
      logout();
    },
    [logout]
  );

  const signOut = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // session déjà invalide côté serveur : on nettoie quand même
    } finally {
      logout();
    }
  }, [logout]);

  return {
    user,
    accessToken,
    status,
    login,
    signup,
    completeGoogleSignup,
    requestOtp,
    verifyOtp,
    accountChoices,
    selectAccount,
    restoreSession,
    changePassword,
    fetchMe,
    signOut,
  };
}

// Page d'accueil après connexion : dépend du secteur du tenant et du rôle.
export async function homePathFor(user: AuthUser): Promise<string> {
  if (user.mustChangePassword) return "/change-password";
  if (user.role === "KITCHEN") return "/kitchen";
  let sector: Sector = "RESTAURANT";
  try {
    const { data } = await api.get<ApiResponse<Tenant>>("/admin/tenant");
    sector = data.data?.sector ?? sector;
  } catch {
    // tenant illisible (réseau) : tableau de bord restauration par défaut
  }
  if (sector === "EVENT") return user.role === "STAFF" ? "/scan" : "/admin/event";
  return `/admin/${sector.toLowerCase()}`;
}
