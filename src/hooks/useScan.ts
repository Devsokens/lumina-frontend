"use client";

import { useState } from "react";
import { useZxing } from "react-zxing";

export function useScan(onResult: (text: string) => void) {
  const [isTorchOn, setTorchOn] = useState(false);
  const [paused, setPaused] = useState(false);

  const { ref, torch } = useZxing({
    onDecodeResult(result) {
      if (paused) return;
      setPaused(true);
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

  function resume() {
    setPaused(false);
  }

  return { ref, toggleTorch, isTorchAvailable: torch.isAvailable, isTorchOn, resume, paused };
}
