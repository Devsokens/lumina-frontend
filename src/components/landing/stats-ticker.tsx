"use client";

import { motion } from "framer-motion";
import { Clock, ShieldCheck, Zap, Smartphone } from "lucide-react";


const STATS = [
  {
    icon: Clock,
    value: "< 5 min",
    label: "Pour être 100% en ligne",
    sub: "Création d'espace sans code",
  },
  {
    icon: Zap,
    value: "< 200 ms",
    label: "Transmission cuisine (KDS)",
    sub: "Synchronisation temps réel",
  },
  {
    icon: Smartphone,
    value: "100%",
    label: "Airtel & Moov Money",
    sub: "Encaissement direct sans TPE",
  },
  {
    icon: ShieldCheck,
    value: "0%",
    label: "Fraude de billetterie",
    sub: "QR cryptés inviolables",
  },
];

export function StatsTicker() {
  return (
    <section className="relative border-y border-border/70 bg-card/40 py-12 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center sm:items-start sm:text-left"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <Icon className="size-5" />
                </div>
                <span className="font-mono text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {stat.value}
                </span>
                <span className="mt-1 font-display text-sm font-semibold text-foreground">
                  {stat.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stat.sub}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
