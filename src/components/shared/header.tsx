"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

// Sections de la landing (ids posés sur les <section>). Les liens pointent
// vers « /#id » : ils fonctionnent aussi depuis /pricing ou toute autre page.
const NAV_LINKS = [
  { id: "secteurs", label: "Solutions" },
  { id: "clients", label: "Clients" },
  { id: "tarifs", label: "Tarifs" },
  { id: "faq", label: "FAQ" },
] as const;

type SectionId = (typeof NAV_LINKS)[number]["id"];

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

export function Header() {
  const pathname = usePathname();
  const onLanding = pathname === "/";
  const isAuthenticated = useAuthStore((s) => s.status === "authenticated");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<SectionId | null>(null);
  const [hovered, setHovered] = useState<SectionId | null>(null);

  // Barre « îlot » : large et transparente en haut, resserrée et vitrée au défilement.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section visible au centre de l'écran → lien actif.
  useEffect(() => {
    if (!onLanding) return;
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    const onTop = () => {
      const first = sections[0];
      if (first && first.getBoundingClientRect().top > window.innerHeight * 0.5) setActive(null);
    };
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, [onLanding]);

  // Menu mobile : page figée derrière, Échap pour fermer, fermeture en grand écran.
  useEffect(() => {
    if (!menuOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  function goTo(e: React.MouseEvent<HTMLAnchorElement>, id: SectionId) {
    setMenuOpen(false);
    if (!onLanding) return; // navigation normale vers /#id
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActive(id);
  }

  const floating = scrolled || menuOpen;

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
        <div
          className={cn(
            "mx-auto flex h-14 items-center justify-between gap-3 rounded-full border pl-4 pr-2 transition-[max-width,background-color,border-color,box-shadow] duration-500 ease-out lg:h-16 lg:pl-5",
            floating
              ? "max-w-5xl border-border/70 bg-background/75 shadow-[0_12px_40px_-12px_rgba(10,79,60,0.28)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10"
              : "max-w-7xl border-transparent bg-transparent",
          )}
        >
          <Logo />

          {/* Navigation desktop : surlignage qui glisse au survol, point or sur la section en cours */}
          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center" onMouseLeave={() => setHovered(null)}>
              {NAV_LINKS.map((link) => {
                const isActive = active === link.id;
                return (
                  <li key={link.id} className="relative">
                    {hovered === link.id && (
                      <motion.span
                        layoutId="nav-hover"
                        className="absolute inset-0 rounded-full bg-foreground/[0.06] dark:bg-white/10"
                        transition={spring}
                      />
                    )}
                    <a
                      href={`/#${link.id}`}
                      onClick={(e) => goTo(e, link.id)}
                      onMouseEnter={() => setHovered(link.id)}
                      onFocus={() => setHovered(link.id)}
                      aria-current={isActive ? "location" : undefined}
                      className={cn(
                        "relative flex flex-col items-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isActive ? "text-foreground" : "text-foreground/65 hover:text-foreground",
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          transition={spring}
                          className="absolute bottom-0.5 size-1 rounded-full bg-secondary"
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions desktop */}
          <div className="hidden items-center gap-1 lg:flex">
            {isAuthenticated ? (
              <CtaLink href="/admin">Tableau de bord</CtaLink>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Connexion
                </Link>
                <CtaLink href="/signup">Démarrer gratuitement</CtaLink>
              </>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="relative flex size-10 items-center justify-center rounded-full bg-foreground text-background transition-transform active:scale-95 lg:hidden"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={menuOpen ? "x" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {menuOpen ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* Menu mobile : carte flottante sous l'îlot, fond voilé. Hors du <header> :
          un backdrop-filter ferait de la barre le bloc conteneur des éléments fixes. */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              key="panel"
              id="menu-mobile"
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "50% 0%" }}
              className="fixed inset-x-3 top-[76px] z-50 overflow-hidden rounded-3xl border border-border/70 bg-background p-2 shadow-2xl sm:inset-x-4 lg:hidden"
            >
              <nav aria-label="Navigation mobile">
                <ul>
                  {NAV_LINKS.map((link, i) => (
                    <motion.li
                      key={link.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * i + 0.05, duration: 0.2 }}
                    >
                      <a
                        href={`/#${link.id}`}
                        onClick={(e) => goTo(e, link.id)}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-lg font-semibold transition-colors",
                          active === link.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
                        )}
                      >
                        {link.label}
                        <ArrowUpRight className="size-4 text-muted-foreground" />
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/70 p-2 pt-3">
                {isAuthenticated ? (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="col-span-2 flex h-12 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
                  >
                    Tableau de bord
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex h-12 items-center justify-center rounded-2xl border border-border bg-card text-sm font-semibold text-foreground"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="flex h-12 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
                    >
                      Démarrer
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function CtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary pl-5 pr-1.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {children}
      <span className="flex size-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-rotate-45">
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}
