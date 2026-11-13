"use client";

import { useEffect } from "react";

// Prévient la fenêtre d'achat restée ouverte (même navigateur) que PVit a
// rendu la main, puis ferme cette fenêtre de paiement quand le navigateur
// l'autorise (fenêtre ouverte par le site). Sinon, le texte de la page
// invite à revenir sur l'onglet de l'événement.
export function PaymentSignal({ result }: { result: string }) {
  useEffect(() => {
    try {
      const channel = new BroadcastChannel("giyax-payment");
      channel.postMessage({ type: "return", result });
      channel.close();
    } catch {
      // Navigateur sans BroadcastChannel : la vérification périodique prend le relais.
    }
    const t = setTimeout(() => window.close(), 1200);
    return () => clearTimeout(t);
  }, [result]);
  return null;
}
