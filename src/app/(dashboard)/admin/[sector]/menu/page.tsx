"use client";

import { useTenantSector } from "@/hooks/useTenantSector";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductFormDialog } from "@/components/dashboard/product-form-dialog";
import { CategoryManager } from "@/components/dashboard/category-manager";
import { useAdminCategories, useAdminProducts } from "@/hooks/useMenu";
import { useDeleteProduct, useSaveProduct } from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiError } from "@/lib/api";
import { formatXAF } from "@/lib/format";
import type { Product } from "@/types/api";

export default function MenuPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role === "OWNER" || role === "MANAGER";
  const { sector } = useTenantSector();
  const { data: categories, isLoading: categoriesLoading } = useAdminCategories();
  const { data: products, isLoading: productsLoading } = useAdminProducts();
  const save = useSaveProduct();
  const remove = useDeleteProduct();
  const [dialog, setDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });

  async function toggleAvailability(product: Product, isAvailable: boolean) {
    try {
      await save.mutateAsync({
        id: product.id,
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        isAvailable,
      });
    } catch (err) {
      toast.error(apiError(err, "Échec de la mise à jour"));
    }
  }

  async function del(product: Product) {
    if (!window.confirm(`Supprimer « ${product.name} » ?`)) return;
    try {
      await remove.mutateAsync(product.id);
      // Un article déjà commandé est seulement désactivé (historique conservé).
      toast.success("Article supprimé (ou désactivé s'il a déjà été commandé)");
    } catch (err) {
      toast.error(apiError(err, "Suppression impossible"));
    }
  }

  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Menu</h1>
        {canEdit && (
          <Button
            onClick={() => setDialog({ open: true, product: null })}
            disabled={(categories ?? []).length === 0}
            title={(categories ?? []).length === 0 ? "Créez d'abord une catégorie" : undefined}
          >
            <Plus className="size-4" />
            Ajouter un article
          </Button>
        )}
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Catégories</h2>
        {categoriesLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <CategoryManager categories={categories ?? []} canEdit={canEdit} />
        )}
      </section>

      {productsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (products ?? []).length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {sector === "shop"
            ? "Aucun article. Ajoutez votre premier produit pour publier votre catalogue."
            : "Aucun article. Ajoutez votre premier plat pour publier votre menu."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(products ?? []).map((product) => (
            <Card key={product.id} className={product.isAvailable ? "" : "opacity-60"}>
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{categoryName.get(product.categoryId) ?? "—"}</p>
                    <p className="font-mono text-sm">{formatXAF(product.price)}</p>
                    {product.stock !== null && (
                      <p className="text-xs text-muted-foreground">Stock : {product.stock}</p>
                    )}
                  </div>
                  <Switch
                    checked={product.isAvailable}
                    disabled={!canEdit}
                    onCheckedChange={(checked) => void toggleAvailability(product, checked)}
                    aria-label={`Disponibilité de ${product.name}`}
                  />
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setDialog({ open: true, product })}>
                      <Pencil className="size-3.5" />
                      Modifier
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => void del(product)}>
                      <Trash2 className="size-3.5" />
                      Supprimer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductFormDialog
        categories={categories ?? []}
        product={dialog.product}
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
    </div>
  );
}
