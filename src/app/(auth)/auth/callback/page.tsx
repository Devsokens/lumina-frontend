"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { homePathFor, useAuth } from "@/hooks/useAuth";

// Retour de Google pour un compte existant : le backend a déjà posé le
// cookie refresh_token (aucun token dans l'URL). On l'échange contre un
// access token puis on redirige vers l'espace du tenant.
export default function GoogleCallbackPage() {
  const router = useRouter();
  const { restoreSession } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      const user = await restoreSession();
      router.replace(user ? await homePathFor(user) : "/login?error=google_session");
    })();
  }, [restoreSession, router]);

  return <p className="text-sm text-muted-foreground">Connexion avec Google en cours…</p>;
}
