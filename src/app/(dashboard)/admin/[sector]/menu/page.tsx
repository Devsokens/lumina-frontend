"use client";

import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductFormDialog } from "@/components/dashboard/product-form-dialog";
import { useAdminCategories, useAdminProducts, useUpdateProduct } from "@/hooks/useMenu";
import { formatXAF } from "@/lib/format";

export default function MenuPage() {
  const { data: categories, isLoading: categoriesLoading } = useAdminCategories();
  const { data: products, isLoading: productsLoading } = useAdminProducts();
  const updateProduct = useUpdateProduct();

  async function toggleAvailability(id: string, isAvailable: boolean) {
    try {
      await updateProduct.mutateAsync({ id, isAvailable });
    } catch {
      toast.error("Échec de la mise à jour");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Menu</h1>
        <ProductFormDialog categories={categories ?? []} />
      </div>

      {categoriesLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {(categories ?? []).map((c) => (
            <Badge key={c.id} variant="outline">
              {c.name}
            </Badge>
          ))}
          {categories?.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune catégorie encore créée.</p>
          )}
        </div>
      )}

      {productsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (products ?? []).length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucun article. Ajoutez votre premier plat pour publier votre menu.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(products ?? []).map((product) => (
            <Card key={product.id}>
              <CardContent className="flex items-start justify-between gap-3 pt-6">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="font-mono text-sm text-muted-foreground">
                    {formatXAF(product.price)}
                  </p>
                </div>
                <Switch
                  checked={product.isAvailable}
                  onCheckedChange={(checked) => toggleAvailability(product.id, checked)}
                  aria-label={`Disponibilité de ${product.name}`}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
