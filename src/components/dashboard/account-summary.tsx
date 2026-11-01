"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTenantSector } from "@/hooks/useTenantSector";
import { publicSiteLabel } from "@/lib/tenant-url";

const SECTOR_LABELS: Record<string, string> = {
  RESTAURANT: "Restauration",
  EVENT: "Événementiel",
  SHOP: "Commerce",
  ACCOMMODATION: "Hébergement",
};

const PLAN_LABELS: Record<string, { label: string; detail: string }> = {
  FREE: { label: "Gratuit", detail: "Fonctionnalités de base, sans engagement." },
  STANDARD: { label: "Standard", detail: "Pour une activité en croissance." },
  PRO: { label: "Pro", detail: "Fonctionnalités avancées et IA." },
  ENTERPRISE: { label: "Entreprise", detail: "Multi-sites et accompagnement dédié." },
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  DELETED: "Supprimé",
};

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Propriétaire",
  MANAGER: "Manager",
  STAFF: "Équipe",
  KITCHEN: "Cuisine",
  CASHIER: "Caisse",
};

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium break-all">{value || "—"}</span>
    </div>
  );
}

// Informations saisies à l'inscription (compte + activité) et abonnement en
// cours, lus depuis le serveur (/auth/me via le store, /admin/tenant).
export function AccountSummary() {
  const user = useAuthStore((s) => s.user);
  const { tenant, isLoading } = useTenantSector();

  if (isLoading) return <Skeleton className="h-64" />;

  const plan = PLAN_LABELS[tenant?.plan ?? "FREE"];
  const createdAt = tenant?.createdAt;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Mon compte</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Nom complet" value={user?.fullName} />
          <Row label="E-mail" value={user?.email} />
          <Row label="Téléphone" value={user?.phone} />
          <Row label="Rôle" value={user ? ROLE_LABELS[user.role] : undefined} />
          <Row label="Activité" value={tenant?.name} />
          <Row label="Secteur" value={tenant ? SECTOR_LABELS[tenant.sector] : undefined} />
          <Row label="Adresse du site" value={tenant ? publicSiteLabel(tenant.slug) : undefined} />
          <Row
            label="Inscrit le"
            value={createdAt ? new Date(createdAt).toLocaleDateString("fr-FR") : undefined}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Abonnement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Formule actuelle</p>
            <p className="font-display text-2xl font-bold text-primary">{plan.label}</p>
            <p className="text-sm text-muted-foreground">{plan.detail}</p>
          </div>
          <Row label="Statut" value={tenant ? STATUS_LABELS[tenant.status] : undefined} />
          <Row label="Domaine personnalisé" value={tenant?.customDomain} />
          <p className="text-xs text-muted-foreground">
            Pour changer de formule, contactez le support : le paiement de l&apos;abonnement en
            ligne n&apos;est pas encore disponible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
