"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";

interface WhyItem {
  number: string;
  title: string;
  description: string;
  dotColor: string;
  dotColorSoft: string;
}

const ITEMS: WhyItem[] = [
  {
    number: "01",
    title: "Toujours synchronisé avec votre activité",
    description:
      "LUMINA centralise vos commandes, vos stocks et vos encaissements en temps réel, sur tous vos points de vente, sans jamais perdre le fil.",
    dotColor: "bg-primary",
    dotColorSoft: "bg-primary/25",
  },
  {
    number: "02",
    title: "Agit, pas seulement des rapports",
    description:
      "Alertes de rupture de stock, transmission instantanée en cuisine, relances de paiement : LUMINA exécute, il ne se contente pas d'afficher des chiffres.",
    dotColor: "bg-secondary",
    dotColorSoft: "bg-secondary/30",
  },
  {
    number: "03",
    title: "Connecté à tout votre écosystème",
    description:
      "Mobile Money, QR codes, écran cuisine, boutique en ligne : tout communique en direct, sans ressaisie ni double gestion.",
    dotColor: "bg-accent",
    dotColorSoft: "bg-accent/30",
  },
  {
    number: "04",
    title: "Plus précis à chaque commande",
    description:
      "Vos tableaux de bord s'affinent avec chaque vente, pour des prévisions de stock et de revenus toujours plus fiables.",
    dotColor: "bg-success",
    dotColorSoft: "bg-success/30",
  },
];

// Positions fixed on purpose so the scatter is stable across renders (no hydration drift).
const DOT_LAYOUT = [
  { left: "12%", top: "72%", size: 8, soft: true },
  { left: "24%", top: "84%", size: 10, soft: false },
  { left: "18%", top: "56%", size: 7, soft: true },
  { left: "38%", top: "64%", size: 9, soft: false },
  { left: "48%", top: "46%", size: 11, soft: true },
  { left: "60%", top: "58%", size: 8, soft: false },
  { left: "66%", top: "38%", size: 10, soft: true },
  { left: "78%", top: "46%", size: 9, soft: false },
  { left: "84%", top: "28%", size: 11, soft: false },
];

const ROTATE_MS = 4200;

export function WhyLuminaSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ITEMS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [isPaused]);

  return (
    <section className="relative py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header: title left, description right */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-lg font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          >
            Un vrai partenaire commercial, pas juste un outil de plus
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            La plupart des outils se contentent d&apos;afficher des chiffres. LUMINA anticipe vos
            besoins, automatise les tâches critiques et devient plus précis à chaque commande.
          </motion.p>
        </div>

        {/* Cards */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {ITEMS.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={item.number}
                onMouseEnter={() => setActiveIndex(index)}
                className={`group relative min-h-[420px] cursor-pointer overflow-hidden rounded-2xl border p-4 transition-[background-color,border-color,box-shadow] duration-500 ease-out ${
                  isActive
                    ? "border-border/60 bg-card shadow-xl shadow-primary/5"
                    : "border-border/40 bg-muted/50"
                }`}
              >
                {/* Active layer */}
                <div
                  className="absolute inset-4 flex flex-col transition-opacity duration-500 ease-out"
                  style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }}
                >
                  <div className="relative h-44 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary via-[#0f6b52] to-accent">
                    <div className="absolute inset-0 bg-dots-pattern opacity-30" />
                    <span className="absolute top-3 left-3 font-mono text-xs font-semibold text-white/70">
                      {item.number}
                    </span>
                    <LayoutDashboard className="absolute -bottom-3 -right-3 size-24 text-white/10" />
                  </div>

                  <div className="flex flex-1 flex-col justify-center pt-5 pb-2">
                    <h3 className="font-display text-lg font-bold text-foreground sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Inactive layer */}
                <div
                  className="absolute inset-5 flex flex-col transition-opacity duration-500 ease-out"
                  style={{ opacity: isActive ? 0 : 1, pointerEvents: isActive ? "none" : "auto" }}
                >
                  <span className="font-display text-5xl font-black text-muted-foreground/20">
                    {item.number}
                  </span>

                  {/* Scattered dots */}
                  <div className="relative my-4 flex-1">
                    {DOT_LAYOUT.map((dot, dotIndex) => (
                      <motion.span
                        key={dotIndex}
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 2 + (dotIndex % 3) * 0.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: dotIndex * 0.15,
                        }}
                        style={{
                          left: dot.left,
                          top: dot.top,
                          width: dot.size,
                          height: dot.size,
                        }}
                        className={`absolute rounded-sm ${
                          dot.soft ? item.dotColorSoft : item.dotColor
                        }`}
                      />
                    ))}
                  </div>

                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
