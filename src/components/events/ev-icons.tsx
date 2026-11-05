import { TYPE_ICON_PATHS } from "@/lib/event-meta";

// Icône d'un type d'événement (tracés du design).
export function TypeIcon({ icon, size = 16, className }: { icon: keyof typeof TYPE_ICON_PATHS; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d={TYPE_ICON_PATHS[icon]} />
    </svg>
  );
}

// Médaille « Certifiant » (cartes d'événement).
export function AwardIcon({ size = 13, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden className={className}>
      <circle cx="12" cy="9" r="6" />
      <path d="m8.5 14-1.5 8 5-3 5 3-1.5-8" />
    </svg>
  );
}
