import Image from "next/image";
import { cn } from "@/lib/utils";

// Chargement aux couleurs GiyaX : le logo qui respire dans un anneau dont
// l'arc doré tourne. Pur CSS (utilisable côté serveur, dans loading.tsx).
// full : occupe tout l'écran (ouverture de session, rechargement) ; sinon
// centré dans la zone qui charge. Immobile si le système demande moins
// d'animations.

const SIZES = { sm: 44, md: 68, lg: 92 } as const;

export function GiyaxLoader({ size = "md", label, full, className }: { size?: keyof typeof SIZES; label?: string; full?: boolean; className?: string }) {
  const px = SIZES[size];
  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col items-center justify-center gap-4", full ? "min-h-dvh w-full" : "w-full py-16", className)}>
      <span className="relative flex items-center justify-center" style={{ width: px, height: px }}>
        {/* Anneau : piste discrète et arc doré qui tourne. */}
        <span aria-hidden className="absolute inset-0 rounded-full border-2 border-[#0a4f3c]/15 dark:border-white/10" />
        <span aria-hidden className="giyax-loader-ring absolute inset-0 rounded-full border-2 border-transparent border-t-[#e0b13c] border-r-[#e0b13c]/40" />
        <span aria-hidden className="giyax-loader-halo absolute inset-[12%] rounded-full bg-[#2fae86]/20" />
        <Image src="/brand/giyax-favicon-192.png" alt="" width={px} height={px} priority className="giyax-loader-logo relative size-[58%] object-contain" />
      </span>
      {label ? <span className="text-sm font-medium text-muted-foreground">{label}</span> : <span className="sr-only">Chargement…</span>}
    </div>
  );
}
