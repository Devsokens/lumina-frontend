"use client";

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { eventFontVariables } from "@/lib/event-fonts";

// À ajouter aux menus, panneaux et dialogues (rendus hors du module, dans un
// portail) : palette .ev et polices du module.
export const EV_PORTAL = `ev ${eventFontVariables}`;

// Briques visuelles du module Événements (refonte Claude Design, 2026-11).
// Couleurs : jetons ev-* (globals.css, classe .ev) ; police Geist.

type BtnVariant = "primary" | "secondary" | "ghost" | "link" | "soft" | "danger";
type BtnSize = "sm" | "md" | "lg";

const BTN_VARIANT: Record<BtnVariant, string> = {
  primary: "bg-ev-primary text-white font-semibold hover:bg-ev-primary-hover",
  secondary: "border border-ev-border bg-ev-surface text-ev-ink font-medium hover:bg-ev-soft",
  ghost: "text-ev-ink2 font-medium hover:bg-ev-line",
  link: "px-0! h-auto! text-ev-link font-semibold hover:underline",
  soft: "bg-[#F1EFE9] text-ev-ink2 hover:bg-ev-line dark:bg-ev-line",
  danger: "border border-ev-border bg-ev-surface text-ev-danger font-medium hover:bg-ev-soft",
};
const BTN_SIZE: Record<BtnSize, string> = {
  sm: "h-9 px-3 text-[13px] rounded-[10px] gap-1.5",
  md: "h-10 px-3.5 text-[13px] rounded-[10px] gap-2",
  lg: "h-11 px-[18px] text-sm rounded-[10px] gap-2",
};

export const EvButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize }>(
  function EvButton({ variant = "secondary", size = "md", className, type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ev-mint [&_svg]:size-4 [&_svg]:shrink-0",
          BTN_SIZE[size],
          BTN_VARIANT[variant],
          className
        )}
        {...props}
      />
    );
  }
);

export const EvIconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { size?: number }>(
  function EvIconButton({ className, size = 40, type = "button", style, ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        style={{ width: size, height: size, ...style }}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[10px] border border-ev-border bg-ev-surface text-ev-ink2 transition-colors hover:bg-ev-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ev-mint disabled:opacity-50 [&_svg]:size-4",
          className
        )}
        {...props}
      />
    );
  }
);

