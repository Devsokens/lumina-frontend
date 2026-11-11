"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { TECH_LOGOS, type TechLogoKey } from "@/components/landing/tech-logos";
import { cn } from "@/lib/utils";

// Mur de logos des services sur lesquels GiyaX s'appuie. Logos en couleurs,
// sans description ; apparition en vague à l'arrivée sur la section. Garder
// la liste alignée avec « Qui peut y accéder » de /confidentialite.

type Brand =
  | { kind: "symbol"; logo: TechLogoKey } // symbole + nom de la marque
  | { kind: "wordmark"; logo: TechLogoKey; height: string; className?: string } // mot-symbole complet
  | { kind: "image"; src: string; darkSrc?: string; name: string };

const BRANDS: Brand[] = [
  // Version blanche officielle en thème sombre (la panthère noire y disparaît).
  { kind: "image", src: "/images/tech/pvit.png", darkSrc: "/images/tech/pvit-blanc.png", name: "PVit" },
  { kind: "symbol", logo: "vercel" },
  { kind: "symbol", logo: "render" },
  { kind: "symbol", logo: "supabase" },
  { kind: "symbol", logo: "upstash" },
  // Texte bleu nuit et point vert, comme le logo officiel ; blanc en sombre.
  { kind: "wordmark", logo: "uptimerobot", height: "h-5", className: "text-[#131a2e] dark:text-white" },
  { kind: "symbol", logo: "sentry" },
  { kind: "symbol", logo: "github" },
  { kind: "wordmark", logo: "groq", height: "h-6", className: "text-[#F55036]" },
  { kind: "symbol", logo: "cloudflare" },
  { kind: "symbol", logo: "google" },
  { kind: "symbol", logo: "openstreetmap" },
];

// Marques très sombres (noir, bleu nuit) : couleur du texte du thème, pour
// rester visibles en mode sombre.
function brandColor(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return lum < 60 ? "var(--foreground)" : hex;
}

function Svg({ logo, className, style }: { logo: TechLogoKey; className?: string; style?: React.CSSProperties }) {
  const data = TECH_LOGOS[logo];
  return (
    <svg viewBox={data.viewBox} role="img" aria-label={data.title} className={className} style={style} fill="currentColor">
      {data.paths.map((p, i) => (
        <path key={i} d={p.d} fill={"fill" in p ? p.fill : undefined} />
      ))}
    </svg>
  );
}

function BrandMark({ brand }: { brand: Brand }) {
  if (brand.kind === "image") {
    const size = "h-14 w-auto object-contain";
    return brand.darkSrc ? (
      <>
        <Image src={brand.src} alt={brand.name} width={160} height={101} className={cn(size, "dark:hidden")} />
        <Image src={brand.darkSrc} alt={brand.name} width={160} height={99} className={cn(size, "hidden dark:block")} />
      </>
    ) : (
      <Image src={brand.src} alt={brand.name} width={160} height={101} className={size} />
    );
  }
  if (brand.kind === "wordmark") {
    return <Svg logo={brand.logo} className={cn("w-auto", brand.height, brand.className)} />;
  }
  const data = TECH_LOGOS[brand.logo];
  return (
    <span className="flex items-center gap-2.5">
      <Svg logo={brand.logo} className="size-7 shrink-0" style={{ color: brandColor(data.hex) }} />
      <span className="font-display text-lg font-bold tracking-tight text-foreground">{data.title}</span>
    </span>
  );
}

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const cell: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.94, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export function TechStackSection() {
  return (
    <section id="infrastructure" className="relative overflow-hidden py-20 lg:py-28">
      {/* Halo discret derrière la grille. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-72 max-w-4xl -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary dark:text-emerald-400">Infrastructure</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">Construit sur des fondations solides</h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Paiements, hébergement, sécurité : GiyaX s&apos;appuie sur des services reconnus dans le monde entier, pour que vos ventes ne s&apos;arrêtent jamais.
          </p>
        </motion.div>

        <motion.ul
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="mt-14 grid grid-cols-2 overflow-hidden rounded-3xl border border-border bg-card/80 shadow-sm backdrop-blur sm:grid-cols-3 lg:grid-cols-4"
        >
          {BRANDS.map((brand, i) => (
            <motion.li
              key={i}
              variants={cell}
              className="group relative flex h-28 items-center justify-center border-b border-r border-border/70 px-4 sm:h-32"
            >
              <span className="absolute inset-0 bg-gradient-to-b from-primary/0 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                <BrandMark brand={brand} />
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
