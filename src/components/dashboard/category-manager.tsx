"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteCategory, useSaveCategory } from "@/hooks/useAdmin";
import { apiError } from "@/lib/api";
import type { Category } from "@/types/api";

// Catégories du menu : création, renommage, ordre, suppression (409 si la
// catégorie contient encore des articles — message serveur affiché).
export function CategoryManager({ categories, canEdit }: { categories: Category[]; canEdit: boolean }) {
  const save = useSaveCategory();
  const remove = useDeleteCategory();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (name.length < 2) return;
    try {
      await save.mutateAsync({ name, sortOrder: categories.length });
      setNewName("");
    } catch (err) {
      toast.error(apiError(err, "Création impossible"));
    }
  }

  async function rename() {
    if (!editing || editing.name.trim().length < 2) return;
    try {
      await save.mutateAsync({ id: editing.id, name: editing.name.trim() });
      setEditing(null);
    } catch (err) {
      toast.error(apiError(err, "Renommage impossible"));
    }
  }

  async function del(c: Category) {
    if (!window.confirm(`Supprimer la catégorie « ${c.name} » ?`)) return;
    try {
      await remove.mutateAsync(c.id);
      toast.success("Catégorie supprimée");
    } catch (err) {
      toast.error(apiError(err, "Suppression impossible"));
    }
  }

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {sorted.map((c) =>
          editing?.id === c.id ? (
            <span key={c.id} className="flex items-center gap-1 rounded-full border border-primary px-2 py-0.5">
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ id: c.id, name: e.target.value })}
                className="h-7 w-36 border-0 px-1 text-sm shadow-none"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && void rename()}
              />
              <button type="button" aria-label="Valider" onClick={() => void rename()}>
                <Check className="size-4 text-success" />
              </button>
              <button type="button" aria-label="Annuler" onClick={() => setEditing(null)}>
                <X className="size-4" />
              </button>
            </span>
          ) : (
            <span key={c.id} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm">
              {c.name}
              {canEdit && (
                <>
                  <button type="button" aria-label={`Renommer ${c.name}`} onClick={() => setEditing({ id: c.id, name: c.name })}>
                    <Pencil className="size-3.5 text-muted-foreground" />
                  </button>
                  <button type="button" aria-label={`Supprimer ${c.name}`} onClick={() => void del(c)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </button>
                </>
              )}
            </span>
          )
        )}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">Créez une première catégorie (ex. Plats, Boissons).</p>
        )}
      </div>
      {canEdit && (
        <form onSubmit={create} className="flex max-w-sm gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nouvelle catégorie"
            maxLength={80}
          />
          <Button type="submit" variant="outline" disabled={save.isPending || newName.trim().length < 2}>
            <Plus className="size-4" />
            Ajouter
          </Button>
        </form>
      )}
    </div>
  );
}
