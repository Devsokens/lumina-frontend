"use client";

import { useEffect, useRef } from "react";
import { TURNSTILE_SCRIPT, TURNSTILE_SITE_KEY, onTurnstileConsumed, setTurnstileToken } from "@/lib/turnstile";
import { cn } from "@/lib/utils";

// Vérification anti-robot Cloudflare Turnstile, invisible sauf en cas de doute
// (« interaction-only »). À placer dans un formulaire dont l'envoi est
// protégé (voir lib/turnstile.ts). Sans clé de site : ne rend rien.

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi | null> | null = null;

function loadTurnstile(): Promise<TurnstileApi | null> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile ?? null);
    script.onerror = () => {
      loading = null;
      resolve(null);
    };
    document.head.appendChild(script);
  });
  return loading;
}

export function TurnstileWidget({ className }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !box.current) return;
    let id: string | null = null;
    let cancelled = false;
    const el = box.current;
    void loadTurnstile().then((api) => {
      if (!api || cancelled) return;
      id = api.render(el, {
        sitekey: TURNSTILE_SITE_KEY,
        appearance: "interaction-only",
        language: "fr",
        callback: (t: string) => setTurnstileToken(t),
        "expired-callback": () => setTurnstileToken(null),
        "error-callback": () => setTurnstileToken(null),
      });
    });
    const off = onTurnstileConsumed(() => {
      if (id && window.turnstile) window.turnstile.reset(id);
    });
    return () => {
      cancelled = true;
      off();
      setTurnstileToken(null);
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, []);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={box} className={cn("flex justify-center empty:hidden", className)} />;
}
