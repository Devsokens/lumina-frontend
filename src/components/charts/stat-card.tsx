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
      className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-xs transition-shadow hover:shadow-md"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 size-20 rounded-full bg-primary/10 blur-2xl transition-transform group-hover:scale-125" />
      <div className="flex items-center justify-between">
        <p className="truncate text-[11px] font-semibold text-muted-foreground">{label}</p>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-3.5" />
        </span>
      </div>
      <p className="mt-1 font-display text-xl font-extrabold text-foreground sm:text-2xl">
        <AnimatedNumber value={value} format={format} />
      </p>
      {hint && <p className="truncate text-[10px] text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}
