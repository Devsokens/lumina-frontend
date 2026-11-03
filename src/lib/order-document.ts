import type { Tenant } from "@/types/api";

// Coordonnées publiques de l'établissement (site, en-têtes). Les factures et
// additions sont générées par l'API (components/vitrine/order-document-button).

export type BusinessInfo = {
  name: string;
  slug: string;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
};

function text(config: Record<string, unknown>, key: string) {
  const v = config[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export function restaurantInfo(tenant: Tenant): BusinessInfo {
  const config = tenant.config ?? {};
  const logo = text(config, "logoUrl");
  return {
    name: tenant.name,
    slug: tenant.slug,
    phone: text(config, "phone"),
    address: text(config, "address"),
    // Logo importé (data URL) ou https : un logo https d'un autre domaine est
    // bloqué par la CSP (connect-src), le PDF sort alors sans logo.
    logoUrl: logo && /^(https:\/\/|data:image\/(png|jpeg|webp);base64,)/.test(logo) ? logo : null,
  };
}
