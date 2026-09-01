"use client";

import { useCallback } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import { API_URL, type Sector } from "@/lib/constants";
import { useAuthStore, type AuthUser } from "@/stores/useAuthStore";

type LoginPayload = { email?: string; phone?: string; password: string };
type SignupPayload = {
  fullName: string;
  email?: string;
  phone?: string;
  businessName: string;
  slug: string;
  sector: Sector;
  acceptedTerms: true;
};
type OtpVerifyPayload = { phone: string; code: string };

// Toute la logique d'auth passe par le backend (JWT access en mémoire +
// refresh httpOnly côté api.lumina.ga). Voir LUMINA_FRONTEND_CONTEXT.md 4.5.
export function useAuth() {
  const { user, accessToken, status, setAccessToken, setUser, setStatus, logout } =
    useAuthStore();

  const fetchMe = useCallback(async () => {
    const { data } = await api.get<{ user: AuthUser }>("/auth/me");
    setUser(data.user);
    return data.user;
  }, [setUser]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await api.post<{ accessToken: string; user: AuthUser }>(
        "/auth/login",
        payload
      );
      setAccessToken(data.accessToken);
      setUser(data.user);
      setStatus("authenticated");
      return data.user;
    },
    [setAccessToken, setUser, setStatus]
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      const { data } = await api.post<{ accessToken: string; user: AuthUser }>(
        "/auth/register",
        payload
      );
      setAccessToken(data.accessToken);
      setUser(data.user);
      setStatus("authenticated");
      return data.user;
    },
    [setAccessToken, setUser, setStatus]
  );

  const requestOtp = useCallback(async (phone: string) => {
    await api.post("/auth/otp/request", { phone });
  }, []);

  const verifyOtp = useCallback(
    async (payload: OtpVerifyPayload) => {
      const { data } = await api.post<{ accessToken: string; user: AuthUser }>(
        "/auth/otp/verify",
        payload
      );
      setAccessToken(data.accessToken);
      setUser(data.user);
      setStatus("authenticated");
      return data.user;
    },
    [setAccessToken, setUser, setStatus]
  );

  // Tenté au chargement de l'app (cookie httpOnly → nouvel access token).
  const restoreSession = useCallback(async () => {
    setStatus("loading");
    try {
      const { data } = await axios.post<{ accessToken: string }>(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      setAccessToken(data.accessToken);
      await fetchMe();
      setStatus("authenticated");
    } catch {
      setStatus("unauthenticated");
    }
  }, [setAccessToken, setStatus, fetchMe]);

  const signOut = useCallback(async () => {
    try {
      await api.post("/auth/logout");
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
    requestOtp,
    verifyOtp,
    restoreSession,
    signOut,
  };
}
