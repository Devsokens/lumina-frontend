"use client";

import { useEffect, useState } from "react";
import { Camera, CameraOff, Flashlight, FlashlightOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScan } from "@/hooks/useScan";

type CameraState = "checking" | "prompt" | "active" | "denied" | "unavailable";

// Remplit son conteneur (plein écran sur mobile, carte sur ordinateur).
// Caméra arrière demandée explicitement (bouton = geste utilisateur, exigé
// par Safari iOS), puis lecture continue. Refus ou absence de caméra : message
// clair, la saisie manuelle reste disponible en bas de l'écran.
export function QrScanner({
  onResult,
  paused,
}: {
  onResult: (text: string) => void;
  paused: boolean;
}) {
  const [state, setState] = useState<CameraState>("checking");

  useEffect(() => {
    void initialCameraState().then(setState);
  }, []);

  async function requestCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      stream.getTracks().forEach((t) => t.stop());
      setState("active");
    } catch (err) {
      setState(isPermissionError(err) ? "denied" : "unavailable");
    }
  }

  if (state === "active") {
    return (
      <ActiveScanner
        onResult={onResult}
        paused={paused}
        onError={(err) => setState(isPermissionError(err) ? "denied" : "unavailable")}
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-black p-6 text-center text-white">
      {state === "checking" ? null : (
        <div className="flex max-w-sm flex-col items-center gap-4">
          {state === "prompt" ? (
            <Camera className="size-12" />
          ) : (
            <CameraOff className="size-12 text-red-400" />
          )}
          <p className="text-lg font-semibold">
            {state === "prompt" && "Autoriser l'accès à la caméra pour scanner les billets"}
            {state === "denied" && "Accès à la caméra refusé"}
            {state === "unavailable" && "Caméra indisponible"}
          </p>
          <p className="text-sm text-white/80">
            {state === "prompt" &&
              "Votre navigateur va vous demander l'autorisation. La caméra sert uniquement à lire les QR codes."}
            {state === "denied" &&
              "Autorisez la caméra pour ce site dans les réglages du navigateur (icône à gauche de l'adresse), puis réessayez."}
            {state === "unavailable" &&
              "Aucune caméra accessible (appareil sans caméra, caméra utilisée par une autre application ou page non sécurisée). Utilisez la saisie manuelle."}
          </p>
          <Button className="h-12 px-6 text-base" onClick={() => void requestCamera()}>
            <Camera className="size-5" />
            {state === "prompt" ? "Activer la caméra" : "Réessayer"}
          </Button>
        </div>
      )}
    </div>
  );
}

function ActiveScanner({
  onResult,
  paused,
  onError,
}: {
  onResult: (text: string) => void;
  paused: boolean;
  onError: (error: unknown) => void;
}) {
  const { ref, toggleTorch, isTorchAvailable, isTorchOn } = useScan(onResult, paused, onError);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <video ref={ref} className="h-full w-full object-cover" muted playsInline autoPlay />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-64 rounded-2xl border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
      </div>

      {isTorchAvailable && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-4 bottom-28 z-20 size-12 rounded-full"
          onClick={toggleTorch}
          aria-label={isTorchOn ? "Éteindre le flash" : "Allumer le flash"}
          aria-pressed={isTorchOn}
        >
          {isTorchOn ? <FlashlightOff className="size-5" /> : <Flashlight className="size-5" />}
        </Button>
      )}
    </div>
  );
}

// Autorisation déjà accordée : on démarre sans redemander.
async function initialCameraState(): Promise<CameraState> {
  if (!navigator.mediaDevices?.getUserMedia) return "unavailable";
  try {
    const p = await navigator.permissions.query({ name: "camera" as PermissionName });
    return p.state === "granted" ? "active" : p.state === "denied" ? "denied" : "prompt";
  } catch {
    // Firefox / Safari anciens : pas de requête "camera", on demandera.
    return "prompt";
  }
}

function isPermissionError(err: unknown): boolean {
  const name = (err as { name?: string } | null)?.name;
  return name === "NotAllowedError" || name === "SecurityError";
}
