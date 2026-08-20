"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableQrCard } from "@/components/dashboard/table-qr-card";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { Plus } from "lucide-react";
import type { Table, Tenant } from "@/types/api";

export default function QrPage() {
  const { data: tables, isLoading } = useApiQuery<Table[]>(["admin-tables"], "/admin/tables");
  // Le slug n'est pas dans le JWT (voir Audit 4.2) — résolu via /admin/tenant.
  const { data: tenant } = useApiQuery<Tenant>(["admin-tenant"], "/admin/tenant");
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const createTable = useApiMutation<{ number: number }, Table>("post", "/admin/tables", {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-tables"] }),
  });

  async function handleAddTable() {
    setCreating(true);
    try {
      const nextNumber = (tables?.length ?? 0) + 1;
      await createTable.mutateAsync({ number: nextNumber });
      toast.success("Table ajoutée");
    } catch {
      toast.error("Échec de la création");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">QR Code par table</h1>
        <Button onClick={handleAddTable} disabled={creating}>
          <Plus className="size-4" />
          Nouvelle table
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Imprimez chaque QR code et placez-le sur la table correspondante. Le client scanne pour
        accéder directement au menu avec sa table pré-sélectionnée.
      </p>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (tables ?? []).length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucune table. Ajoutez votre première table pour générer un QR code.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(tables ?? []).map((table) => (
            <TableQrCard key={table.id} tenantSlug={tenant?.slug ?? ""} table={table} />
          ))}
        </div>
      )}
    </div>
  );
}
