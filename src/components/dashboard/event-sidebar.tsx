"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { sidebarLinks } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTenantSector } from "@/hooks/useTenantSector";
import { initialsOf } from "@/components/events/ev-ui";
import { tenantLogo } from "@/components/events/settings/settings-general";
import { eventFontVariables } from "@/lib/event-fonts";
import { cn } from "@/lib/utils";

// Barre latérale du back-office événementiel (refonte Claude Design 2026-11) :
// vert profond #0B3B2E, élément actif en pilule blanche, carte de
// l'utilisateur en bas (menu : mot de passe, déconnexion).

// Icônes du design (tracés 24 × 24, trait 2), par destination.
const ICONS: { match: RegExp; d: string }[] = [
  { match: /\/events$/, d: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4" },
  { match: /^\/scan$/, d: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" },
  { match: /\/showcase$/, d: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z" },
  { match: /\/users$/, d: "M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-1a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" },
  { match: /\/audit$/, d: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
  { match: /\/settings$/, d: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" },
];
const DASH = "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Propriétaire",
  MANAGER: "Manager",
  STAFF: "Scanner",
  KITCHEN: "Cuisine",
  CASHIER: "Caisse",
};

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      <path d={d} />
    </svg>
  );
}

export function EventSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { tenant } = useTenantSector();
  const { user, signOut } = useAuth();
  const links = sidebarLinks("event", user?.role);
  // Nom et logo du serveur uniquement (Paramètres · Général) : une ancienne
  // copie locale ferait réapparaître un logo retiré.
  const orgName = tenant?.name || "Mon espace";
  const logo = tenantLogo(tenant);
  const userName = user?.fullName || user?.email || "Administrateur";

  async function logout() {
    await signOut();
    toast.success("Vous avez été déconnecté.");
    router.push("/login");
  }

  return (
    <aside
      aria-label="Menu principal"
      className={cn("ev sticky top-0 z-30 hidden h-screen w-[248px] shrink-0 flex-col bg-[#0B3B2E] px-3.5 py-[18px] text-[#DCE8E1] sm:flex", eventFontVariables)}
    >
      <div className="flex items-center gap-2.5 px-2 pb-5 pt-1">
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white text-[13px] font-bold text-[#0B3B2E]">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="size-full object-contain p-0.5" />
          ) : (
            initialsOf(orgName)
          )}
        </span>
        <span className="truncate text-[15px] font-semibold text-white" title={orgName}>
          {orgName}
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 text-sm">
        {links.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const d = exact ? DASH : (ICONS.find((i) => i.match.test(href))?.d ?? DASH);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-[10px] px-3 transition-colors",
                active ? "bg-white font-semibold text-[#0B3B2E]" : "font-medium text-[#DCE8E1] hover:bg-white/[0.08] hover:text-white"
              )}
            >
              <NavIcon d={d} />
              {label}
            </Link>
          );
        })}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="mt-auto flex items-center gap-2.5 rounded-[12px] bg-white/[0.06] p-2.5 text-left transition-colors hover:bg-white/10">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#12A06F] text-xs font-semibold text-white">{initialsOf(userName)}</span>
            <span className="flex min-w-0 flex-col leading-[1.3]">
              <span className="truncate text-[13px] font-semibold text-white">{userName}</span>
              <span className="text-[11px] text-[#9FBDB0]">{ROLE_LABELS[user?.role ?? ""] ?? ""}</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className={cn("ev w-56 rounded-xl", eventFontVariables)}>
          <DropdownMenuItem asChild>
            <Link href="/change-password" className="gap-2">
              <KeyRound className="size-4" /> Changer mon mot de passe
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-ev-danger focus:text-ev-danger" onClick={() => void logout()}>
            <LogOut className="size-4" /> Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}
