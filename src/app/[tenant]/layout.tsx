import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { TenantProvider } from "@/hooks/useTenant";
import { VitrineHeader } from "@/components/vitrine/header";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await getTenantBySlug(slug);

  // Message générique — ne pas révéler la distinction "inexistant" vs
  // "suspendu" (énumération de tenant). Voir LUMINA_Audit_Menaces_Complet.md 4.1.
  if (!tenant || tenant.status !== "ACTIVE") notFound();

  return (
    <TenantProvider tenant={tenant}>
      <VitrineHeader />
      {children}
    </TenantProvider>
  );
}
