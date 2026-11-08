import { useId } from "react";
import { cn } from "@/lib/utils";

// GiyaX AI : personnage animé (vert et or de la marque). Il flotte, cligne
// des yeux et regarde autour de lui au repos ; un anneau doré tourne quand il
// réfléchit ; sa bouche bouge quand il écrit. Animations : globals.css
// (.giyax-*), coupées si l'appareil demande moins de mouvement.

export type GiyaxMood = "idle" | "thinking" | "talking";

export function GiyaxAvatar({ size = 40, mood = "idle", halo = false, className }: { size?: number; mood?: GiyaxMood; halo?: boolean; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const head = `gx-head-${uid}`;
  const gold = `gx-gold-${uid}`;
  const visor = `gx-visor-${uid}`;
  return (
    <span className={cn("relative inline-flex shrink-0", className)} style={{ width: size, height: size }} aria-hidden>
      {halo && <span className="giyax-halo absolute inset-0 rounded-full bg-[#F5B83D]/50" />}
      <svg viewBox="0 0 64 64" width={size} height={size} className="giyax-float relative overflow-visible">
        <defs>
          <radialGradient id={head} cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#1C9A70" />
            <stop offset="60%" stopColor="#0F5E46" />
            <stop offset="100%" stopColor="#0B3B2E" />
          </radialGradient>
          <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE3A0" />
            <stop offset="100%" stopColor="#D9A23A" />
          </linearGradient>
          <linearGradient id={visor} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F4FBF7" />
            <stop offset="100%" stopColor="#DCEFE6" />
          </linearGradient>
        </defs>

        {/* Réfléchit : anneau doré qui tourne. */}
        {mood === "thinking" && <circle cx="32" cy="35" r="30" fill="none" stroke={`url(#${gold})`} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="26 162" className="giyax-orbit" />}

        {/* Antenne et étincelle (le « spark » de l'IA). */}
        <line x1="32" y1="12" x2="32" y2="6.5" stroke="#0F5E46" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="5.5" r="2.6" fill={`url(#${gold})`} />
        <path d="M50 6 L51.6 10.4 L56 12 L51.6 13.6 L50 18 L48.4 13.6 L44 12 L48.4 10.4 Z" fill={`url(#${gold})`} className="giyax-spark" />

        {/* Tête et visière. */}
        <circle cx="32" cy="36" r="24" fill={`url(#${head})`} />
        <ellipse cx="32" cy="38" rx="17.5" ry="13.5" fill={`url(#${visor})`} />

        {/* Yeux : regardent autour, clignent. */}
        <g className="giyax-pupils">
          <g className="giyax-eye">
            <ellipse cx="25.5" cy="36" rx="3.1" ry="3.8" fill="#0B3B2E" />
            <circle cx="26.6" cy="34.6" r="1" fill="#FFFFFF" />
          </g>
          <g className="giyax-eye">
            <ellipse cx="38.5" cy="36" rx="3.1" ry="3.8" fill="#0B3B2E" />
            <circle cx="39.6" cy="34.6" r="1" fill="#FFFFFF" />
          </g>
        </g>

        {/* Joues dorées. */}
        <circle cx="20" cy="42" r="2.2" fill="#F5B83D" opacity="0.45" />
        <circle cx="44" cy="42" r="2.2" fill="#F5B83D" opacity="0.45" />

        {/* Bouche : sourire au repos, parle en écrivant. */}
        {mood === "talking" ? (
          <ellipse cx="32" cy="44.2" rx="3.6" ry="2.6" fill="#0B3B2E" className="giyax-mouth-talk" />
        ) : (
          <path d="M27.5 43 Q32 47.2 36.5 43" fill="none" stroke="#0B3B2E" strokeWidth="2.2" strokeLinecap="round" />
        )}
      </svg>
    </span>
  );
}
