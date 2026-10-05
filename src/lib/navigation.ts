import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Boxes,
  QrCode,
  Settings,
  CalendarDays,
  Users,
  ScanLine,
  ChefHat,
  Globe,
  Contact,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/constants";

export type NavLink = { href: string; label: string; icon: LucideIcon; exact?: boolean; roles?: Role[] };

const OWNER_MANAGER: Role[] = ["OWNER", "MANAGER"];

// Liens du back-office par secteur, filtrés par rôle. Le backend refuse de
// toute façon les accès non autorisés : ce filtre évite seulement d'afficher
// des écrans vides ou en erreur 403.
export function navLinks(sectorParam: string | undefined, role: Role | undefined): NavLink[] {
  const sector = (sectorParam ?? "restaurant").toLowerCase();
  const base = `/admin/${sector}`;
  let links: NavLink[];

  if (sector === "event") {
    links = [
      { href: base, label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { href: `${base}/events`, label: "Mes Événements", icon: CalendarDays },
      { href: `${base}/reservations`, label: "Réservations", icon: ClipboardList, roles: OWNER_MANAGER },
      { href: `${base}/attendees`, label: "Participants", icon: Users },
      { href: "/scan", label: "Contrôle d'Accès", icon: ScanLine, roles: ["OWNER", "MANAGER", "STAFF"] },
      { href: `${base}/showcase`, label: "Site Vitrine & Éditeur", icon: Globe, roles: OWNER_MANAGER },
      { href: `${base}/customers`, label: "Clients", icon: Contact, roles: OWNER_MANAGER },
      { href: `${base}/users`, label: "Équipe", icon: Users, roles: OWNER_MANAGER },
      { href: `${base}/audit`, label: "Journal d'audit", icon: ScrollText, roles: ["OWNER"] },
      { href: `${base}/settings`, label: "Paramètres", icon: Settings, roles: OWNER_MANAGER },
    ];
  } else if (sector === "accommodation") {
    // Module hébergement pas encore disponible côté serveur.
    links = [
      { href: base, label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { href: `${base}/team`, label: "Équipe", icon: Users, roles: OWNER_MANAGER },
      { href: `${base}/settings`, label: "Paramètres", icon: Settings, roles: OWNER_MANAGER },
    ];
  } else {
    const isShop = sector === "shop";
    links = [
      { href: base, label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { href: `${base}/menu`, label: isShop ? "Catalogue" : "Menu", icon: UtensilsCrossed },
      { href: `${base}/orders`, label: "Commandes", icon: ClipboardList },
      { href: `${base}/stock`, label: "Stock", icon: Boxes, roles: ["OWNER", "MANAGER", "STAFF"] },
      ...(isShop
        ? []
        : [
            { href: "/kitchen", label: "Écran Cuisine (KDS)", icon: ChefHat, roles: ["OWNER", "MANAGER", "STAFF", "KITCHEN"] as Role[] },
            { href: `${base}/qr`, label: "QR Code", icon: QrCode, roles: OWNER_MANAGER },
          ]),
      { href: `${base}/customers`, label: "Clients", icon: Contact, roles: OWNER_MANAGER },
      { href: `${base}/team`, label: "Équipe", icon: Users, roles: OWNER_MANAGER },
      { href: `${base}/audit`, label: "Journal d'audit", icon: ScrollText, roles: ["OWNER"] },
      { href: `${base}/settings`, label: "Paramètres", icon: Settings, roles: OWNER_MANAGER },
    ];
  }

  return links.filter((l) => !l.roles || (role && l.roles.includes(role)));
}
