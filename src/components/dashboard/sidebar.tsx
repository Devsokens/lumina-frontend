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

import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";

export function Sidebar() {
  const pathname = usePathname();
  const { sector } = useParams<{ sector: string }>();
  const { user } = useAuth();
  const { settings: orgSettings, activePreset } = useOrganizationSettings();

  const currentSector = (sector ?? "event").toLowerCase();
  const base = `/admin/${currentSector}`;

  const initials = (user?.fullName ?? user?.email ?? "Admin").slice(0, 2).toUpperCase();

  // Liens dynamiques par secteur
  const getSectorLinks = () => {
    switch (currentSector) {
      case "event":
        return [
          { href: base, label: "Tableau de bord", icon: LayoutDashboard, exact: true },
          { href: `${base}/events`, label: "Mes Événements", icon: CalendarDays },
          { href: `${base}/reservations`, label: "Réservations", icon: ClipboardList },
          { href: `${base}/showcase`, label: "Site Vitrine & Éditeur", icon: Globe },
          { href: `${base}/scanner`, label: "Contrôle d'Accès", icon: ScanLine },
          { href: `${base}/users`, label: "Utilisateurs & Équipe", icon: Users },
          { href: `${base}/settings`, label: "Paramètres", icon: Settings },
        ];
      case "accommodation":
        return [
          { href: base, label: "Tableau de bord", icon: LayoutDashboard, exact: true },
          { href: `${base}/properties`, label: "Propriétés", icon: Building2 },
          { href: `${base}/bookings`, label: "Réservations", icon: CalendarCheck },
          { href: `${base}/showcase`, label: "Site Vitrine", icon: Globe },
          { href: `${base}/settings`, label: "Paramètres", icon: Settings },
        ];
      case "boutique":
        return [
          { href: base, label: "Tableau de bord", icon: LayoutDashboard, exact: true },
          { href: `${base}/products`, label: "Catalogue", icon: ShoppingBag },
          { href: `${base}/orders`, label: "Commandes", icon: ClipboardList },
          { href: `${base}/settings`, label: "Paramètres", icon: Settings },
        ];
      case "resto":
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
      <aside
        style={{
          background: `linear-gradient(to bottom, ${activePreset.sidebarFrom}, ${activePreset.sidebarVia}, ${activePreset.sidebarTo})`,
          borderColor: activePreset.sidebarBorder,
        }}
        className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r p-4 text-white sm:flex z-30 transition-colors duration-500"
      >
        <div>
          {/* Top: Organization / Structure Name & Logo */}
          <div className="mb-6 px-1 pt-1 flex items-center gap-3">
            {orgSettings.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={orgSettings.logo}
                alt={orgSettings.name}
                className="size-9 rounded-xl object-contain bg-white/10 p-0.5 border border-white/20 shadow-sm shrink-0"
              />
            ) : (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white font-extrabold text-sm border border-white/20 shadow-sm">
                {orgSettings.name?.charAt(0) || "O"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-sm font-extrabold text-white tracking-tight leading-snug truncate" title={orgSettings.name}>
                {orgSettings.name || "SOKENS DIGITAL EVENT"}
              </h2>
            </div>
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
                      ? "bg-white text-zinc-900 font-bold shadow-lg shadow-black/20"
                      : "text-white/85 font-medium hover:bg-white/15 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4.5 shrink-0 transition-colors",
                      active ? "text-zinc-900" : "text-white"
                    )}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom of Sidebar: User Profile & Giya Brand at bottom */}
        <div className="space-y-3 pt-2">
          {/* User Profile Card */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-2.5 backdrop-blur-md">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar className="size-8 rounded-xl border border-white/20 bg-emerald-500 text-white font-bold text-xs shrink-0">
                <AvatarFallback className="rounded-xl bg-emerald-500 text-white font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.fullName ?? "Administrateur"}
                </p>
                <p className="text-[10px] text-white/70 font-mono truncate">
                  {user?.email ?? `admin@${currentSector}.ga`}
                </p>
              </div>
            </div>
          </div>

          {/* Giya Brand at the very bottom */}
          <div className="px-1 pt-1 border-t border-white/10 flex items-center justify-between">
            <Logo inverted />
            <span className="text-[9px] font-mono text-white/50 tracking-wider">PRO</span>
          </div>
        </div>
      </aside>
    </>
  );
}
