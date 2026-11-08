"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// L'IA « écrit » : le texte reçu apparaît caractère par caractère, avec un
// curseur. Durée adaptée à la longueur (0,6 à 2,8 s) pour rester vivante sans
// faire attendre. Mouvement réduit demandé par l'appareil : texte immédiat.

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function useTypewriter(text: string, { enabled = true, delay = 0 }: { enabled?: boolean; delay?: number } = {}) {
  const animate = enabled && !reducedMotion();
  const [state, setState] = useState({ text, count: animate ? 0 : text.length });
  // Nouveau texte : on repart de zéro (mise à jour pendant le rendu).
  if (state.text !== text) setState({ text, count: animate ? 0 : text.length });

  useEffect(() => {
    if (!animate || !text) return;
    const total = Math.min(2800, Math.max(600, text.length * 16));
    const start = performance.now() + delay;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, now - start) / total);
      const count = Math.round(p * text.length);
      setState((s) => (s.text === text && s.count !== count ? { text, count } : s));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, animate, delay]);

  const count = state.text === text ? state.count : animate ? 0 : text.length;
  return { shown: text.slice(0, count), done: count >= text.length };
}

export function Caret({ className }: { className?: string }) {
  return <span aria-hidden className={cn("giyax-caret ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] rounded-full bg-current align-baseline", className)} />;
}

// Texte écrit par l'IA. Les lecteurs d'écran reçoivent le texte complet.
export function TypewriterText({
  text,
  className,
  enabled = true,
  delay = 0,
  onDone,
  render,
}: {
  text: string;
  className?: string;
  enabled?: boolean;
  delay?: number;
  onDone?: () => void;
  // Mise en forme du texte partiel (gras, listes…).
  render?: (shown: string) => React.ReactNode;
}) {
  const { shown, done } = useTypewriter(text, { enabled, delay });
  useEffect(() => {
    if (done) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {render ? render(shown) : shown}
        {!done && <Caret />}
      </span>
    </span>
  );
}
