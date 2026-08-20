"use client";

import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const initials = (user?.fullName ?? user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
      <div />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-5" />
        </Button>
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" aria-label="Déconnexion" onClick={handleSignOut}>
          <LogOut className="size-5" />
        </Button>
      </div>
    </header>
  );
}
