"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import type { Tenant } from "@/types/api";

type SettingsForm = {
  name: string;
  description: string;
  phone: string;
  address: string;
};

export default function SettingsPage() {
  const { data: tenant, isLoading } = useApiQuery<Tenant>(["admin-tenant"], "/admin/tenant");
  const updateTenant = useApiMutation<Partial<SettingsForm>, Tenant>("patch", "/admin/tenant");
  const { register, handleSubmit, reset } = useForm<SettingsForm>();

  useEffect(() => {
    if (!tenant) return;
    const config = tenant.config as Partial<SettingsForm>;
    reset({
      name: tenant.name,
      description: (config.description as string) ?? "",
      phone: (config.phone as string) ?? "",
      address: (config.address as string) ?? "",
    });
  }, [tenant, reset]);

  async function onSubmit(values: SettingsForm) {
    try {
      await updateTenant.mutateAsync(values);
      toast.success("Paramètres enregistrés");
    } catch {
      toast.error("Échec de l'enregistrement");
    }
  }

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Paramètres</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Informations de l&apos;activité</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" {...register("name")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" {...register("address")} />
              </div>
            </div>
            <Button type="submit" disabled={updateTenant.isPending}>
              {updateTenant.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
