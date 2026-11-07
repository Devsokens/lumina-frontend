"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";

// Contrôle d'accès : barre latérale du back-office à partir de la tablette
// (elle est masquée sous sm, le téléphone garde la caméra plein écran).
// Le rôle Scanner (STAFF) n'a pas de back-office : écran seul, avec
// déconnexion (voir scan/page.tsx).
export function ScanShell({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((s) => s.user?.role);
  if (role === "STAFF") return <>{children}</>;
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
