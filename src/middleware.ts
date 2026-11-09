import { NextResponse, type NextRequest } from "next/server";
import { APP_URL, ROOT_DOMAIN } from "@/lib/constants";
import { isReservedSlug } from "@/lib/tenant-url";

// Espaces de l'application : jamais servis depuis le sous-domaine d'un compte
// (nom.giyax.com/login renvoie vers giyax.com/login).
const APP_PATHS = /^\/(admin|login|signup|auth|change-password|forgot-password|pay\/return|invitation|kitchen|scan|vision|verify|showcase|pricing|confidentialite|conditions|privacy|privacy-policy|terms|cgu)(\/|$)/;

// L'auth ne peut PAS être vérifiée ici : l'access token vit en mémoire
// Zustand côté client, invisible du middleware (edge runtime). Le guard
// d'authentification est fait côté client dans (dashboard)/layout.tsx et
// (kitchen)/layout.tsx via useAuth(). Voir LUMINA_FRONTEND_CONTEXT.md 4.5.
//
// Sites publics : {slug}.{ROOT_DOMAIN}/x est servi par /[tenant]/x (adresse
// visible inchangée). Sur giyax.vercel.app et en local, les sites sont servis
// par chemin (giyax.vercel.app/slug) : aucune réécriture. Voir lib/tenant-url.ts.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}` || !host.endsWith(`.${ROOT_DOMAIN}`)) {
    return NextResponse.next();
  }

  const slug = host.slice(0, -(ROOT_DOMAIN.length + 1));
  // Sous-domaines techniques ou imbriqués (a.b.giyax.com) : pas un site public.
  if (!slug || slug.includes(".") || isReservedSlug(slug)) return NextResponse.next();

  if (APP_PATHS.test(pathname)) {
    return NextResponse.redirect(new URL(`${pathname}${request.nextUrl.search}`, APP_URL));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", slug);
  const url = request.nextUrl.clone();
  // Les liens internes de la vitrine sont déjà préfixés (/slug/menu) : pas de
  // double préfixe.
  const prefixed = pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
  url.pathname = prefixed ? pathname : `/${slug}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  // Fichiers statiques (tout chemin avec une extension : images, vidéos,
  // polices…) exclus : sur un sous-domaine, ils restent servis depuis /public.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
