"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Durée d'affichage de chaque secteur avant de passer au suivant (s).
const DURATION = 7;

interface Sector {
  id: string;
  label: string;
  short: string;
  image: string;
  imageAlt: string;
  /** Cadrage de la photo dans le panneau (object-position). */
  imagePosition?: string;
  proof: string;
  title: string;
  description: string;
  benefits: string[];
  cta: string;
  href: string;
}

// Photographies réelles (Unsplash, licence libre) — public/images/landing.
const SECTORS: Sector[] = [
  {
    id: "event",
    label: "Événementiel",
    short: "Billetterie en ligne et contrôle d'entrée",
    image: "/images/landing/secteur-evenements-chanteur.jpg",
    imageAlt: "Un chanteur en pleine performance sur scène",
    imagePosition: "50% 28%",
    proof: "Billet valide · Pass VIP",
    title: "Contrôlez vos entrées à la seconde",
    description:
      "Vendez vos billets en ligne, encaissez en Mobile Money et vérifiez chaque QR code à l'entrée en moins d'une seconde, même hors connexion.",
    benefits: [
      "Un QR code unique et infalsifiable par billet",
      "Scanner sur téléphone et compteur d'entrées en direct",
      "Votre propre page de vente, prête à partager",
    ],
    cta: "Créer un événement",
    href: "/signup?sector=EVENT",
  },
  {
    id: "restaurant",
    label: "Restauration",
    short: "Menu QR, commandes à table et écran cuisine",
    image: "/images/landing/secteur-restauration.jpg",
    imageAlt: "Clients attablés dans un restaurant chaleureux",
    proof: "CMD-0427 · En préparation",
    title: "Des commandes à table, sans attente",
    description:
      "Vos clients scannent le QR de leur table, commandent et paient depuis leur téléphone. Chaque commande arrive aussitôt sur l'écran de la cuisine.",
    benefits: [
      "Menu QR toujours à jour, photos et prix compris",
      "Écran cuisine (KDS) synchronisé en temps réel",
      "Addition et facture PDF en un instant",
    ],
    cta: "Digitaliser mon restaurant",
    href: "/signup?sector=RESTAURANT",
  },
  {
    id: "rbnb",
    label: "RBNB",
    short: "Logements meublés, calendrier et réservations",
    image: "/images/landing/secteur-rbnb.jpg",
    imageAlt: "Salon d'un appartement meublé lumineux",
    proof: "Séjour réservé · 3 nuits",
    title: "Louez vos meublés sans carnet ni no-show",
    description:
      "Un calendrier de disponibilités en direct, la réservation et le paiement en ligne, et une confirmation envoyée automatiquement au voyageur.",
    benefits: [
      "Calendrier et planning de tous vos logements",
      "Paiement en ligne au moment de la réservation",
      "Reçus et factures générés automatiquement",
    ],
    cta: "Gérer mes logements",
    href: "/signup?sector=ACCOMMODATION",
  },
];

// Seul secteur ouvert à l'inscription pour le moment (voir OPEN_SECTORS).
const OPEN_SECTOR = "event";

