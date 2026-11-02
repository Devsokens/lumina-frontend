"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, LogOut, Mail, Phone, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useTenantSector } from "@/hooks/useTenantSector";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Propriétaire",
  MANAGER: "Manager",
  STAFF: "Équipe",
  KITCHEN: "Cuisinier",
  CASHIER: "Caisse",
};

// Profil du membre connecté sur l'écran cuisine (le rôle KITCHEN n'a pas
// accès au back-office) : identité, établissement, mot de passe, déconnexion.
export function KitchenProfile() {
  const { user, signOut } = useAuth();
  const { tenant } = useTenantSector();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const initials = (user.fullName ?? user.email ?? user.phone ?? "?").slice(0, 2).toUpperCase();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-border py-1 pr-3 pl-1 hover:bg-muted"
        aria-label="Mon profil"
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-40 truncate text-sm font-medium sm:inline">{user.fullName ?? "Mon profil"}</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col gap-6 p-6">
          <SheetHeader className="p-0">
            <SheetTitle>Mon profil</SheetTitle>
            <SheetDescription>Compte utilisé sur cet écran cuisine.</SheetDescription>
          </SheetHeader>

          <div className="flex items-center gap-3">
            <Avatar className="size-14">
              <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold">{user.fullName ?? "—"}</p>
              <span className="rounded-full bg-secondary/25 px-2 py-0.5 text-sm font-medium">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
          </div>

          <ul className="space-y-3">
            {tenant?.name && (
              <li className="flex items-center gap-3">
                <Store className="size-4 text-muted-foreground" /> {tenant.name}
              </li>
            )}
            {user.email && (
              <li className="flex items-center gap-3 break-all">
                <Mail className="size-4 shrink-0 text-muted-foreground" /> {user.email}
              </li>
            )}
            {user.phone && (
              <li className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground" /> <span className="font-mono">{user.phone}</span>
              </li>
            )}
          </ul>

          <div className="mt-auto space-y-2">
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/change-password">
                <KeyRound className="size-4" /> Changer mon mot de passe
              </Link>
            </Button>
            <Button variant="destructive" className="w-full justify-start gap-2" onClick={() => void signOut()}>
              <LogOut className="size-4" /> Se déconnecter
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
