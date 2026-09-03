"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";

function AuthBootstrap() {
  const { restoreSession } = useAuth();

  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

import { OrganizationThemeProvider } from "@/components/shared/organization-theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
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
