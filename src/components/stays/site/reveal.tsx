"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Apparition au défilement. Sans effet si le thème est en motion « aucune »
// (le CSS de .stay-reveal ne s'applique qu'avec data-motion douce / vive).
export function Reveal({
  children,
  className,
  index = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  // Décalage en cascade (grilles).
  index?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement>(null);

  // Attribut posé directement sur le nœud : pas de re-rendu par élément.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.shown = "true";
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.shown = "true";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      style={{ "--i": Math.min(index, 8) } as React.CSSProperties}
      className={cn("stay-reveal", className)}
    >
      {children}
    </Tag>
  );
}
