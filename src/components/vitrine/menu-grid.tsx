"use client";

import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useProducts } from "@/hooks/useMenu";

export function MenuGrid({ tenantSlug }: { tenantSlug: string }) {
  const { data: categories, isLoading: categoriesLoading } = useCategories(tenantSlug);
  const { data: products, isLoading: productsLoading } = useProducts(tenantSlug);

  if (categoriesLoading || productsLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    );
  }

  if ((categories ?? []).length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Ce menu n&apos;a pas encore d&apos;articles publiés.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {(categories ?? []).map((category) => {
        const items = (products ?? []).filter((p) => p.categoryId === category.id);
        if (items.length === 0) return null;
        return (
          <section key={category.id}>
            <h2 className="font-display mb-4 text-xl font-semibold">{category.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
