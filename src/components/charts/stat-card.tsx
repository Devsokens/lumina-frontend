"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/charts/charts";

// Carte d'indicateur animée (apparition + chiffre qui défile).
export function StatCard({
  label,
  value,
  icon: Icon,
  format,
  hint,
  index = 0,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  format?: (v: number) => string;
  hint?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-xs transition-shadow hover:shadow-md"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/10 blur-2xl transition-transform group-hover:scale-125" />
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold text-foreground">
        <AnimatedNumber value={value} format={format} />
      </p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}
