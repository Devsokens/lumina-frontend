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
  Palette,
  BedDouble,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/constants";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  roles?: Role[];
  // Mobile : libellé court de la barre du bas et description de la tuile
  // dans le panneau « Plus ».
  short?: string;
  hint?: string;
  // Mobile : affiché dans la barre du bas (4 au plus, dans l'ordre) ;
  // « accent » = bouton central mis en avant (action principale du métier).
  tab?: boolean;
  accent?: boolean;
};

const OWNER_MANAGER: Role[] = ["OWNER", "MANAGER"];

// Liens du back-office par secteur, filtrés par rôle. Le backend refuse de
// toute façon les accès non autorisés : ce filtre évite seulement d'afficher
// des écrans vides ou en erreur 403.
// Le journal d'audit est ajouté à part (auditLink) : barre latérale sur
// ordinateur (sidebarLinks), menu du profil et « Plus » sur téléphone.
export function navLinks(sectorParam: string | undefined, role: Role | undefined): NavLink[] {
  const sector = (sectorParam ?? "restaurant").toLowerCase();
  const base = `/admin/${sector}`;
  let links: NavLink[];

  if (sector === "event") {
    // Participants (billets, entrées, remboursements) : onglet du détail de
    // chaque événement, plus de modules Participants ni Réservations à part.
    // Ni Clients ni Factures pour l’événementiel (les factures restent
    // proposées aux autres secteurs : admin/[sector]/invoices).
    links = [
      { href: base, label: "Tableau de bord", short: "Accueil", icon: LayoutDashboard, exact: true, tab: true, hint: "Ventes et entrées du jour" },
      { href: `${base}/events`, label: "Mes événements", short: "Événements", icon: CalendarDays, roles: OWNER_MANAGER, tab: true, hint: "Billetterie, participants, remboursements" },
      { href: "/scan", label: "Contrôle d'accès", short: "Scanner", icon: ScanLine, roles: ["OWNER", "MANAGER", "STAFF"], tab: true, accent: true, hint: "Scanner les billets à l'entrée" },
      { href: `${base}/showcase`, label: "Site vitrine", short: "Vitrine", icon: Globe, roles: OWNER_MANAGER, tab: true, hint: "Votre site public et son apparence" },
      { href: `${base}/users`, label: "Équipe", icon: Users, roles: OWNER_MANAGER, hint: "Membres, rôles et accès au scanner" },
      { href: `${base}/settings`, label: "Paramètres", icon: Settings, roles: OWNER_MANAGER, hint: "Organisation, coordonnées, compte" },
    ];
  } else if (sector === "accommodation") {
    links = [
      { href: base, label: "Tableau de bord", short: "Accueil", icon: LayoutDashboard, exact: true, tab: true, hint: "Occupation et revenus" },
      { href: `${base}/listings`, label: "Logements", icon: BedDouble, roles: OWNER_MANAGER, tab: true, hint: "Vos logements, tarifs et photos" },
      { href: `${base}/bookings`, label: "Réservations", icon: CalendarDays, tab: true, accent: true, hint: "Planning, arrivées et départs" },
      { href: `${base}/invoices`, label: "Factures", icon: Receipt, roles: OWNER_MANAGER, hint: "Factures des séjours payés" },
      { href: `${base}/site`, label: "Site & apparence", short: "Site", icon: Palette, roles: OWNER_MANAGER, tab: true, hint: "Votre site public et son apparence" },
      { href: `${base}/customers`, label: "Clients", icon: Contact, roles: OWNER_MANAGER, hint: "Fiches des voyageurs" },
      { href: `${base}/team`, label: "Équipe", icon: Users, roles: OWNER_MANAGER, hint: "Membres et rôles" },
      { href: `${base}/settings`, label: "Paramètres", icon: Settings, roles: OWNER_MANAGER, hint: "Organisation, coordonnées, compte" },
    ];
  } else {
    const isShop = sector === "shop";
    links = [
      { href: base, label: "Tableau de bord", short: "Accueil", icon: LayoutDashboard, exact: true, tab: true, hint: "Ventes du jour et tendances" },
      { href: `${base}/menu`, label: isShop ? "Catalogue" : "Menu", icon: UtensilsCrossed, tab: true, hint: isShop ? "Produits et prix" : "Plats, catégories et prix" },
      { href: `${base}/orders`, label: "Commandes", icon: ClipboardList, tab: true, accent: true, hint: "Commandes en cours et passées" },
      { href: `${base}/invoices`, label: "Factures", icon: Receipt, roles: OWNER_MANAGER, hint: "Factures et additions" },
      { href: `${base}/stock`, label: "Stock", icon: Boxes, roles: ["OWNER", "MANAGER", "STAFF"], tab: isShop, hint: "Quantités et alertes de stock" },
      ...(isShop
        ? []
        : [
            { href: "/kitchen", label: "Écran Cuisine (KDS)", short: "Cuisine", icon: ChefHat, roles: ["OWNER", "MANAGER", "STAFF", "KITCHEN"] as Role[], tab: true, hint: "Commandes à préparer en direct" },
            { href: `${base}/qr`, label: "QR Code", icon: QrCode, roles: OWNER_MANAGER, hint: "QR codes des tables à imprimer" },
          ]),
      { href: `${base}/site`, label: "Site & apparence", short: "Site", icon: Palette, roles: OWNER_MANAGER, hint: "Votre site public et son apparence" },
      { href: `${base}/customers`, label: "Clients", icon: Contact, roles: OWNER_MANAGER, hint: "Fiches clients" },
      { href: `${base}/team`, label: "Équipe", icon: Users, roles: OWNER_MANAGER, hint: "Membres et rôles" },
      { href: `${base}/settings`, label: "Paramètres", icon: Settings, roles: OWNER_MANAGER, hint: "Organisation, coordonnées, compte" },
    ];
  }

  return links.filter((l) => !l.roles || (role && l.roles.includes(role)));
}

// Journal d'audit : réservé au Propriétaire.
export function auditLink(sectorParam: string | undefined, role: Role | undefined): NavLink | null {
  if (role !== "OWNER") return null;
  const sector = (sectorParam ?? "restaurant").toLowerCase();
  return {
    href: `/admin/${sector}/audit`,
    label: "Journal d'audit",
    icon: ScrollText,
    roles: ["OWNER"],
    hint: "Qui a fait quoi, et quand, dans votre espace",
  };
}

// Barre latérale (ordinateur) : la navigation et le journal d’audit, juste
// avant Paramètres.
export function sidebarLinks(sectorParam: string | undefined, role: Role | undefined): NavLink[] {
  const links = navLinks(sectorParam, role);
  const audit = auditLink(sectorParam, role);
  if (!audit) return links;
  const settings = links.findIndex((l) => l.href.endsWith("/settings"));
  return settings < 0 ? [...links, audit] : [...links.slice(0, settings), audit, ...links.slice(settings)];
}

// Barre du bas (mobile) : 4 modules au plus, le reste dans « Plus ».
export function mobileTabs(links: NavLink[]): { tabs: NavLink[]; more: NavLink[] } {
  const tabs = links.filter((l) => l.tab).slice(0, 4);
  return { tabs, more: links.filter((l) => !tabs.includes(l)) };
}
