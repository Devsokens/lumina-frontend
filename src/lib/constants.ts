export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "lumina.ga";

// Rôles RBAC — voir LUMINA_Document_Maitre_v2.md section 12.
export const ROLES = ["OWNER", "MANAGER", "STAFF", "KITCHEN", "CASHIER"] as const;
export type Role = (typeof ROLES)[number];

export const SECTORS = ["RESTAURANT", "EVENT", "SHOP", "ACCOMMODATION"] as const;
export type Sector = (typeof SECTORS)[number];

export const SECTOR_LABELS: Record<Sector, { label: string; icon: string; description: string }> = {
  EVENT: {
    label: "Événementiel",
    icon: "Ticket",
    description: "Billetterie, contrôle d'accès anti-fraude et gestion des participants",
  },
  RESTAURANT: {
    label: "Restauration",
    icon: "UtensilsCrossed",
    description: "Menu QR code, écran cuisine KDS et commandes en direct",
  },
  SHOP: {
    label: "E-Commerce",
    icon: "ShoppingBag",
    description: "Boutique en ligne, gestion de stocks et encaissement Mobile Money",
  },
  ACCOMMODATION: {
    label: "Hébergement & RBNB",
    icon: "Building2",
    description: "Appartements meublés, calendrier intelligent, reçu fiscal et check-in digital",
  },
};

