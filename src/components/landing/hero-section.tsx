"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandVideo } from "@/components/shared/brand-video";

const GUARANTEES = [
  "0 FCFA pour démarrer",
  "Sous-domaine offert (nom.giya.ga)",
  "Aucune application à installer pour vos clients",
];

// Part de la course de scroll consacrée à la montée de la vidéo ; le reste
// la garde plein cadre le temps de la regarder avant de libérer la page.
const RISE_END = 0.55;

export function HeroSection() {
  // Rendu serveur = version animée ; bascule après montage si la personne
  // a demandé à réduire les animations (évite un écart d'hydratation).
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduceMotion ? <StaticHero /> : <ScrollHero />;
}

/* -------------------------------------------------------------------------
 * Scène pilotée par le scroll : la zone se fige, la vidéo — petite et
 * inclinée sous le titre — se redresse et monte jusqu'à remplir l'écran
 * pendant que le texte s'efface.
 * ----------------------------------------------------------------------- */
function ScrollHero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Position de départ de la vidéo (juste sous le texte) et échelle de départ
  // (≈ largeur d'une carte de 1024 px), recalculées au redimensionnement.
  const startY = useMotionValue(560);
  const startScale = useMotionValue(0.72);

  useEffect(() => {
    const copy = copyRef.current;
    const card = cardRef.current;
    if (!copy || !card) return;
    const measure = () => {
      const copyBottom = copy.offsetTop + copy.offsetHeight;
      startY.set(Math.max(0, copyBottom + 28 - card.offsetTop));
      const target = Math.min(window.innerWidth - 32, 1024);
      startScale.set(Math.min(0.92, Math.max(0.55, target / card.offsetWidth)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(copy);
    ro.observe(card);
    return () => ro.disconnect();
  }, [startY, startScale]);

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end end"] });
  // Amorti : la montée suit le scroll sans à-coups (molette, trackpad, tactile).
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4, restDelta: 0.0005 });

  const rise = useTransform(progress, [0, RISE_END], [0, 1], { clamp: true });
  const y = useTransform([rise, startY] as MotionValue<number>[], ([r, s]: number[]) => (1 - easeOut(r)) * s);
  const scale = useTransform([rise, startScale] as MotionValue<number>[], ([r, s]: number[]) => s + (1 - s) * easeOut(r));
  const rotateX = useTransform(rise, [0, 0.85], [22, 0]);
  const radius = useTransform(rise, [0, 1], [30, 22]);

  const copyOpacity = useTransform(progress, [0.02, 0.28], [1, 0]);
  const copyY = useTransform(progress, [0, 0.35], [0, -70]);
  const copyScale = useTransform(progress, [0, 0.35], [1, 0.96]);
  const copyEvents = useTransform(copyOpacity, (o) => (o < 0.15 ? "none" : "auto"));
  const hintOpacity = useTransform(progress, [0, 0.08], [1, 0]);

  return (
    <section className="relative isolate">
      {/* Halo de marque derrière le titre. Placé hors de la scène figée (qui
          coupe ce qui dépasse) pour remonter jusqu'en haut de la page, derrière
          la navbar transparente : la barre se fond dans le hero, sans ligne de
          séparation, quand on revient en haut. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[220px] left-1/2 -z-10 h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/15 via-secondary/10 to-transparent blur-[120px]"
      />
      <div ref={stageRef} className="relative h-[200svh] lg:h-[230svh]">
        <div className="sticky top-0 h-svh overflow-hidden [perspective:1400px]">

          <motion.div
            style={{ opacity: copyOpacity, y: copyY, scale: copyScale, pointerEvents: copyEvents }}
            className="relative z-10 mx-auto max-w-7xl px-4 pt-6 sm:px-6 md:pt-10 lg:px-8"
          >
            <HeroCopy ref={copyRef} />
          </motion.div>

          {/* La vidéo, en carte qui monte et se redresse */}
          <motion.div
            ref={cardRef}
            style={{ y, scale, rotateX, borderRadius: radius, transformOrigin: "50% 0%" }}
            // Mobile : carré centré (le film garde ses titres et ses écrans dans
            // sa bande centrale) ; à partir de md : plein cadre sous la navbar.
            // Marges latérales conservées : la carte ne touche jamais les bords
            // (au plus 1280 px de large, centrée, sur grand écran).
            className="absolute inset-x-5 top-[calc((100svh-100vw+40px)/2)] z-20 aspect-square overflow-hidden bg-[#0a4f3c] shadow-[0_40px_120px_-30px_rgba(10,79,60,0.55)] ring-1 ring-black/5 will-change-transform sm:inset-x-8 sm:top-[calc((100svh-100vw+64px)/2)] md:inset-x-[max(2.5rem,calc((100%-1280px)/2))] md:top-[96px] md:bottom-6 md:aspect-auto lg:inset-x-[max(4rem,calc((100%-1280px)/2))]"
          >
            <BrandVideo className="absolute inset-0" fit="cover" />
          </motion.div>

          {/* Invitation à faire défiler */}
          <motion.div
            style={{ opacity: hintOpacity }}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-5 z-30 hidden justify-center md:flex"
          >
            <span className="flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
              Faites défiler <ChevronDown className="size-3.5 animate-bounce" />
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Décélération douce : la carte arrive vite puis se pose.
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/* Version sans animation de scroll (préférence « réduire les animations »). */
function StaticHero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeroCopy />
        <div className="relative mx-auto mt-12 max-w-5xl md:mt-14">
          <div className="rounded-[1.75rem] border border-border/70 bg-card/60 p-1.5 shadow-2xl shadow-primary/15 sm:p-2">
            <BrandVideo className="aspect-video w-full rounded-[1.4rem] bg-[#0a4f3c]" fit="cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

const HeroCopy = forwardRef<HTMLDivElement>(function HeroCopy(_props, ref) {
  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <h1
        style={{ "--hero-delay": "100ms" } as React.CSSProperties}
        className="hero-reveal max-w-4xl font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:leading-[1.08]"
      >
        Digitalisez votre activité en{" "}
        <span className="relative whitespace-nowrap">
          <span className="bg-gradient-to-r from-primary via-emerald-600 to-secondary bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-secondary">
            5 minutes chrono
          </span>
          <svg className="absolute -bottom-2 left-0 w-full text-secondary/70" viewBox="0 0 250 12" fill="none" aria-hidden="true">
            <path d="M3 9C60 3 190 3 247 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </span>
      </h1>

      <p
        style={{ "--hero-delay": "200ms" } as React.CSSProperties}
        className="hero-reveal mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
      >
        Vous vous occupez de vos clients,{" "}
        {/* Logo officiel à la place du mot « GiyaX » */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/giyax-logo.png"
          alt="GiyaX"
          width={480}
          height={203}
          className="inline-block h-[1.4em] w-auto -translate-y-[0.1em] align-middle dark:hidden"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/giyax-logo-white.png"
          alt="GiyaX"
          width={480}
          height={203}
          className="hidden h-[1.4em] w-auto -translate-y-[0.1em] align-middle dark:inline-block"
        />{" "}
        s&apos;occupe du reste : l&apos;argent qui rentre, les comptes à jour et vos ventes sous les yeux, où que vous
        soyez.
      </p>

      {/* Les deux boutons restent sur une ligne, même sur mobile */}
      <div
        style={{ "--hero-delay": "300ms" } as React.CSSProperties}
        className="hero-reveal mt-8 flex w-full items-center justify-center gap-2 sm:w-auto sm:gap-4"
      >
        <Button
          asChild
          size="lg"
          className="group h-11 whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold shadow-xl shadow-primary/30 transition-all hover:shadow-primary/45 sm:h-13 sm:px-8 sm:text-base"
        >
          <Link href="/signup">
            Créer mon compte gratuit
            <ArrowRight className="hidden size-4 transition-transform group-hover:translate-x-1 sm:block" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-11 whitespace-nowrap rounded-full border-border/80 bg-card/70 px-3.5 text-[13px] font-medium backdrop-blur-md hover:border-primary/50 hover:bg-card sm:h-13 sm:px-7 sm:text-base"
        >
          <a href="#secteurs">
            <span className="sm:hidden">Voir les solutions</span>
            <span className="hidden sm:inline">Découvrir les solutions</span>
          </a>
        </Button>
      </div>

      {/* Mobile : une colonne, coches alignées. Grand écran : une ligne. */}
      <ul
        style={{ "--hero-delay": "400ms" } as React.CSSProperties}
        className="hero-reveal mx-auto mt-7 flex w-fit flex-col items-start gap-2 text-left text-xs font-medium text-muted-foreground sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:text-sm"
      >
        {GUARANTEES.map((g) => (
          <li key={g} className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            {g}
          </li>
        ))}
      </ul>
    </div>
  );
});
