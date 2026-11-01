"use client";

import { useEffect, useId, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// Graphiques légers en SVG animé (framer-motion déjà présent : aucune
// dépendance de plus). Couleurs = variables du thème (--primary, --chart-*).

export type Point = { label: string; value: number };

// Courbe lissée (Catmull-Rom → Bézier) passant par tous les points.
function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function AreaChart({
  data,
  height = 150,
  format = (v: number) => v.toLocaleString("fr-FR"),
}: {
  data: Point[];
  height?: number;
  format?: (v: number) => string;
}) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = height;
  const pad = { t: 16, b: 28, l: 8, r: 8 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const pts: [number, number][] = data.map((d, i) => [
    pad.l + (data.length === 1 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (data.length - 1)),
    pad.t + (1 - d.value / max) * (H - pad.t - pad.b),
  ]);
  const line = smoothPath(pts);
  const area = pts.length ? `${line} L${pts[pts.length - 1][0]},${H - pad.b} L${pts[0][0]},${H - pad.b} Z` : "";

  if (data.length === 0) return <EmptyChart height={height} />;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad.l}
            x2={W - pad.r}
            y1={pad.t + f * (H - pad.t - pad.b)}
            y2={pad.t + f * (H - pad.t - pad.b)}
            stroke="currentColor"
            className="text-border"
            strokeDasharray="4 6"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <motion.path
          d={area}
          fill={`url(#g-${id})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
        {pts.map(([x, y], i) => (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={x - W / data.length / 2} y={0} width={W / data.length} height={H} fill="transparent" />
            <motion.circle
              cx={x}
              cy={y}
              r={hover === i ? 5 : 3}
              fill="var(--background)"
              stroke="var(--primary)"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.04 }}
            />
          </g>
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10px] text-muted-foreground">
        {data.map((d, i) => (
          <span key={i} className={cn("truncate", data.length > 8 && i % 2 === 1 && "invisible")}>
            {d.label}
          </span>
        ))}
      </div>
      {hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-border bg-popover px-2 py-1 text-xs shadow-md"
          style={{ left: `${(pts[hover][0] / W) * 100}%`, top: Math.max(0, (pts[hover][1] / H) * height - 40) }}
        >
          <p className="font-semibold">{format(data[hover].value)}</p>
          <p className="text-muted-foreground">{data[hover].label}</p>
        </div>
      )}
    </div>
  );
}

export type Slice = { label: string; value: number; color: string };

export function DonutChart({ data, centerLabel, centerValue }: { data: Slice[]; centerLabel: string; centerValue: string }) {
  const total = data.reduce((n, s) => n + s.value, 0);
  const R = 42;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative size-28 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeWidth="12" className="text-muted" />
          {total > 0 &&
            data.map((s, i) => {
              const len = (s.value / total) * C;
              const el = (
                <motion.circle
                  key={s.label}
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="12"
                  strokeLinecap="butt"
                  strokeDashoffset={-offset}
                  initial={{ strokeDasharray: `0 ${C}` }}
                  animate={{ strokeDasharray: `${len} ${C - len}` }}
                  transition={{ duration: 0.9, delay: 0.15 * i, ease: "easeOut" }}
                />
              );
              offset += len;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-lg font-extrabold">{centerValue}</span>
          <span className="text-[10px] text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full space-y-1.5 text-[11px]">
        {data.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="font-semibold">
              {s.value.toLocaleString("fr-FR")}
              <span className="ml-1 font-normal text-muted-foreground">
                {total > 0 ? Math.round((s.value / total) * 100) : 0} %
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarList({
  data,
  format = (v: number) => v.toLocaleString("fr-FR"),
}: {
  data: Point[];
  format?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <EmptyChart height={120} />;
  return (
    <ul className="space-y-2">
      {data.map((d, i) => (
        <li key={`${d.label}-${i}`} className="space-y-1">
          <div className="flex justify-between gap-3 text-xs">
            <span className="truncate font-medium">{d.label}</span>
            <span className="shrink-0 font-semibold">{format(d.value)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.06 * i, ease: "easeOut" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Nombre qui défile jusqu'à sa valeur.
export function AnimatedNumber({ value, format = (v: number) => Math.round(v).toLocaleString("fr-FR") }: { value: number; format?: (v: number) => string }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => format(v));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [mv, value]);
  return <motion.span>{text}</motion.span>;
}

function EmptyChart({ height }: { height: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl border border-dashed border-border text-xs text-muted-foreground"
      style={{ height }}
    >
      Pas encore de données
    </div>
  );
}
