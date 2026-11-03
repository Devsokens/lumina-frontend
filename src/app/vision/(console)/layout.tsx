"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Building2,
  Coins,
  Globe,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { readVisionSessionRaw, setVisionSession, subscribeVisionSession, visionApi, type VisionSession } from "@/lib/vision";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/vision", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/vision/tenants", label: "Comptes clients", icon: Building2 },
  { href: "/vision/users", label: "Utilisateurs", icon: Users },
  { href: "/vision/traffic", label: "Trafic API", icon: Activity },
  { href: "/vision/costs", label: "Coûts & revenus", icon: Coins },
  { href: "/vision/domains", label: "Domaines", icon: Globe },
  { href: "/vision/logs", label: "Journal & admins", icon: ScrollText },
];

// Garde côté client (confort) : la vraie protection est VisionGuard côté
// API, qui refuse tout appel sans jeton console valide.
export default function VisionConsoleLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // undefined = rendu serveur (session inconnue), null = pas de session.
  const raw = useSyncExternalStore(subscribeVisionSession, readVisionSessionRaw, () => undefined);
  const session = useMemo<VisionSession | null | undefined>(() => (raw === undefined ? undefined : raw ? (JSON.parse(raw) as VisionSession) : null), [raw]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (session === undefined) return;
    if (!session) {
      router.replace("/vision/login");
      return;
    }
    // Déconnexion automatique à l'expiration du jeton.
    const t = setTimeout(() => {
      setVisionSession(null);
    }, new Date(session.expiresAt).getTime() - Date.now());
    return () => clearTimeout(t);
  }, [router, session]);

  async function logout() {
    try {
      await visionApi.post("/auth/logout");
    } catch {
      // jeton déjà expiré : rien à révoquer
    }
    setVisionSession(null);
    router.replace("/vision/login");
  }

  if (!session) return null;

  const nav = (
    <nav className="space-y-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/vision" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
              active ? "bg-primary/12 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2 px-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <ShieldCheck className="size-4" />
        </span>
        <div>
          <p className="font-display text-sm font-bold leading-none">GiyaX Vision</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Plateforme</p>
        </div>
      </div>
      {nav}
      <div className="mt-auto space-y-2 rounded-2xl border border-border p-3">
        <p className="truncate text-sm font-medium">{session.admin.name}</p>
        <p className="truncate text-xs text-muted-foreground">{session.admin.email}</p>
        <Link href="/vision/account" onClick={() => setOpen(false)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <KeyRound className="size-3.5" /> Mon compte
        </Link>
        <button type="button" onClick={logout} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive">
          <LogOut className="size-3.5" /> Se déconnecter
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-border bg-card/50 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-card">{sidebar}</aside>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <button type="button" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setOpen((v) => !v)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <p className="font-display text-sm font-bold">GiyaX Vision</p>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
