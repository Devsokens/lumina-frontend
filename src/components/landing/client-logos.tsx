"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { BedDouble, ChefHat, Drum, Flame, Leaf, Music2, Sun, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

// Logos des entreprises qui utilisent GiyaX.
// Déposer les fichiers dans public/images/clients/ (SVG, ou PNG à fond
// transparent, environ 400 × 160 px) puis les déclarer ici, par exemple :
//   { name: "Nom de l'entreprise", src: "/images/clients/nom.svg" },
// Dès que cette liste contient un logo, les marques fictives ci-dessous ne
// sont plus affichées.
const CLIENT_LOGOS: { name: string; src: string }[] = [];

// ⚠️ MARQUES FICTIVES (démonstration de la mise en page uniquement) : à
// remplacer par de vrais clients avant la mise en ligne.
const DEMO_LOGOS: { name: string; hover: string; mark: ReactNode }[] = [
  {
    name: "Okoumé Live",
    hover: "group-hover:text-orange-600",
    mark: (
      <span className="flex items-center gap-2">
        <Music2 className="size-6" />
        <span className="font-display text-lg font-black tracking-[0.18em]">OKOUMÉ</span>
        <span className="rounded border border-current px-1 text-[10px] font-bold tracking-widest">LIVE</span>
      </span>
    ),
  },
  {
    name: "Maison Nyembwe",
    hover: "group-hover:text-emerald-700",
    mark: (
      <span className="flex items-center gap-2">
        <Leaf className="size-6" />
        <span className="leading-none">
          <span className="block font-serif text-xs italic">Maison</span>
          <span className="block font-serif text-xl font-bold">Nyembwe</span>
        </span>
      </span>
    ),
  },
  {
    name: "Baie Lodge",
    hover: "group-hover:text-sky-700",
    mark: (
      <span className="flex items-center gap-2">
        <Waves className="size-6" />
        <span className="font-display text-xl">
          <span className="font-bold">baie</span>
          <span className="font-light">lodge</span>
        </span>
      </span>
    ),
  },
  {
    name: "Ngoma Nights",
    hover: "group-hover:text-violet-700",
    mark: (
      <span className="flex items-center gap-2">
        <Drum className="size-6" />
        <span className="leading-none">
          <span className="block font-display text-xl font-extrabold tracking-tight">NGOMA</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.35em]">nights</span>
        </span>
      </span>
    ),
  },
  {
    name: "Chez Tantine Awa",
    hover: "group-hover:text-rose-700",
    mark: (
      <span className="flex items-center gap-2">
        <ChefHat className="size-6" />
        <span className="leading-none">
          <span className="block text-[11px] font-medium">Chez Tantine</span>
          <span className="block font-serif text-2xl font-black">AWA</span>
        </span>
      </span>
    ),
  },
  {
    name: "Suites Komo",
    hover: "group-hover:text-amber-700",
    mark: (
      <span className="flex items-center gap-2">
        <BedDouble className="size-6" />
        <span className="leading-none">
          <span className="block font-display text-xl font-bold tracking-[0.12em]">KOMO</span>
          <span className="block text-[10px] font-semibold tracking-[0.4em]">SUITES</span>
        </span>
      </span>
    ),
  },
  {
    name: "Grill Ogooué",
    hover: "group-hover:text-red-700",
    mark: (
      <span className="flex items-center gap-2">
        <Flame className="size-6" />
        <span className="font-mono text-base font-bold uppercase tracking-tight">Grill·Ogooué</span>
      </span>
    ),
  },
  {
    name: "Équateur Fest",
    hover: "group-hover:text-yellow-600",
    mark: (
      <span className="flex items-center gap-2">
        <Sun className="size-6" />
        <span className="font-display text-xl font-extrabold lowercase">équateur</span>
        <span className="rounded-full bg-current/15 px-2 py-0.5 text-[10px] font-bold uppercase">fest</span>
      </span>
    ),
  },
];

type Item = { name: string; src?: string; hover?: string; mark?: ReactNode };

