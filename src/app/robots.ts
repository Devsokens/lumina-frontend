import type { MetadataRoute } from "next";

// Indexation : le site vitrine de GiyaX seulement. Les espaces privés
// (back-office, console, cuisine, scanner, paiement) ne sont jamais proposés
// aux moteurs de recherche.
const SITE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.giyax.com").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/vision", "/kitchen", "/scan", "/pay", "/auth", "/change-password", "/invitation", "/showcase", "/~offline"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
