"use client";

import { useState } from "react";
import { useZxing } from "react-zxing";

// `paused` est piloté par la page : la caméra reste en pause tant qu'un
// verdict est affiché, puis reprend au "Scanner suivant".
export function useScan(onResult: (text: string) => void, paused: boolean) {
  const [isTorchOn, setTorchOn] = useState(false);

  const { ref, torch } = useZxing({
    onDecodeResult(result) {
      if (paused) return;
      onResult(result.rawValue);
    },
    paused,
  });

  function toggleTorch() {
    if (!torch.isAvailable) return;
    setTorchOn((wasOn) => {
      if (wasOn) {
        torch.off();
      } else {
        torch.on();
      }
      return !wasOn;
    });
  }

  return { ref, toggleTorch, isTorchAvailable: torch.isAvailable, isTorchOn };
}
