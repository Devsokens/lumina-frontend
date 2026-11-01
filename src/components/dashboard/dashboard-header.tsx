"use client";

import { useState } from "react";
import {
  Bell,
  LogOut,
  Search,
  User,
  Settings,
  Shield,
  Ticket,
  UtensilsCrossed,
  Building2,
  ShoppingBag,
  CheckCircle2,
  ChevronDown,
  Menu,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useParams, usePathname } from "next/navigation";
import { navLinks } from "@/lib/navigation";
import { useTenantSector } from "@/hooks/useTenantSector";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Role } from "@/lib/constants";

const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Propriétaire",
  MANAGER: "Manager",
  STAFF: "Équipe",
  KITCHEN: "Cuisine",
  CASHIER: "Caisse",
};
import Link from "next/link";
import { toast } from "sonner";

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { sector: urlSector } = useParams<{ sector?: string }>();
  const { sector: tenantSector } = useTenantSector();
  const sector = tenantSector ?? urlSector;
  const currentSector = (sector ?? "event").toLowerCase();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  async function handleConfirmSignOut() {
    setLogoutModalOpen(false);
    await signOut();
    toast.success("Vous avez été déconnecté avec succès");
    router.push("/login");
  }

  const initials = (user?.fullName ?? user?.email ?? "Admin").slice(0, 2).toUpperCase();

  // Recherche rapide parmi les écrans accessibles à ce rôle.
  const links = navLinks(sector ?? "event", user?.role);
  const suggestions = links
    .filter((l) => l.label.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((l) => ({ title: l.label, type: "Écran", href: l.href }));

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur-md sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 size-9 sm:hidden"
          aria-label="Ouvrir le menu"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="size-5" />
        </Button>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Aller à un écran (menu, commandes, équipe…)"
              className="h-10 w-full rounded-xl pl-9 pr-12 text-xs sm:text-sm bg-muted/40 border-border/80 focus:bg-background transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (searchQuery.length > 0) setShowSearchDropdown(true);
              }}
              onBlur={() => {
                // small timeout to allow click on suggestion
                setTimeout(() => setShowSearchDropdown(false), 200);
              }}
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          {/* Quick Search Floating Results */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-12 z-50 rounded-2xl border border-border bg-card p-2 shadow-2xl backdrop-blur-xl">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Résultats rapides
              </div>
              {suggestions.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  Aucun résultat pour &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="space-y-1">
                  {suggestions.map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs hover:bg-muted transition-colors"
                      onClick={() => setShowSearchDropdown(false)}
                    >
                      <span className="font-semibold text-foreground">{item.title}</span>
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {item.type}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Icons & Profile Dropdown */}
        <div className="flex items-center gap-3">
          {/* Notifications button */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
            onClick={() => toast.info("Aucune notification.")}
          >
            <Bell className="size-4.5" />
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card p-1.5 pr-3 text-left transition-all hover:border-primary/40 hover:bg-muted/40"
              >
                <Avatar className="size-7 rounded-lg bg-primary/15 text-primary border border-primary/30">
                  <AvatarFallback className="rounded-lg font-bold text-xs bg-primary text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-foreground leading-none">
                    {user?.fullName ?? "Administrateur"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono capitalize">
                    {currentSector}
                  </p>
                </div>
                <ChevronDown className="size-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-xl border-border bg-card">
              <DropdownMenuLabel className="p-2">
                <p className="font-bold text-sm text-foreground">{user?.fullName ?? "Administrateur"}</p>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {user?.email ?? user?.phone ?? ""}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {ROLE_LABELS[user?.role ?? "STAFF"]}
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href={`/admin/${currentSector}/settings`} className="flex items-center gap-2 rounded-xl text-xs font-medium cursor-pointer">
                  <Settings className="size-4 text-muted-foreground" />
                  <span>Paramètres</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/change-password" className="flex items-center gap-2 rounded-xl text-xs font-medium cursor-pointer">
                  <Shield className="size-4 text-muted-foreground" />
                  <span>Changer mon mot de passe</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout item triggering confirmation modal */}
              <DropdownMenuItem
                onClick={() => setLogoutModalOpen(true)}
                className="flex items-center gap-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              >
                <LogOut className="size-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 p-4">
          <SheetHeader className="p-0">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="mt-4 space-y-1">
            {links.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                    active ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Confirmation Logout Modal */}
      <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
        <DialogContent className="rounded-3xl border-border bg-card p-6 sm:max-w-md shadow-2xl">
          <DialogHeader className="space-y-3 text-center sm:text-left">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mx-auto sm:mx-0">
              <LogOut className="size-6" />
            </div>
            <DialogTitle className="font-display text-xl font-bold">
              Confirmer la déconnexion
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir vous déconnecter de votre espace d&apos;administration Giya ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setLogoutModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl font-semibold shadow-md shadow-destructive/20"
              onClick={handleConfirmSignOut}
            >
              Confirmer la déconnexion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
