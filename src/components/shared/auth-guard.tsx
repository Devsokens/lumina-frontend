"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

// Guard côté client : l'access token vit en mémoire (jamais accessible au
// middleware edge). Voir LUMINA_FRONTEND_CONTEXT.md 4.5 et middleware.ts.
// Le rôle est vérifié en plus côté SERVEUR sur chaque appel API — ce guard
// n'est qu'un confort UX, jamais une frontière de sécurité à lui seul.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const mustChangePassword = useAuthStore((s) => s.user?.mustChangePassword);
  const { restoreSession } = useAuth();

  // Rechargement de page : la session est restaurée depuis le cookie httpOnly.
  useEffect(() => {
    if (status === "idle") void restoreSession();
  }, [status, restoreSession]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (status === "authenticated" && mustChangePassword && pathname !== "/change-password") {
      router.replace("/change-password");
    }
  }, [status, mustChangePassword, router, pathname]);

  if (status !== "authenticated" || (mustChangePassword && pathname !== "/change-password")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return <>{children}</>;
}
