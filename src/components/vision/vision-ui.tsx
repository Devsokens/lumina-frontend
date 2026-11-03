"use client";

import { cn } from "@/lib/utils";

// Briques visuelles communes des écrans /vision.

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({ title, children, className, aside }: { title?: string; children: React.ReactNode; className?: string; aside?: React.ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-4 sm:p-5", className)}>
      {(title || aside) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="font-display text-sm font-semibold">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-muted p-1 text-xs font-medium" role="tablist">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("rounded-lg px-3 py-1.5", value === o.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Pill({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "good" | "warn" | "bad" | "accent" }) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    good: "bg-emerald-500/15 text-emerald-400",
    warn: "bg-amber-500/15 text-amber-400",
    bad: "bg-red-500/15 text-red-400",
    accent: "bg-primary/15 text-primary",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", tones[tone])}>{children}</span>;
}

// Barre empilée horizontale (répartition).
export function StackBar({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((n, i) => n + i.value, 0) || 1;
  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {items.map((i) => (
          <div key={i.label} style={{ width: `${(i.value / total) * 100}%`, background: i.color }} className="transition-all duration-700" />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {items.map((i) => (
          <li key={i.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: i.color }} />
              {i.label}
            </span>
            <span className="font-semibold tabular-nums">{i.value.toLocaleString("fr-FR")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Pager({ page, total, limit, onPage }: { page: number; total: number; limit: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
      <span>
        {total.toLocaleString("fr-FR")} résultat(s) · page {page}/{pages}
      </span>
      <div className="flex gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">
          Précédent
        </button>
        <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">
          Suivant
        </button>
      </div>
    </div>
  );
}
