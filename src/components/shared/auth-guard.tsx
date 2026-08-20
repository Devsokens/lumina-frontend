"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton";

// Guard côté client : l'access token vit en mémoire (jamais accessible au
// middleware edge). Voir LUMINA_FRONTEND_CONTEXT.md 4.5 et middleware.ts.
// Le rôle est vérifié en plus côté SERVEUR sur chaque appel API — ce guard
// n'est qu'un confort UX, jamais une frontière de sécurité à lui seul.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return <>{children}</>;
}
