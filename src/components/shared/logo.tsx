import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Version blanche, pour les fonds sombres (pied de page, barre latérale). */
  inverted?: boolean;
}

// Logo officiel GiyaX (docs/Soken's__GiyaX, déclinaisons dans public/brand).
// Versions allégées 480×203 (même ratio que l'original).
export function Logo({ className = "", size = "md", inverted = false }: LogoProps) {
  const height = size === "sm" ? "h-7" : size === "lg" ? "h-11" : "h-9";
  return (
    <Link
      href="/"
      aria-label="GiyaX — accueil"
      className={`group inline-flex shrink-0 items-center transition-opacity hover:opacity-90 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={inverted ? "/brand/giyax-logo-white.png" : "/brand/giyax-logo.png"}
        alt="GiyaX"
        width={480}
        height={203}
        className={`${height} w-auto select-none ${inverted ? "" : "dark:hidden"}`}
        draggable={false}
        fetchPriority="high"
      />
      {!inverted && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/brand/giyax-logo-white.png"
          alt="GiyaX"
          width={480}
          height={203}
          className={`${height} hidden w-auto select-none dark:block`}
          draggable={false}
        />
      )}
    </Link>
  );
}
