"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/useCartStore";
import type { Product } from "@/types/api";

// Bouton rond « + » commun aux mises en page du menu.
export function AddToCart({ product, className = "" }: { product: Product; className?: string }) {
  const addItem = useCartStore((s) => s.addItem);
  if (!product.isAvailable) {
    return <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Épuisé</span>;
  }
  return (
    <button
      type="button"
      aria-label={`Ajouter ${product.name} au panier`}
      onClick={() => {
        addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1 });
        toast.success(`${product.name} ajouté au panier`);
      }}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      <Plus className="size-5" />
    </button>
  );
}
