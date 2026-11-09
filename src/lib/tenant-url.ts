import { APP_URL, RESERVED_SLUGS, ROOT_DOMAIN, TENANT_SUBDOMAINS } from "@/lib/constants";

// Adresse publique d'un compte, dans un seul endroit pour tout le frontend
// (inscription, back-office, QR codes, liens de partage).
//
// - Sous-domaine : https://{slug}.{ROOT_DOMAIN} (ex. nom.giyax.com). Exige un
//   domaine acheté avec un enregistrement DNS générique (*.giyax.com) pointant
//   vers Vercel et le domaine générique ajouté au projet Vercel.
// - Chemin : {APP_URL}/{slug} (ex. giyax.vercel.app/nom). Seul mode possible sur
//   *.vercel.app : Vercel ne sert pas les sous-domaines de vercel.app.
//
// NEXT_PUBLIC_TENANT_SUBDOMAINS=true|false force le mode ; en automatique, le
// sous-domaine est utilisé dès que le frontend est servi sur ROOT_DOMAIN.

const PATH_ONLY_DOMAIN = /(^|\.)vercel\.app$|^localhost$|^127\.0\.0\.1$|^\d+\.\d+\.\d+\.\d+$/;

export function subdomainActive(): boolean {
  if (PATH_ONLY_DOMAIN.test(ROOT_DOMAIN)) return false;
  if (TENANT_SUBDOMAINS === "false" || TENANT_SUBDOMAINS === "0") return false;
  if (TENANT_SUBDOMAINS === "true" || TENANT_SUBDOMAINS === "1") return true;
  try {
    const host = new URL(APP_URL).hostname.replace(/^www\./, "");
    return host === ROOT_DOMAIN;
  } catch {
    return false;
  }
}

function withPath(path: string): string {
  if (!path) return "";
  return path.startsWith("/") || path.startsWith("?") ? path : `/${path}`;
}

// publicSiteUrl("nom") → https://nom.giyax.com ou https://giyax.vercel.app/nom
// publicSiteUrl("nom", "/events/42") → …/events/42
export function publicSiteUrl(slug: string, path = ""): string {
  return subdomainActive()
    ? `https://${slug}.${ROOT_DOMAIN}${withPath(path)}`
    : `${APP_URL}/${slug}${withPath(path)}`;
}

// Affichage sans protocole (ex. « nom.giyax.com » ou « giyax.vercel.app/nom »).
export function publicSiteLabel(slug: string): string {
  return publicSiteUrl(slug).replace(/^https?:\/\//, "");
}

// Argument commercial de l'adresse offerte, suivant le domaine branché :
// « Sous-domaine offert (nom.giyax.com) » ou « Lien personnalisé offert
// (giyax.vercel.app/nom) ».
export function siteAddressOffer(): string {
  return `${subdomainActive() ? "Sous-domaine offert" : "Lien personnalisé offert"} (${publicSiteLabel("nom")})`;
}

// Adresse relative renvoyée par l'API (/nom/orders/…) : sans le préfixe sur
// nom.giyax.com, inchangée si elle pointe ailleurs (page de paiement PVit).
export function localSiteUrl(base: string, slug: string, url: string): string {
  return url.startsWith(`/${slug}/`) ? `${base}${url.slice(slug.length + 1)}` : url;
}

const RESERVED = new Set<string>(RESERVED_SLUGS);

export function isReservedSlug(slug: string): boolean {
  return RESERVED.has(slug.toLowerCase());
}
