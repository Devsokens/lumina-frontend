"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/hooks/useTenant";
import { useCartStore } from "@/stores/useCartStore";

export function VitrineHeader() {
  const tenant = useTenant();
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
      <Link href={`/${tenant.slug}`} className="font-display text-lg font-semibold">
        {tenant.name}
      </Link>
      <Button asChild variant="outline" size="icon" className="relative">
        <Link href={`/${tenant.slug}/cart`} aria-label="Panier">
          <ShoppingCart className="size-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {count}
            </span>
          )}
        </Link>
      </Button>
    </header>
  );
}
