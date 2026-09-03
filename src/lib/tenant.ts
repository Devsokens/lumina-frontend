import { API_URL, type Sector } from "@/lib/constants";
import type { Tenant } from "@/types/api";

// Fetch serveur (Server Component) — pas d'auth nécessaire, endpoint public.
// GET /v1/tenants/:slug — voir docs/API_CONTRACT.md.
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  try {
    const res = await fetch(`${API_URL}/tenants/${slug}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(2000),
    });

    if (res.status === 404) return getFallbackTenant(slug);
    if (!res.ok) return getFallbackTenant(slug);

    const json = await res.json();
    return json.data as Tenant;
  } catch {
    // Mode hors-ligne / Prévisualisation sans backend actif : renvoie un tenant démo
    return getFallbackTenant(slug);
  }
}

function getFallbackTenant(slug: string): Tenant {
  let sector: Sector = "SHOP";
  let name = "Giya Démo Showcase";

  if (slug.includes("event") || slug.includes("festival") || slug.includes("concert")) {
    sector = "EVENT";
    name = "Giya Events & Billetterie";
  } else if (slug.includes("resto") || slug.includes("bar") || slug.includes("lounge")) {
    sector = "RESTAURANT";
    name = "Giya Lounge & Restaurant";
  } else if (slug.includes("hotel") || slug.includes("hebergement") || slug.includes("rbnb") || slug.includes("accom")) {
    sector = "ACCOMMODATION";
    name = "Giya Résidences & RBNB";
  }

  return {
    id: `tenant-${slug}`,
    slug,
    name,
    sector,
    plan: "PRO",
    status: "ACTIVE",
    config: {},
    settings: {},
    customDomain: null,
  };
}
