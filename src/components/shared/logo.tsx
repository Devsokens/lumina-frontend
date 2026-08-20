import { Sun } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Use on dark, non-theme-aware backgrounds (e.g. the footer) where the gradient text wouldn't show. */
  inverted?: boolean;
}

export function Logo({ className = "", size = "md", inverted = false }: LogoProps) {
  const iconSize = size === "sm" ? "size-5" : size === "lg" ? "size-7" : "size-6";
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <Link
      href="/"
      className={`group flex items-center gap-2.5 font-display font-bold tracking-tight text-foreground transition-opacity hover:opacity-90 ${className}`}
    >
      <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#063326] p-2 text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
        <Sun className={`${iconSize} animate-[spin_16s_linear_infinite] text-secondary`} strokeWidth={2.5} />
      </div>
      {inverted ? (
        <span className={`${textSize} font-extrabold tracking-wider text-white`}>LUMINA</span>
      ) : (
        <span className={`${textSize} font-extrabold tracking-wider bg-gradient-to-r from-primary via-[#16654f] to-primary bg-clip-text text-transparent dark:from-white dark:to-emerald-300`}>
          LUMINA
        </span>
      )}
    </Link>
  );
}

