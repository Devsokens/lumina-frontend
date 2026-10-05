import { API_URL } from "@/lib/constants";
import type { Tenant } from "@/types/api";

// Fetch serveur (Server Component), endpoint public GET /v1/tenants/:slug.
// Mis en cache 60 s par Next (une requête backend par minute et par tenant,
// quel que soit le trafic de la vitrine).
// 404 (inexistant ou suspendu) → null → page 404. Le backend ne distingue
// pas les deux cas (anti-énumération) ; on n'invente jamais de tenant.
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  if (!/^[a-z0-9-]{1,63}$/.test(slug)) return null;

  const res = await fetch(`${API_URL}/tenants/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(5000),
  });

  if (res.status === 404) return null;
  // Panne backend : page d'erreur Next (et non une fausse vitrine).
  if (!res.ok) throw new Error(`Tenant indisponible (${res.status}).`);

  const json = (await res.json()) as { data?: Tenant };
  return json.data ?? null;
}
