"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/charts/charts";
import { cn } from "@/lib/utils";

// Graphiques avancés du tableau de bord (SVG + framer-motion, sans
// dépendance) : courbe comparée à la période précédente, carte de chaleur
// jour × heure, tuiles KPI avec tendance et mini-courbe.

export type ComparePoint = { label: string; value: number; previous: number; count?: number };

function linePath(pts: [number, number][]) {
  return pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

// Variation en % (null si pas de base de comparaison).
export function delta(current: number, previous: number): number | null {
  if (!previous) return current ? null : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function DeltaBadge({ value, className }: { value: number | null; className?: string }) {
  if (value === null) {
    return <span className={cn("rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary", className)}>Nouveau</span>;
  }
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        value > 0 ? "bg-success/15 text-success" : value < 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
        className
      )}
    >
      <Icon className="size-3" />
      {value > 0 ? "+" : ""}
      {value} %
    </span>
  );
}

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const id = useId().replace(/:/g, "");
  const W = 120;
  const H = 32;
  const max = Math.max(1, ...values);
  const pts: [number, number][] = values.map((v, i) => [
    values.length > 1 ? (i * W) / (values.length - 1) : W / 2,
    H - 2 - (v / max) * (H - 4),
  ]);
  if (!pts.length) return null;
  const line = linePath(pts);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={cn("h-8 w-full", className)} aria-hidden>
      <defs>
        <linearGradient id={`s-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W},${H} L0,${H} Z`} fill={`url(#s-${id})`} />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9 }}
      />
    </svg>
  );
}

export function KpiTile({
  label,
  value,
  previous,
  format,
  icon: Icon,
  trend,
  index = 0,
}: {
  label: string;
  value: number;
  previous: number;
  format?: (v: number) => string;
  icon: LucideIcon;
  trend?: number[];
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="relative overflow-hidden rounded-2xl border border-border/80 bg-card px-4 pb-2 pt-3 shadow-xs"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[11px] font-semibold text-muted-foreground">{label}</p>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-3.5" />
        </span>
      </div>
      <p className="mt-1 font-display text-xl font-extrabold sm:text-2xl">
        <AnimatedNumber value={value} format={format} />
      </p>
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <DeltaBadge value={delta(value, previous)} />
        <span className="truncate">vs période précédente</span>
      </div>
      {trend && <Sparkline values={trend} className="mt-1" />}
    </motion.div>
  );
}

