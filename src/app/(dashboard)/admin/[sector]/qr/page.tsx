"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TableQrCard } from "@/components/dashboard/table-qr-card";
import { useAdminTables, useAdminTenantInfo, useDeleteTable, useSaveTable } from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiError } from "@/lib/api";
import type { Table } from "@/types/api";

export default function QrPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role === "OWNER" || role === "MANAGER";
  const { data: tables, isLoading } = useAdminTables();
  // Le slug n'est pas dans le JWT (voir Audit 4.2) — résolu via /admin/tenant.
  const { data: tenant } = useAdminTenantInfo();
  const save = useSaveTable();
  const remove = useDeleteTable();

  const sorted = [...(tables ?? [])].sort((a, b) => a.number - b.number);
  const suggested = sorted.reduce((n, t) => Math.max(n, t.number), 0) + 1;
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("4");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(number || suggested);
    const c = Number(capacity);
    if (!Number.isInteger(n) || n < 1) {
      toast.error("Numéro de table invalide.");
      return;
    }
    try {
      await save.mutateAsync({ number: n, ...(Number.isInteger(c) && c > 0 ? { capacity: c } : {}) });
      toast.success(`Table ${n} ajoutée`);
      setNumber("");
    } catch (err) {
      toast.error(apiError(err, "Création impossible (numéro déjà utilisé ?)"));
    }
  }

  async function del(table: Table) {
    if (!window.confirm(`Supprimer la table ${table.number} ? Son QR code ne fonctionnera plus.`)) return;
    try {
      await remove.mutateAsync(table.id);
      toast.success("Table supprimée");
    } catch (err) {
      toast.error(apiError(err, "Suppression impossible"));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">QR Code par table</h1>
      <p className="text-sm text-muted-foreground">
        Imprimez chaque QR code et placez-le sur la table correspondante. Le client scanne pour accéder
        au menu avec sa table pré-sélectionnée.
      </p>

      {canEdit && (
        <form onSubmit={add} className="flex flex-wrap items-end gap-2">
          <label className="space-y-1 text-sm">
            <span className="block text-muted-foreground">N° de table</span>
            <Input type="number" min={1} className="w-28" placeholder={String(suggested)} value={number} onChange={(e) => setNumber(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="block text-muted-foreground">Places</span>
            <Input type="number" min={1} className="w-24" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </label>
          <Button type="submit" disabled={save.isPending}>
            <Plus className="size-4" />
            Ajouter la table
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucune table. Ajoutez votre première table pour générer un QR code.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((table) => (
            <TableQrCard
              key={table.id}
              tenantSlug={tenant?.slug ?? ""}
              table={table}
              onDelete={canEdit ? () => void del(table) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
