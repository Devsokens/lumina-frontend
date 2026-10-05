"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { hasSessionHint, useAuthStore } from "@/stores/useAuthStore";
import { OrganizationThemeProvider } from "@/components/shared/organization-theme-provider";

// Restauration de session hors des zones protégées (landing : bouton
// « Mon espace »). Seulement si une session a déjà été ouverte sur ce
// navigateur — sinon chaque visiteur de vitrine appellerait /auth/refresh,
// route limitée par IP. Les zones protégées restaurent via <AuthGuard>.
function AuthBootstrap() {
  const { restoreSession } = useAuth();

  useEffect(() => {
    if (useAuthStore.getState().status === "idle" && hasSessionHint()) {
      void restoreSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            // Pas de nouvel essai sur les erreurs « métier » (4xx) : seules
            // les pannes réseau / 5xx sont retentées une fois.
            retry: (failureCount, error) => {
              const status = (error as { response?: { status?: number } })?.response?.status;
              if (status && status >= 400 && status < 500) return false;
              return failureCount < 1;
            },
          },
          mutations: { retry: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationThemeProvider>
        <AuthBootstrap />
        {children}
        <Toaster richColors position="top-center" />
      </OrganizationThemeProvider>
    </QueryClientProvider>
  );
}
