"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminTenantInfo, useUpdateTenant } from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiError } from "@/lib/api";
import { APP_URL } from "@/lib/constants";

type SettingsForm = {
  name: string;
  description: string;
  phone: string;
  address: string;
  taxPercent: string; // saisi en %, envoyé en points de base
  taxIncluded: boolean;
};

// Informations publiques et taxe du tenant (docs/API_CONTRACT.md §2).
// Modification réservée à l'OWNER.
export function TenantSettingsForm() {
  const isOwner = useAuthStore((s) => s.user?.role === "OWNER");
  const { data: tenant, isLoading } = useAdminTenantInfo();
  const update = useUpdateTenant();
  const { register, handleSubmit, reset } = useForm<SettingsForm>();

  useEffect(() => {
    if (!tenant) return;
    const config = (tenant.config ?? {}) as Record<string, unknown>;
    const settings = (tenant.settings ?? {}) as Record<string, unknown>;
    reset({
      name: tenant.name,
      description: typeof config.description === "string" ? config.description : "",
      phone: typeof config.phone === "string" ? config.phone : "",
      address: typeof config.address === "string" ? config.address : "",
      taxPercent: typeof settings.taxRate === "number" ? String(settings.taxRate / 100) : "0",
      taxIncluded: settings.taxIncluded !== false,
    });
  }, [tenant, reset]);

  async function onSubmit(values: SettingsForm) {
    const percent = Number(values.taxPercent.replace(",", "."));
    if (!Number.isFinite(percent) || percent < 0 || percent > 50) {
      toast.error("Taux de taxe entre 0 et 50 %.");
      return;
    }
    try {
      await update.mutateAsync({
        name: values.name.trim(),
        description: values.description,
        phone: values.phone,
        address: values.address,
        taxRate: Math.round(percent * 100),
        taxIncluded: values.taxIncluded,
      });
      toast.success("Paramètres enregistrés");
    } catch (err) {
      toast.error(apiError(err, "Échec de l'enregistrement"));
    }
  }

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Informations de l&apos;activité</CardTitle>
        {tenant && (
          <p className="text-sm text-muted-foreground">
            Vitrine :{" "}
            <a className="text-primary underline" href={`${APP_URL}/${tenant.slug}`} target="_blank" rel="noreferrer">
              {APP_URL.replace(/^https?:\/\//, "")}/{tenant.slug}
            </a>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <fieldset disabled={!isOwner || update.isPending} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" maxLength={120} {...register("name")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" maxLength={1000} {...register("description")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" maxLength={30} {...register("phone")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" maxLength={300} {...register("address")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="taxPercent">Taxe (TVA) en %</Label>
                <Input id="taxPercent" inputMode="decimal" {...register("taxPercent")} />
              </div>
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input type="checkbox" {...register("taxIncluded")} />
                Prix affichés taxes comprises (TTC)
              </label>
            </div>
            {isOwner ? (
              <Button type="submit">{update.isPending ? "Enregistrement..." : "Enregistrer"}</Button>
            ) : (
              <p className="text-xs text-muted-foreground">Seul le propriétaire peut modifier ces informations.</p>
            )}
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}
