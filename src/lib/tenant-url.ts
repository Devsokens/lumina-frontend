import { APP_URL, ROOT_DOMAIN } from "@/lib/constants";

// Adresse publique d'un compte : {slug}.{domaine de la plateforme} dès que le
// frontend est servi sur ce domaine (sous-domaines générique DNS + Vercel),
// sinon {APP_URL}/{slug} qui fonctionne partout (ex. *.vercel.app).
export function subdomainActive(): boolean {
  try {
    const host = new URL(APP_URL).hostname;
    return host === ROOT_DOMAIN || host.endsWith(`.${ROOT_DOMAIN}`);
  } catch {
    return false;
  }
}

export function publicSiteUrl(slug: string): string {
  return subdomainActive() ? `https://${slug}.${ROOT_DOMAIN}` : `${APP_URL.replace(/\/+$/, "")}/${slug}`;
}

// Affichage sans protocole (ex. « monresto.giya.ga » ou « giyax.vercel.app/monresto »).
export function publicSiteLabel(slug: string): string {
  return publicSiteUrl(slug).replace(/^https?:\/\//, "");
}
