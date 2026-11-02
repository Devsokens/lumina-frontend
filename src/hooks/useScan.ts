"use client";

import { useZxing } from "react-zxing";

// Moteur de lecture ZXing (WASM) servi par le site : la CSP interdit le CDN
// jsdelivr que la bibliothèque utilise par défaut. Copie de
// node_modules/zxing-wasm/dist/reader/zxing_reader.wasm (zxing-wasm 3.1.3) —
// à recopier si la dépendance change de version.
const WASM_URL = "/zxing/zxing_reader.wasm";

// `paused` est piloté par la page : la caméra reste en pause tant qu'un
// verdict est affiché, puis reprend au "Scanner suivant".
export function useScan(
  onResult: (text: string) => void,
  paused: boolean,
  onError: (error: unknown) => void
) {
  const { ref, torch } = useZxing({
    onDecodeResult(result) {
      if (paused) return;
      onResult(result.rawValue);
    },
    onError,
    paused,
    formats: ["qr_code"],
    wasmUrl: WASM_URL,
    constraints: { audio: false, video: { facingMode: "environment" } },
  });

  function toggleTorch() {
    if (!torch.isAvailable) return;
    void (torch.isOn ? torch.off() : torch.on());
  }

  return { ref, toggleTorch, isTorchAvailable: torch.isAvailable === true, isTorchOn: torch.isOn };
}
