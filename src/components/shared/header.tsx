"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "#secteurs", label: "Secteurs" },
  { href: "#demo", label: "Démo Interactive" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = status === "authenticated";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 rounded-full border border-border/60 bg-card/60 px-6 py-2 shadow-xs backdrop-blur-md md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary dark:hover:text-emerald-400"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Button asChild className="rounded-full bg-primary font-medium text-white shadow-md shadow-primary/20 hover:bg-primary/90">
              <Link href="/admin">
                Tableau de bord
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-full text-sm font-medium">
                <Link href="/login">Connexion</Link>
              </Button>
              <Button
                asChild
                className="group relative overflow-hidden rounded-full bg-primary px-5 py-2.5 font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/95 hover:shadow-primary/40"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  <span>Démarrer Gratuit</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex size-10 items-center justify-center rounded-xl border border-border bg-card p-2 text-foreground md:hidden"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border bg-background/95 px-6 py-6 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-foreground/80 hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-border">
                {isAuthenticated ? (
                  <Button asChild className="w-full rounded-xl bg-primary text-white">
                    <Link href="/admin">Accéder au Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full rounded-xl">
                      <Link href="/login">Connexion</Link>
                    </Button>
                    <Button asChild className="w-full rounded-xl bg-primary text-white">
                      <Link href="/signup">Créer un compte gratuit (0 FCFA)</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

