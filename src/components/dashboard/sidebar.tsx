"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, ClipboardList, Boxes, QrCode, Settings } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { sector } = useParams<{ sector: string }>();
  const base = `/admin/${sector}`;

  const links = [
    { href: base, label: "Tableau de bord", icon: LayoutDashboard, exact: true },
    { href: `${base}/menu`, label: "Menu", icon: UtensilsCrossed },
    { href: `${base}/orders`, label: "Commandes", icon: ClipboardList },
    { href: `${base}/stock`, label: "Stock", icon: Boxes },
    { href: `${base}/qr`, label: "QR Code", icon: QrCode },
    { href: `${base}/settings`, label: "Paramètres", icon: Settings },
  ];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar p-4 sm:block">
      <div className="mb-8 px-2">
        <Logo />
      </div>
      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
