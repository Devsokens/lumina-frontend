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
        <span aria-hidden className="giyax-loader-x absolute inset-0 bg-[url(/brand/giyax-icon-x.png)] bg-contain bg-center bg-no-repeat" />
        <span aria-hidden className="giyax-loader-shine absolute inset-0" />
      </span>
      {label ? <span className="text-sm font-medium text-muted-foreground">{label}</span> : <span className="sr-only">Chargement…</span>}
    </div>
  );
}

// Voile plein écran pendant une action qui change d'écran (connexion,
// inscription, déconnexion) : on voit que ça travaille, et rien d'autre
// n'est cliquable entre-temps.
export function GiyaxOverlay({ show, label }: { show: boolean; label?: string }) {
  if (!show) return null;
  return (
    <div className="giyax-overlay fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-sm">
      <GiyaxLoader size="lg" label={label} className="py-0" />
    </div>
  );
}
