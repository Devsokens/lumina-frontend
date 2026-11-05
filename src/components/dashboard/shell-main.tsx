"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Pages qui gèrent elles-mêmes leur largeur et leurs marges (bandeaux pleine
// largeur du module Événements, refonte 2026-11).
const FULL_BLEED = /^\/admin\/event\/events(\/|$)/;

export function ShellMain({ children }: { children: React.ReactNode }) {
  const bleed = FULL_BLEED.test(usePathname());
  return (
    <main
      className={cn(
        "mobile-readable min-w-0 flex-1 pb-[calc(6rem+max(env(safe-area-inset-bottom),0.875rem))]",
        bleed ? "bg-ev-bg sm:pb-0" : "p-4 sm:p-6"
      )}
    >
      {bleed ? children : <div className="mx-auto w-full min-w-0 max-w-7xl">{children}</div>}
    </main>
  );
}
