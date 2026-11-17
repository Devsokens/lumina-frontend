import { cn } from "@/lib/utils";

// Chargement aux couleurs GiyaX : le X du logo se dessine en diagonale (dans
// le sens du trait doré), un reflet le traverse, puis il s'efface et
// recommence. Pur CSS (utilisable côté serveur, dans loading.tsx) : le logo
// sert de masque, aucune image à recomposer.
// full : occupe tout l'écran ; sinon centré dans la zone qui charge.
// Immobile si le système demande moins d'animations.

const SIZES = { sm: 36, md: 56, lg: 76 } as const;

export function GiyaxLoader({ size = "md", label, full, className }: { size?: keyof typeof SIZES; label?: string; full?: boolean; className?: string }) {
  const px = SIZES[size];
  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col items-center justify-center gap-4", full ? "min-h-dvh w-full" : "w-full py-16", className)}>
      <span className="relative block" style={{ width: px, height: px }}>
        <span aria-hidden className="giyax-loader-halo absolute -inset-[35%] rounded-full bg-[#2fae86]/25" />
        {/* X pâle toujours visible : l'écran n'est jamais vide entre deux boucles. */}
        <span aria-hidden className="absolute inset-0 bg-[url(/brand/giyax-icon-x.png)] bg-contain bg-center bg-no-repeat opacity-20" />
        <span aria-hidden className="giyax-loader-x absolute inset-0 bg-[url(/brand/giyax-icon-x.png)] bg-contain bg-center bg-no-repeat" />
        <span aria-hidden className="giyax-loader-shine absolute inset-0" />
      </span>
      {label ? <span className="text-sm font-medium text-muted-foreground">{label}</span> : <span className="sr-only">Chargement…</span>}
    </div>
  );
}

// Pendant une action qui change d'écran (connexion, inscription,
// déconnexion) : la page reste visible, assombrie, avec une carte d'attente
// au centre. Rien d'autre n'est cliquable entre-temps.
export function GiyaxOverlay({ show, label }: { show: boolean; label?: string }) {
  if (!show) return null;
  return (
    <div className="giyax-overlay fixed inset-0 z-[100] flex items-center justify-center bg-[rgb(4_16_12/0.35)] px-6 backdrop-blur-[2px]">
      <div className="giyax-overlay-card flex min-w-[220px] flex-col items-center rounded-[24px] border border-black/5 bg-white px-8 py-7 shadow-[0_30px_80px_rgb(4_16_12/0.35)] dark:border-white/10 dark:bg-[#0d1813]">
        <GiyaxLoader size="lg" label={label} className="py-0" />
      </div>
    </div>
  );
}
