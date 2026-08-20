import { NextResponse, type NextRequest } from "next/server";

// Domaine racine de la plateforme (ex: lumina.ga).
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "lumina.ga";
const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api"]);

// L'auth ne peut PAS être vérifiée ici : l'access token vit en mémoire
// Zustand côté client, invisible du middleware (edge runtime). Le guard
// d'authentification est fait côté client dans (dashboard)/layout.tsx et
// (kitchen)/layout.tsx via useAuth(). Voir LUMINA_FRONTEND_CONTEXT.md 4.5.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get("host") ?? "").split(":")[0];

  const isMainDomain =
    host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}` || host === "localhost";

  if (isMainDomain) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);

  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = host.replace(`.${ROOT_DOMAIN}`, "");
    if (slug && !RESERVED_SUBDOMAINS.has(slug)) {
      requestHeaders.set("x-tenant-slug", slug);

      // Réécriture interne du sous-domaine vers /[tenant]/... sans changer l'URL visible.
      const url = request.nextUrl.clone();
      url.pathname = `/${slug}${pathname}`;
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)"],
};
