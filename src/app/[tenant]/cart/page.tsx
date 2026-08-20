"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/hooks/useTenant";
import { useCartStore } from "@/stores/useCartStore";
import { formatXAF } from "@/lib/format";

export default function CartPage() {
  const tenant = useTenant();
  const { items, updateQuantity, removeItem, total } = useCartStore();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Votre panier est vide.</p>
        <Button asChild className="mt-4">
          <Link href={`/${tenant.slug}/menu`}>Voir le menu</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display mb-6 text-2xl font-semibold">Mon panier</h1>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="font-mono text-sm text-muted-foreground">{formatXAF(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="size-8"
                onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
              >
                <Minus className="size-3" />
              </Button>
              <span className="w-6 text-center font-mono">{item.quantity}</span>
              <Button
                size="icon"
                variant="outline"
                className="size-8"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              >
                <Plus className="size-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-destructive"
                onClick={() => removeItem(item.productId)}
                aria-label="Retirer"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
        <p className="font-medium">Total</p>
        <p className="font-mono text-lg font-semibold">{formatXAF(total())}</p>
      </div>

      <Button asChild size="lg" className="mt-6 w-full">
        <Link href={`/${tenant.slug}/checkout`}>Commander</Link>
      </Button>
    </main>
  );
}
