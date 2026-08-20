import { API_URL } from "@/lib/constants";
import type { Tenant } from "@/types/api";

// Fetch serveur (Server Component) — pas d'auth nécessaire, endpoint public.
// GET /v1/tenants/:slug — voir docs/API_CONTRACT.md.
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const res = await fetch(`${API_URL}/tenants/${slug}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Échec de résolution du tenant "${slug}"`);

  const json = await res.json();
  return json.data as Tenant;
}
