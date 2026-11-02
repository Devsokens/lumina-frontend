"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToCart } from "@/components/site/add-to-cart";
import { useCategories, useProducts } from "@/hooks/useMenu";
import { useTenant } from "@/hooks/useTenant";
import { formatXAF } from "@/lib/format";
import { siteOf, type SiteMenuLayout } from "@/lib/site";
import type { Product } from "@/types/api";

// Menu public : mise en page choisie dans « Site & apparence » (carte
// imprimée, fiches, mosaïque) et barre de catégories collante.
export function MenuGrid({ tenantSlug }: { tenantSlug: string }) {
  const tenant = useTenant();
  const layout = siteOf(tenant).menuLayout;
  const { data: categories, isLoading: categoriesLoading } = useCategories(tenantSlug);
  const { data: products, isLoading: productsLoading } = useProducts(tenantSlug);
  const sections = (categories ?? [])
    .map((category) => ({ category, items: (products ?? []).filter((p) => p.categoryId === category.id) }))
    .filter((s) => s.items.length > 0);
  const active = useActiveSection(sections.map((s) => s.category.id));

  if (categoriesLoading || productsLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Ce menu n&apos;a pas encore d&apos;articles publiés.
      </p>
    );
  }

  return (
    <div>
      <nav
        aria-label="Catégories"
        className="sticky top-16 z-30 -mx-4 mb-10 border-b border-border bg-background/90 px-4 backdrop-blur-xl"
      >
        <ul className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
          {sections.map(({ category }) => (
            <li key={category.id}>
              <a
                href={`#cat-${category.id}`}
                className={`block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active === category.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/80 hover:text-foreground"
                }`}
              >
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-20">
        {sections.map(({ category, items }) => (
          <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-36">
            <div className="mb-8 text-center">
              <h2 className="font-display text-4xl font-semibold tracking-tight">{category.name}</h2>
              {category.description && <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{category.description}</p>}
              <div className="mx-auto mt-4 h-px w-16 bg-primary" />
            </div>
            <Items layout={layout} items={items} />
          </section>
        ))}
      </div>
    </div>
  );
}

function Items({ layout, items }: { layout: SiteMenuLayout; items: Product[] }) {
  if (layout === "carte") {
    return (
      <ul className="mx-auto grid max-w-4xl gap-x-12 gap-y-7 md:grid-cols-2">
        {items.map((p) => (
          <li key={p.id} className={`flex gap-4 ${p.isAvailable ? "" : "opacity-50"}`}>
            {p.imageUrl && (
              // Image tenant — juste une URL. LUMINA_Audit_Menaces_Complet.md 13.2.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt="" loading="lazy" className="size-20 shrink-0 rounded-2xl object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                <span className="mb-1 flex-1 border-b border-dotted border-foreground/25" aria-hidden />
                <span className="font-mono text-sm font-semibold text-primary">{formatXAF(p.price)}</span>
              </div>
              {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
            </div>
            <AddToCart product={p} className="mt-1 size-9" />
          </li>
        ))}
      </ul>
    );
  }

  if (layout === "mosaique") {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((p) => (
          <article key={p.id} className="group relative aspect-square overflow-hidden rounded-3xl bg-muted">
            {p.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt={p.name} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-white sm:p-4">
              <div className="min-w-0">
                <h3 className="font-display truncate text-lg font-semibold sm:text-xl">{p.name}</h3>
                <p className="font-mono text-sm text-white/85">{formatXAF(p.price)}</p>
              </div>
              <AddToCart product={p} className="size-9" />
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <article key={p.id} className="group overflow-hidden rounded-3xl border border-border bg-card">
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            {p.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt={p.name} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
            )}
          </div>
          <div className="flex items-start justify-between gap-3 p-5">
            <div className="min-w-0">
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              {p.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
              <p className="mt-3 font-mono font-semibold text-primary">{formatXAF(p.price)}</p>
            </div>
            <AddToCart product={p} />
          </div>
        </article>
      ))}
    </div>
  );
}

// Catégorie visible à l'écran : surlignée dans la barre.
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(",");
  useEffect(() => {
    if (!key) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id.replace("cat-", ""));
      },
      { rootMargin: "-140px 0px -60% 0px" }
    );
    for (const id of key.split(",")) {
      const el = document.getElementById(`cat-${id}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);
  return active ?? ids[0] ?? null;
}