// Courbe de la période (aire) + période précédente (pointillés) + volume
// (barres) ; info-bulle au survol.
export function ComparisonChart({
  data,
  height = 220,
  format = (v: number) => v.toLocaleString("fr-FR"),
  countLabel = "commandes",
}: {
  data: ComparePoint[];
  height?: number;
  format?: (v: number) => string;
  countLabel?: string;
}) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = height;
  const pad = { t: 14, b: 26, l: 4, r: 4 };
  const plotH = H - pad.t - pad.b;
  const max = Math.max(1, ...data.flatMap((d) => [d.value, d.previous]));
  const maxCount = Math.max(1, ...data.map((d) => d.count ?? 0));
  const step = data.length > 1 ? (W - pad.l - pad.r) / (data.length - 1) : 0;
  const x = (i: number) => pad.l + (data.length > 1 ? i * step : (W - pad.l - pad.r) / 2);
  const y = (v: number) => pad.t + (1 - v / max) * plotH;
  const cur = data.map((d, i) => [x(i), y(d.value)] as [number, number]);
  const prev = data.map((d, i) => [x(i), y(d.previous)] as [number, number]);
  const line = linePath(cur);
  const barW = Math.max(2, Math.min(18, step * 0.5));
  const labelEvery = Math.ceil(data.length / 8);

  if (!data.length) return null;

  return (
    <div className="relative w-full" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`c-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad.l}
            x2={W - pad.r}
            y1={pad.t + f * plotH}
            y2={pad.t + f * plotH}
            stroke="currentColor"
            className="text-border"
            strokeDasharray="3 6"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {data.map((d, i) =>
          d.count ? (
            <motion.rect
              key={`b${i}`}
              x={x(i) - barW / 2}
              width={barW}
              rx={2}
              fill="var(--chart-2, var(--primary))"
              opacity={hover === i ? 0.45 : 0.18}
              initial={{ height: 0, y: H - pad.b }}
              animate={{ height: (d.count / maxCount) * plotH * 0.45, y: H - pad.b - (d.count / maxCount) * plotH * 0.45 }}
              transition={{ duration: 0.6, delay: i * 0.01 }}
            />
          ) : null
        )}
        <motion.path
          d={`${line} L${cur[cur.length - 1][0]},${H - pad.b} L${cur[0][0]},${H - pad.b} Z`}
          fill={`url(#c-${id})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <path
          d={linePath(prev)}
          fill="none"
          stroke="currentColor"
          className="text-muted-foreground/60"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
        {hover !== null && (
          <>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={pad.t}
              y2={H - pad.b}
              stroke="var(--primary)"
              strokeOpacity={0.4}
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={cur[hover][0]} cy={cur[hover][1]} r={4} fill="var(--background)" stroke="var(--primary)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          </>
        )}
        {data.map((_, i) => (
          <rect
            key={`h${i}`}
            x={x(i) - (step || W) / 2}
            y={0}
            width={step || W}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10px] text-muted-foreground">
        {data.map((d, i) => (
          <span key={i} className={cn("truncate", i % labelEvery !== 0 && i !== data.length - 1 && "invisible")}>
            {d.label}
          </span>
        ))}
      </div>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 min-w-36 -translate-x-1/2 rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg"
          style={{ left: `${Math.min(88, Math.max(12, (x(hover) / W) * 100))}%` }}
        >
          <p className="font-medium text-muted-foreground">{data[hover].label}</p>
          <p className="mt-1 flex justify-between gap-3">
            <span>Période</span>
            <span className="font-semibold">{format(data[hover].value)}</span>
          </p>
          <p className="flex justify-between gap-3 text-muted-foreground">
            <span>Précédente</span>
            <span>{format(data[hover].previous)}</span>
          </p>
          {data[hover].count !== undefined && (
            <p className="flex justify-between gap-3 text-muted-foreground">
              <span className="capitalize">{countLabel}</span>
              <span>{data[hover].count}</span>
            </p>
          )}
        </div>
      )}
      <div className="mt-2 flex gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-primary" /> Période
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t border-dashed border-muted-foreground" /> Période précédente
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[var(--chart-2,var(--primary))] opacity-40" /> {countLabel}
        </span>
      </div>
    </div>
  );
}

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// Carte de chaleur : affluence par jour de semaine et heure.
export function Heatmap({ data, unit = "commandes" }: { data: number[][]; unit?: string }) {
  const max = Math.max(1, ...data.flat());
  const [hover, setHover] = useState<{ d: number; h: number } | null>(null);
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <div className="grid min-w-[480px] grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] gap-[3px] text-[9px] text-muted-foreground">
          <span />
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="text-center">
              {h % 3 === 0 ? `${h}h` : ""}
            </span>
          ))}
          {data.map((row, d) => (
            <div key={d} className="contents">
              <span className="self-center pr-1 text-right font-medium">{DAYS[d]}</span>
              {row.map((v, h) => (
                <motion.span
                  key={h}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (d * 24 + h) * 0.002 }}
                  onMouseEnter={() => setHover({ d, h })}
                  onMouseLeave={() => setHover(null)}
                  className={cn("aspect-square rounded-[3px]", hover?.d === d && hover.h === h && "ring-2 ring-primary")}
                  style={{
                    background: v
                      ? `color-mix(in oklab, var(--primary) ${Math.round(18 + (v / max) * 82)}%, transparent)`
                      : "var(--muted)",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {hover
            ? `${DAYS[hover.d]} ${hover.h}h–${hover.h + 1}h : ${data[hover.d][hover.h]} ${unit}`
            : "Survolez une case pour le détail"}
        </span>
        <span className="inline-flex items-center gap-1">
          Moins
          {[0.2, 0.45, 0.7, 1].map((f) => (
            <span key={f} className="size-2.5 rounded-sm" style={{ background: `color-mix(in oklab, var(--primary) ${Math.round(f * 100)}%, transparent)` }} />
          ))}
          Plus
        </span>
      </div>
    </div>
  );
}