export function SectorShowcaseHub() {
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Défilement autonome seulement quand la section est à l'écran.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const autoplay = !reduceMotion && !userPaused;
  const running = autoplay && inView && !hovered;
  const sector = SECTORS[active];

  function select(index: number, focus = false) {
    const i = (index + SECTORS.length) % SECTORS.length;
    setActive(i);
    if (focus) tabRefs.current[i]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const keys: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowRight: active + 1,
      ArrowUp: active - 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: SECTORS.length - 1,
    };
    if (e.key in keys) {
      e.preventDefault();
      select(keys[e.key], true);
    }
  }

  const progressStyle = (axis: "x" | "y"): React.CSSProperties => ({
    animation: `tab-progress-${axis} ${DURATION}s linear forwards`,
    animationPlayState: running ? "running" : "paused",
  });

  return (
    <section
      id="secteurs"
      ref={sectionRef}
      className="relative bg-background py-20 lg:py-24"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:items-center lg:gap-12">
          {/* Titre + onglets latéraux */}
          <div className="flex min-w-0 flex-col">
            <div className="mx-auto mb-8 max-w-2xl text-center lg:mx-0 lg:mb-8 lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Solutions</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                Une seule plateforme adaptée aux réalités de votre métier
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Choisissez votre activité : GiyaX s&apos;adapte à votre façon de vendre, d&apos;accueillir et
                d&apos;encaisser.
              </p>
            </div>
            <div
              role="tablist"
              aria-label="Secteurs d'activité"
              aria-orientation="vertical"
              onKeyDown={onKeyDown}
              // Mobile : trois onglets côte à côte qui tiennent dans la largeur (aucun
              // défilement). Grand écran : liste verticale.
              className="grid grid-cols-3 gap-2 lg:flex lg:flex-col lg:gap-3"
            >
              {SECTORS.map((s, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={s.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`tab-${s.id}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${s.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => select(i)}
                    className={cn(
                      s.id !== OPEN_SECTOR && "grayscale opacity-70",
                      "group relative flex min-w-0 flex-col items-center gap-1.5 overflow-hidden rounded-2xl border px-1.5 pb-3.5 pt-3 text-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:flex-row lg:items-start lg:gap-4 lg:px-5 lg:py-5 lg:text-left",
                      isActive
                        ? "border-border bg-card shadow-lg shadow-primary/10"
                        : "border-transparent bg-muted/50 hover:bg-muted lg:bg-transparent lg:hover:bg-muted/60",
                    )}
                  >
                    {/* Barre de progression : verticale sur grand écran, horizontale sur mobile */}
                    <span aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-1 bg-border/70 lg:block">
                      {isActive && autoplay && (
                        <span
                          key={`y-${active}`}
                          className="block h-full w-full origin-top bg-primary"
                          style={progressStyle("y")}
                          onAnimationEnd={() => select(active + 1)}
                        />
                      )}
                    </span>
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 lg:hidden">
                      {isActive && autoplay && (
                        <span
                          key={`x-${active}`}
                          className="block h-full w-full origin-left bg-primary"
                          style={progressStyle("x")}
                          onAnimationEnd={() => select(active + 1)}
                        />
                      )}
                    </span>

                    {/* Vignette photo du secteur (plutôt qu'un pictogramme générique). */}
                    <span
                      className={cn(
                        "relative size-11 shrink-0 overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-background transition-all lg:size-14",
                        isActive ? "ring-primary" : "ring-transparent",
                      )}
                    >
                      <Image src={s.image} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                    <span className="w-full min-w-0 lg:w-auto">
                      <span className="flex items-baseline justify-center gap-2 lg:justify-start">
                        <span
                          className={cn(
                            "block truncate font-display text-[13px] font-semibold sm:text-sm lg:text-xl",
                            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                          )}
                        >
                          {s.label}
                        </span>
                      </span>
                      {s.id !== OPEN_SECTOR && (
                        <span className="mt-1 inline-block rounded-full border border-border bg-background px-2 py-px text-[9px] font-bold uppercase tracking-wide text-muted-foreground lg:text-[10px]">Bientôt disponible</span>
                      )}
                      {/* Résumé dépliant de l'onglet actif (grand écran) */}
                      <span
                        className={cn(
                          "hidden transition-[grid-template-rows,opacity] duration-300 lg:grid",
                          isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <span className="overflow-hidden">
                          <span className="block pt-1.5 text-sm leading-relaxed text-muted-foreground">{s.short}</span>
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {!reduceMotion && (
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                className="mt-4 hidden items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-flex"
              >
                {userPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                {userPaused ? "Reprendre le défilement" : "Mettre le défilement en pause"}
              </button>
            )}
          </div>

          {/* Panneau du secteur actif */}
          <div
            role="tabpanel"
            id={`panel-${sector.id}`}
            aria-labelledby={`tab-${sector.id}`}
            className="relative isolate min-h-[560px] overflow-hidden rounded-[1.75rem] bg-[#0a4f3c] shadow-2xl shadow-primary/15 sm:min-h-[520px] lg:h-[min(640px,calc(100svh-8rem))] lg:min-h-[560px]"
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 -z-10"
              >
                <Image
                  src={sector.image}
                  alt={sector.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: sector.imagePosition ?? "50% 50%" }}
                />
                {/* Voile de lecture : très sombre sur toute la zone de texte (photos claires
                    comprises), puis s'éclaircit vers le haut pour laisser voir la photo. */}
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.8)_45%,rgba(0,0,0,0.45)_70%,rgba(0,0,0,0.12)_100%)]" />
                {/* Mobile / tablette : le texte occupe presque tout le panneau, voile général en plus. */}
                <div className="absolute inset-0 bg-black/35 lg:hidden" />
              </motion.div>
            </AnimatePresence>

            {/* Preuve produit, reprise de l'interface GiyaX */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`proof-${sector.id}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-sm font-semibold text-[#0b1f1a] shadow-lg sm:left-7 sm:top-7"
              >
                <CheckCircle2 className="size-4 text-emerald-600" />
                {sector.proof}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`copy-${sector.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-10"
              >
                <h3 className="max-w-xl font-display text-2xl font-bold leading-tight [text-shadow:0_2px_14px_rgba(0,0,0,0.55)] sm:text-3xl lg:text-4xl">
                  {sector.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)] sm:text-base">{sector.description}</p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-3 sm:gap-3">
                  {sector.benefits.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 rounded-xl border border-white/15 bg-black/40 p-3 text-xs leading-snug text-white backdrop-blur-md sm:text-[13px]"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" />
                      {b}
                    </li>
                  ))}
                </ul>
                {sector.id === OPEN_SECTOR ? (
                  <Button
                    asChild
                    size="lg"
                    className="group mt-6 h-12 rounded-full bg-secondary px-6 font-semibold text-secondary-foreground hover:bg-secondary/90"
                  >
                    <Link href={sector.href}>
                      {sector.cta}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                ) : (
                  <Button type="button" size="lg" disabled className="mt-6 h-12 rounded-full px-6 font-semibold">
                    Bientôt disponible
                  </Button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
