// Le backend expose tout sous /v1 : on l'ajoute s'il manque dans la variable
// (erreur de config fréquente → 404 sur /auth/register).
const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1").replace(/\/+$/, "");
export const API_URL = /\/v1$/.test(rawApiUrl) ? rawApiUrl : `${rawApiUrl}/v1`;
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

// Domaine racine des sites publics ({slug}.ROOT_DOMAIN). Sans variable : le
// domaine où le frontend est servi (ex. giyax.vercel.app).
function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "localhost";
  }
}
export const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || hostOf(APP_URL)).replace(/^www\./, "").toLowerCase();

// Sous-domaines des sites publics : "true" / "false" pour forcer, sinon
// automatique (voir lib/tenant-url.ts).
export const TENANT_SUBDOMAINS = process.env.NEXT_PUBLIC_TENANT_SUBDOMAINS ?? "auto";

// Adresses de site interdites : sous-domaines techniques et chemins déjà pris
// par l'application (giyax.vercel.app/login ne peut pas être un site public).
// À garder aligné avec la validation du slug côté backend.
export const RESERVED_SLUGS = [
  "www", "app", "api", "admin", "mail", "webmail", "smtp", "ftp", "mx", "ns1", "ns2",
  "autodiscover", "autoconfig", "cdn", "static", "assets", "status", "staging", "preview",
  "webhook", "webhooks", "blog", "docs", "doc", "login", "signup", "auth", "logout",
  "register", "change-password", "forgot-password", "complete-signup", "select-account",
  "invitation", "pay", "kitchen", "scan", "vision", "verify", "showcase", "pricing", "offline",
  "dashboard", "brand", "icons", "images", "videos", "logos", "zxing", "manifest", "sw",
  "confidentialite", "conditions", "privacy", "privacy-policy", "terms", "cgu", "legal",
  "mentions-legales", "giyax", "giya", "lumina", "support", "aide", "help", "contact",
  "paiement", "paiements", "payment", "payments", "billing", "facture", "factures", "securite",
  "security", "compte", "comptes", "account", "accounts", "airtel", "moov", "pvit", "mypvit",
] as const;

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
    label: "RBNB",
    icon: "Building2",
    description: "Appartements meublés, calendrier intelligent, reçu fiscal et check-in digital",
  },
};

// Secteurs ouverts à l'inscription. Les autres sont affichés grisés
// « Bientôt disponible » (inscription, page d'accueil) : ajouter ici le
// secteur le jour de son ouverture.
export const OPEN_SECTORS: Sector[] = ["EVENT"];
