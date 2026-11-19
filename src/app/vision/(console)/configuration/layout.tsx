"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Mail, Percent, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Module « Configuration » de la console : tous les réglages de la
// plateforme au même endroit, une rubrique par sujet (barre latérale sur
// ordinateur, onglets défilants sur téléphone). Chaque rubrique reprend
// l'écran existant.
const SECTIONS: { href: string; label: string; hint: string; icon: LucideIcon }[] = [
  { href: "/vision/configuration/frais", label: "Frais et reversements", hint: "Frais, délais, cotisations, sécurité", icon: Percent },
  { href: "/vision/configuration/emails", label: "E-mails d'envoi", hint: "Adresse Gmail de GiyaX", icon: Mail },
  { href: "/vision/configuration/domaines", label: "Domaines", hint: "Adresses des sites clients", icon: Globe },
];

export default function ConfigurationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <nav aria-label="Rubriques de configuration" className="-mx-1 flex shrink-0 gap-1.5 overflow-x-auto px-1 pb-1 lg:sticky lg:top-6 lg:mx-0 lg:w-64 lg:flex-col lg:overflow-visible lg:px-0">
        <p className="mb-1 hidden px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:block">Configuration</p>
        {SECTIONS.map(({ href, label, hint, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active ? "bg-primary/12 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex flex-col">
                <span className="whitespace-nowrap">{label}</span>
                <span className="hidden text-xs font-normal text-muted-foreground lg:block">{hint}</span>
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
