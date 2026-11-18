"use client";

import { useEffect, useRef, useState } from "react";
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
  // Turnstile demande une action (case à cocher) : on le dit clairement.
  const [interactive, setInteractive] = useState(false);

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
        // Nouvelle tentative et renouvellement du jeton expiré, sans action.
        retry: "auto",
        "refresh-expired": "auto",
        callback: (t: string) => {
          setInteractive(false);
          setTurnstileToken(t);
        },
        "expired-callback": () => setTurnstileToken(null),
        "before-interactive-callback": () => setInteractive(true),
        "after-interactive-callback": () => setInteractive(false),
        // Erreur (réseau coupé…) : nouvel essai au bout de quelques secondes.
        "error-callback": () => {
          setTurnstileToken(null);
          setTimeout(() => {
            if (id && !cancelled && window.turnstile) window.turnstile.reset(id);
          }, 3000);
          return true;
        },
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
  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      {interactive && <p className="m-0 text-center text-[13px] font-medium text-amber-600">Cochez la case ci-dessous pour confirmer que vous n&apos;êtes pas un robot.</p>}
      <div ref={box} className="flex justify-center empty:hidden" />
    </div>
  );
}
