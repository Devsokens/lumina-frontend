"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Boxes,
  QrCode,
  Settings,
  Ticket,
  CalendarDays,
  Users,
  ScanLine,
  Building2,
  CalendarCheck,
  ShoppingBag,
  ChefHat,
  Globe,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sector } = useParams<{ sector: string }>();
  const { user, signOut } = useAuth();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const currentSector = (sector ?? "event").toLowerCase();
  const base = `/admin/${currentSector}`;

  async function handleConfirmSignOut() {
    setLogoutModalOpen(false);
    await signOut();
    toast.success("Déconnexion réussie");
    router.push("/login");
  }

  const initials = (user?.fullName ?? user?.email ?? "Admin").slice(0, 2).toUpperCase();

  // Liens dynamiques par secteur
  const getSectorLinks = () => {
    switch (currentSector) {
      case "event":
        return [
          { href: base, label: "Tableau de bord", icon: LayoutDashboard, exact: true },
          { href: `${base}/events`, label: "Mes Événements", icon: CalendarDays },
          { href: `${base}/tickets`, label: "Billetterie & Tarifs", icon: Ticket },
          { href: `${base}/attendees`, label: "Participants", icon: Users },
          { href: `${base}/showcase`, label: "Site Vitrine & Éditeur", icon: Globe },
          { href: `${base}/scanner`, label: "Contrôle d'Accès", icon: ScanLine },
          { href: `${base}/settings`, label: "Paramètres", icon: Settings },
        ];
      case "accommodation":
        return [
          { href: base, label: "Tableau de bord", icon: LayoutDashboard, exact: true },
          { href: `${base}/properties`, label: "Propriétés", icon: Building2 },
          { href: `${base}/calendar`, label: "Calendrier", icon: CalendarCheck },
          { href: `${base}/bookings`, label: "Réservations", icon: ClipboardList },
          { href: `${base}/settings`, label: "Paramètres", icon: Settings },
        ];
      case "shop":
        return [
          { href: base, label: "Tableau de bord", icon: LayoutDashboard, exact: true },
          { href: `${base}/products`, label: "Catalogue", icon: ShoppingBag },
          { href: `${base}/orders`, label: "Commandes", icon: ClipboardList },
          { href: `${base}/stock`, label: "Stock", icon: Boxes },
          { href: `${base}/settings`, label: "Paramètres", icon: Settings },
        ];
      case "restaurant":
      default:
        return [
          { href: base, label: "Tableau de bord", icon: LayoutDashboard, exact: true },
          { href: `${base}/menu`, label: "Menu", icon: UtensilsCrossed },
          { href: `${base}/orders`, label: "Commandes", icon: ClipboardList },
          { href: `${base}/stock`, label: "Stock", icon: Boxes },
          { href: "/kitchen", label: "Écran Cuisine (KDS)", icon: ChefHat },
          { href: `${base}/qr`, label: "QR Code", icon: QrCode },
          { href: `${base}/settings`, label: "Paramètres", icon: Settings },
        ];
    }
  };

  const links = getSectorLinks();

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-[#0d4a37] bg-gradient-to-b from-[#052b20] via-[#04241a] to-[#021811] p-4 text-white sm:flex z-30">
        <div>
          {/* Giya Inverted Logo */}
          <div className="mb-6 px-2 pt-1">
            <Logo inverted />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {links.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all",
                    active
                      ? "bg-white text-[#052b20] font-bold shadow-lg shadow-black/20"
                      : "text-white/85 font-medium hover:bg-white/15 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4.5 shrink-0 transition-colors",
                      active ? "text-[#052b20]" : "text-white"
                    )}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card at Bottom of Sidebar */}
        <div className="rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar className="size-8.5 rounded-xl border border-white/20 bg-emerald-500 text-white font-bold text-xs shrink-0">
                <AvatarFallback className="rounded-xl bg-emerald-500 text-white font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">
                  {user?.fullName ?? "Administrateur"}
                </p>
                <p className="text-[10px] text-emerald-300/80 font-mono truncate">
                  {user?.email ?? `admin@${currentSector}.ga`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              className="flex size-8 shrink-0 items-center justify-center rounded-xl text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
        <DialogContent className="rounded-3xl border-border bg-card p-6 sm:max-w-md shadow-2xl">
          <DialogHeader className="space-y-3 text-center sm:text-left">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mx-auto sm:mx-0">
              <LogOut className="size-6" />
            </div>
            <DialogTitle className="font-display text-xl font-bold">
              Confirmer la déconnexion
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir vous déconnecter de votre espace d&apos;administration Giya ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setLogoutModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl font-semibold shadow-md shadow-destructive/20"
              onClick={handleConfirmSignOut}
            >
              Confirmer la déconnexion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
