"use client";

import { Flashlight, FlashlightOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScan } from "@/hooks/useScan";

export function QrScanner({ onResult }: { onResult: (text: string) => void }) {
  const { ref, toggleTorch, isTorchAvailable, isTorchOn } = useScan(onResult);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <video ref={ref} className="h-full w-full object-cover" muted playsInline />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-64 rounded-2xl border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
      </div>

      {isTorchAvailable && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-8 left-1/2 size-14 -translate-x-1/2 rounded-full"
          onClick={toggleTorch}
          aria-label="Activer/désactiver la torche"
        >
          {isTorchOn ? <FlashlightOff className="size-6" /> : <Flashlight className="size-6" />}
        </Button>
      )}
    </div>
  );
}