// Répète la liste pour remplir une rangée, puis la double pour un défilement sans couture.
function track(items: Item[], min: number) {
  if (items.length === 0) return [];
  const row = [...items];
  while (row.length < min) row.push(...items);
  return [...row, ...row];
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  shown: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function ClientLogos() {
  const items: Item[] = CLIENT_LOGOS.length > 0 ? CLIENT_LOGOS : DEMO_LOGOS;
  const even = items.filter((_, i) => i % 2 === 0);
  const odd = items.filter((_, i) => i % 2 === 1);
  const rowA = track(even, 6);
  const rowB = track(odd.length > 0 ? odd : items, 6);

  return (
    <section id="clients" className="relative overflow-hidden border-y border-border/60 bg-card/50 py-16 sm:py-20">
      {/* Halo discret aux couleurs de la marque */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/10 via-secondary/15 to-primary/10 blur-[100px]" />

      <motion.div
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.4 }}
        className="mx-auto max-w-3xl px-4 text-center sm:px-6"
      >
        <motion.p
          variants={{ hidden: { opacity: 0, y: 10 }, shown: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
          className="text-xs font-semibold uppercase tracking-widest text-primary"
        >
          Ils nous font confiance
        </motion.p>
        <h2 className="mt-3 flex flex-wrap items-center justify-center gap-x-[0.28em] font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          <motion.span custom={0} variants={wordVariants} className="inline-block">
            Ils
          </motion.span>
          <motion.span custom={1} variants={wordVariants} className="inline-block">
            utilisent
          </motion.span>
          {/* Le logo officiel à la place du mot « GiyaX » */}
          <motion.span custom={2} variants={wordVariants} className="inline-flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/giyax-logo.png"
              alt="GiyaX"
              width={480}
              height={203}
              className="h-[1.25em] w-auto translate-y-[0.06em] dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/giyax-logo-white.png"
              alt="GiyaX"
              width={480}
              height={203}
              className="hidden h-[1.25em] w-auto translate-y-[0.06em] dark:block"
            />
          </motion.span>
        </h2>
        {/* Trait or qui se déploie sous le titre */}
        <motion.span
          aria-hidden="true"
          variants={{
            hidden: { scaleX: 0 },
            shown: { scaleX: 1, transition: { delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="mx-auto mt-4 block h-1 w-24 origin-center rounded-full bg-secondary"
        />
        <motion.p
          variants={{ hidden: { opacity: 0, y: 12 }, shown: { opacity: 1, y: 0, transition: { delay: 0.45, duration: 0.5 } } }}
          className="mt-4 text-base text-muted-foreground sm:text-lg"
        >
          Organisateurs d&apos;événements, restaurants et loueurs de meublés vendent et encaissent chaque jour avec
          GiyaX.
        </motion.p>
      </motion.div>

      {/* Mur de logos : deux rangées qui arrivent des côtés opposés puis défilent */}
      <div className="marquee-mask mt-10 space-y-4 sm:mt-12">
        <LogoRow items={rowA} from={120} delay={0.25} direction="left" />
        <LogoRow items={rowB} from={-120} delay={0.4} direction="right" />
      </div>
    </section>
  );
}

function LogoRow({
  items,
  from,
  delay,
  direction,
}: {
  items: Item[];
  from: number;
  delay: number;
  direction: "left" | "right";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: from }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <ul className={direction === "left" ? "animate-marquee" : "animate-marquee-reverse"}>
        {items.map((item, i) => (
          // Le doublon de la liste (défilement) est masqué aux lecteurs d'écran.
          <li key={i} aria-hidden={i >= items.length / 2 || undefined} className="mx-2 shrink-0">
            <LogoTile item={item} />
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function LogoTile({ item }: { item: Item }) {
  if (item.src) {
    return (
      <div className="group flex h-20 w-44 items-center justify-center rounded-2xl border border-border/70 bg-white px-6 shadow-xs transition-shadow hover:shadow-md sm:h-24 sm:w-52">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.name}
          loading="lazy"
          className="max-h-10 w-auto max-w-full object-contain opacity-70 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 sm:max-h-12"
        />
      </div>
    );
  }
  return (
    <div
      title={item.name}
      className="group flex h-20 w-44 items-center justify-center rounded-2xl border border-border/70 bg-background px-5 shadow-xs transition-shadow hover:shadow-md sm:h-24 sm:w-52"
    >
      <span className={cn("text-foreground/45 transition-colors duration-300", item.hover)}>{item.mark}</span>
    </div>
  );
}
