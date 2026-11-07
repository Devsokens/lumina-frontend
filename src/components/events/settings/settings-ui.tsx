"use client";

import type { ReactNode } from "react";
import { EvSoon } from "@/components/events/ev-ui";
import { cn } from "@/lib/utils";

// Briques des écrans Paramètres (refonte Claude Design 2026-11, écrans 23-25).

export function SettingsHeading({ title, sub }: { title: ReactNode; sub: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="m-0 text-lg font-semibold sm:text-xl">{title}</h2>
      <span className="text-sm text-ev-muted">{sub}</span>
    </div>
  );
}

export function SettingsCard({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-[16px] border border-ev-border bg-ev-surface", className)}>{children}</section>;
}

// Ligne « libellé à gauche (240 px), réglages à droite ».
export function SettingsRow({ title, desc, children, last, soon }: { title: ReactNode; desc: ReactNode; children: ReactNode; last?: boolean; soon?: boolean }) {
  return (
    <div className={cn("grid gap-4 p-5 sm:p-6 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8 xl:grid-cols-[240px_minmax(0,1fr)]", !last && "border-b border-ev-line")}>
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-sm font-semibold">
          {title}
          {soon && <EvSoon />}
        </span>
        <span className="text-[13px] leading-normal text-ev-muted">{desc}</span>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Field({ label, hint, children, className }: { label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5 text-[13px] font-medium", className)}>
      <span className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">{label}</span>
        {hint !== undefined && <span className="font-normal text-ev-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

// Champ avec préfixe ou suffixe gris (+241, %, adresse du site).
export function AddonInput({
  prefix,
  suffix,
  children,
  className,
  mono,
}: {
  prefix?: ReactNode;
  suffix?: ReactNode;
  children: ReactNode;
  className?: string;
  mono?: boolean;
}) {
  const addon = cn("flex shrink-0 items-center bg-ev-soft px-3 text-ev-muted", mono ? "font-ev-mono text-[13px]" : "text-sm");
  return (
    <span
      className={cn(
        "flex h-[42px] overflow-hidden rounded-[10px] border border-ev-border bg-ev-surface focus-within:border-ev-primary focus-within:shadow-[0_0_0_3px_var(--ev-mint)] has-[:disabled]:bg-ev-soft",
        className
      )}
    >
      {prefix !== undefined && <span className={cn(addon, "border-r border-ev-border")}>{prefix}</span>}
      {children}
      {suffix !== undefined && <span className={cn(addon, "border-l border-ev-border")}>{suffix}</span>}
    </span>
  );
}

export const ADDON_FIELD = "min-w-0 flex-1 border-0 bg-transparent px-3 text-sm font-normal text-ev-ink outline-none placeholder:text-ev-muted disabled:cursor-not-allowed disabled:text-ev-muted";

// Interrupteur du design, en taille 36 × 22 (messages) ou 40 × 24.
export function MiniSwitch({ checked, disabled, ariaLabel, onChange, small }: { checked: boolean; disabled?: boolean; ariaLabel: string; onChange?: (v: boolean) => void; small?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ev-mint disabled:cursor-not-allowed disabled:opacity-60",
        small ? "h-[22px] w-9" : "h-6 w-10",
        checked ? "bg-ev-primary" : "bg-ev-dash"
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] rounded-full bg-white transition-all",
          small ? "size-4" : "size-[18px]",
          checked ? (small ? "left-[17px]" : "left-[19px]") : "left-[3px]"
        )}
      />
    </button>
  );
}

// Carte radio (bordure verte 1,5 px et fond menthe pâle une fois choisie).
export function RadioCard({
  name,
  checked,
  disabled,
  title,
  desc,
  onSelect,
}: {
  name: string;
  checked: boolean;
  disabled?: boolean;
  title: ReactNode;
  desc: ReactNode;
  onSelect?: () => void;
}) {
  return (
    <label
      className={cn(
        "relative flex gap-3 rounded-[12px] px-3.5 py-3",
        checked ? "border-[1.5px] border-ev-primary bg-ev-selected" : "border border-ev-border",
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      )}
    >
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={() => onSelect?.()} className="absolute size-px opacity-0" />
      <span aria-hidden className={cn("mt-px size-[18px] shrink-0 rounded-full bg-white", checked ? "border-[5px] border-ev-primary" : "border-[1.5px] border-ev-dash")} />
      <span className={cn("flex flex-col gap-0.5", disabled && !checked && "opacity-70")}>
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-[13px] text-ev-muted">{desc}</span>
      </span>
    </label>
  );
}

// Pastille d'état (« À configurer », « Facultatif », « Formule Pro »).
export function StatePill({ tone = "neutral", dot, children }: { tone?: "neutral" | "warn" | "ok"; dot?: boolean; children: ReactNode }) {
  const tones = {
    neutral: "bg-[#F1EFE9] text-ev-muted dark:bg-ev-line",
    warn: "bg-ev-warn-bg text-ev-gold-text",
    ok: "bg-ev-ok-bg text-ev-ok",
  }[tone];
  return (
    <span className={cn("inline-flex h-[26px] shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold", tones)}>
      {dot && <span className={cn("size-1.5 rounded-full", tone === "warn" ? "bg-[#C98A1A]" : tone === "ok" ? "bg-ev-dot" : "bg-ev-muted")} />}
      {children}
    </span>
  );
}

// Bandeau d'information (icône i).
export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-[12px] border border-ev-border bg-ev-surface px-4 py-3.5">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-px shrink-0 text-ev-ink2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v5h1" />
      </svg>
      <span className="text-[13px] leading-[1.55] text-ev-ink2">{children}</span>
    </div>
  );
}
