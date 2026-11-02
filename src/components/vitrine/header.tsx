"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { useCartStore } from "@/stores/useCartStore";
import { siteOf } from "@/lib/site";
import { restaurantInfo } from "@/lib/order-document";

export function VitrineHeader() {
  const tenant = useTenant();
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const site = siteOf(tenant);
  const logo = restaurantInfo(tenant).logoUrl;
  const home = `/${tenant.slug}`;
  const isShop = tenant.sector === "SHOP";
  const links = [
    { href: `${home}/menu`, label: isShop ? "Catalogue" : "La carte" },
    ...(site.sections.about && site.aboutText ? [{ href: `${home}#maison`, label: "La maison" }] : []),
    { href: `${home}#infos`, label: "Infos" },
  ];

  return (
    <>
      {site.announcement && (
        <div className="bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">
          {site.announcement}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Link href={home} className="flex min-w-0 items-center gap-3">
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border" />
            )}
            <span className="font-display truncate text-xl font-semibold tracking-tight">{tenant.name}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation du site">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                  pathname === l.href ? "text-primary" : "text-foreground/80"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={`${home}/menu`}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium md:hidden"
            >
              {isShop ? "Catalogue" : "La carte"}
            </Link>
            <Link
              href={`${home}/cart`}
              aria-label={`Panier${count ? ` (${count})` : ""}`}
              className="relative inline-flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
            >
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-xs font-semibold text-background">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
