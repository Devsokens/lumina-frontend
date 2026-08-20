"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatXAF } from "@/lib/format";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";
import type { Product } from "@/types/api";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1 });
    toast.success(`${product.name} ajouté au panier`);
  }

  return (
    <Card className="overflow-hidden">
      {product.imageUrl && (
        // Image tenant — pas de contenu HTML libre, juste une URL. Voir
        // LUMINA_Audit_Menaces_Complet.md 13.2.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt={product.name} className="h-40 w-full object-cover" />
      )}
      <CardContent className="pt-4">
        <p className="font-medium">{product.name}</p>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        )}
        <p className="mt-2 font-mono font-semibold">{formatXAF(product.price)}</p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!product.isAvailable}
          onClick={handleAdd}
        >
          <Plus className="size-4" />
          {product.isAvailable ? "Ajouter" : "Indisponible"}
        </Button>
      </CardFooter>
    </Card>
  );
}