export function EvCard({ className, children, as: Tag = "section", ...rest }: { className?: string; children: ReactNode; as?: "section" | "div" | "article" | "aside" } & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn("rounded-[16px] border border-ev-border bg-ev-surface", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function EvProgress({ value, color, height = 6, className }: { value: number; color?: string; height?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("overflow-hidden rounded-full bg-ev-line", className)} style={{ height }}>
      <div className="h-full rounded-full bg-ev-bar" style={{ width: `${pct}%`, ...(color ? { background: color } : {}) }} />
    </div>
  );
}

// Pastille de statut (« En vente », « Brouillon »…).
export function EvPill({ tone = "ok", children, onImage, className }: { tone?: "ok" | "neutral" | "warn" | "danger"; children: ReactNode; onImage?: boolean; className?: string }) {
  const tones = {
    ok: { box: "bg-ev-ok-bg text-ev-ok", dot: "bg-ev-dot" },
    neutral: { box: "bg-ev-line text-ev-ink2", dot: "bg-ev-muted" },
    warn: { box: "bg-ev-warn-bg text-ev-gold-text", dot: "bg-ev-amber" },
    danger: { box: "bg-[#FDECEA] text-ev-danger dark:bg-[#3a1d1b]", dot: "bg-ev-danger" },
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold",
        onImage ? "bg-white text-[#0B6B4C]" : tones.box,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", onImage && tone === "ok" ? "bg-[#12A06F]" : tones.dot)} />
      {children}
    </span>
  );
}

// Onglets segmentés sur fond gris (statuts, filtres).
export function EvSegmented<T extends string>({
  value,
  onChange,
  items,
  size = "md",
  ariaLabel,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: ReactNode; count?: number; disabled?: boolean }[];
  size?: "sm" | "md";
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("inline-flex max-w-full flex-wrap rounded-[10px] bg-ev-line", size === "md" ? "gap-1 p-1" : "gap-0.5 p-[3px]", className)}
    >
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={it.disabled}
            onClick={() => onChange(it.value)}
            className={cn(
              "whitespace-nowrap rounded-[8px] text-[13px] transition-colors disabled:opacity-50",
              size === "md" ? "h-[34px] px-3.5" : "h-8 px-3",
              active ? "bg-ev-surface font-semibold text-ev-ink shadow-[0_1px_2px_rgba(22,33,28,.08)]" : "font-medium text-ev-ink3 hover:text-ev-ink"
            )}
          >
            {it.label}
            {it.count !== undefined && <span className={cn("ml-1", active ? "font-medium text-ev-muted" : "text-ev-muted")}>{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// Case à cocher carrée (18 px) du design.
export function EvCheckbox({
  checked,
  onChange,
  label,
  disabled,
  ariaLabel,
  size = 18,
  className,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  size?: number;
  className?: string;
}) {
  return (
    <label className={cn("relative inline-flex cursor-pointer items-center gap-2 text-[13px]", disabled && "cursor-not-allowed opacity-60", className)}>
      <input
        type="checkbox"
        className="peer absolute size-px opacity-0"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span
        aria-hidden
        style={{ width: size, height: size }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[5px] border transition-colors peer-focus-visible:ring-[3px] peer-focus-visible:ring-ev-mint",
          checked ? "border-ev-primary bg-ev-primary text-white" : "border-[#C9C6BC] bg-ev-surface dark:border-ev-dash"
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      {label}
    </label>
  );
}

// Interrupteur vert du design (40 × 24).
export function EvSwitch({ checked, onChange, disabled, ariaLabel }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ev-mint disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-ev-primary" : "bg-[#D9D6CC] dark:bg-ev-dash"
      )}
    >
      <span className={cn("absolute size-[18px] rounded-full bg-white shadow-sm transition-all", checked ? "left-[19px]" : "left-[3px]")} />
    </button>
  );
}

// « Bientôt » : réglage affiché mais pas encore enregistré par le serveur.
export function EvSoon({ className, children = "Bientôt" }: { className?: string; children?: ReactNode }) {
  return (
    <span
      className={cn("inline-flex h-5 items-center rounded-full bg-ev-line px-2 text-[11px] font-semibold text-ev-muted", className)}
      title="Disponible prochainement : ce réglage n'est pas encore enregistré par le serveur."
    >
      {children}
    </span>
  );
}

export function EvLabel({ children, required, hint, className }: { children: ReactNode; required?: boolean; hint?: ReactNode; className?: string }) {
  return (
    <span className={cn("flex items-center justify-between gap-2 text-[13px] font-medium text-ev-ink", className)}>
      <span>
        {children}
        {required && <span className="text-ev-danger"> *</span>}
      </span>
      {hint !== undefined && <span className="font-normal text-ev-muted">{hint}</span>}
    </span>
  );
}

const FIELD = "w-full rounded-[10px] border border-ev-border bg-ev-surface px-3 text-sm text-ev-ink outline-none transition-[border,box-shadow] placeholder:text-ev-muted focus:border-ev-primary focus:shadow-[0_0_0_3px_var(--ev-mint)] disabled:cursor-not-allowed disabled:bg-ev-soft disabled:text-ev-muted";

export const EvInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { h?: number }>(function EvInput({ className, h = 44, style, ...props }, ref) {
  return <input ref={ref} className={cn(FIELD, className)} style={{ height: h, ...style }} {...props} />;
});

export const EvTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function EvTextarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(FIELD, "py-3 leading-relaxed", className)} {...props} />;
});

export function EvSelect({ className, children, h = 44, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { h?: number }) {
  return (
    <select className={cn(FIELD, "cursor-pointer pr-8", className)} style={{ height: h }} {...props}>
      {children}
    </select>
  );
}

export function EvHr() {
  return <hr className="m-0 border-0 border-t border-ev-line" />;
}

export function EvSectionTitle({ title, sub, right, size = 16 }: { title: ReactNode; sub?: ReactNode; right?: ReactNode; size?: 15 | 16 }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2 sm:gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className={cn("m-0 font-semibold text-ev-ink", size === 16 ? "text-base" : "text-[15px]")}>{title}</h2>
        {sub && <span className="text-[13px] text-ev-muted">{sub}</span>}
      </div>
      {right}
    </div>
  );
}

// Pastille numérotée des sections (« 1 Modèle »).
export function EvStepBadge({ n }: { n: number }) {
  return <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ev-primary text-xs font-semibold text-white">{n}</span>;
}

// Initiales (avatars des participants).
export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts.length === 1 ? parts[0].charAt(0) : parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
