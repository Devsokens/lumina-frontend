"use client";

import { useEffect, useRef, useState } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Globe,
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { showcaseContentOf, useShowcaseStore } from "@/stores/useShowcaseStore";
import { useSaveShowcase } from "@/hooks/useAdmin";
import { apiError } from "@/lib/api";
import { publicSiteLabel, publicSiteUrl } from "@/lib/tenant-url";
import { toShowcasePayload } from "@/lib/showcase-payload";
import { ShowcaseAIGeneratorModal } from "./showcase-ai-generator-modal";
import { ShowcaseSettingsModal } from "./showcase-settings-modal";

type ToolbarProps = {
  slug: string;
  tenantName: string;
  config: Record<string, unknown>;
};

export function ShowcaseEditorToolbar({ slug }: ToolbarProps) {
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { deviceView, setDeviceView, lastSavedAt } = useShowcaseStore();
  const save = useSaveShowcase();
  const { mutateAsync } = save;
  const siteUrl = publicSiteUrl(slug);
  const siteLabel = publicSiteLabel(slug);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Publication automatique : chaque modification est enregistrée sur le
  // serveur 2 s après la dernière saisie, et le site public la reprend.
  const published = useRef(
    JSON.stringify(toShowcasePayload(showcaseContentOf(useShowcaseStore.getState()))),
  );
  useEffect(() => {
    let timer: number | undefined;
    const unsubscribe = useShowcaseStore.subscribe((state) => {
      const payload = toShowcasePayload(showcaseContentOf(state));
      const json = JSON.stringify(payload);
      window.clearTimeout(timer);
      if (json === published.current) {
        // Retour à la version en ligne : plus rien à publier.
        if (state.lastSavedAt) useShowcaseStore.setState({ lastSavedAt: null });
        return;
      }
      timer = window.setTimeout(async () => {
        try {
          await mutateAsync(payload);
          published.current = json;
          setPublishError(null);
          useShowcaseStore.setState({ isPublished: true, lastSavedAt: null });
        } catch (err) {
          setPublishError(apiError(err, "Publication impossible (images trop lourdes ?)"));
        }
      }, 2000);
    });
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, [mutateAsync]);

  const status = save.isPending
    ? "Publication en cours…"
    : publishError
      ? null
      : lastSavedAt
        ? `Publication automatique dans 2 s (${lastSavedAt})`
        : "Publié automatiquement";

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
      {/* Left: Site Subdomain & Live Status (Diminished & Truncated so it never overflows) */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 shrink-0">
          <Globe className="size-4.5 sm:size-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-xs sm:text-sm font-bold text-foreground truncate">
              Vitrine Officielle de l&apos;Organisation
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En ligne
            </span>
          </div>
          <p
            className="text-[10px] font-mono text-muted-foreground truncate max-w-[220px] sm:max-w-sm md:max-w-md"
            title={`${siteLabel}${status ? ` • ${status}` : ""}`}
          >
            Portail : <strong className="text-foreground font-semibold">{siteLabel}</strong>
            {status && ` • ${status}`}
          </p>
          {publishError && !save.isPending && (
            <p role="alert" className="text-[10px] font-semibold text-destructive truncate max-w-[260px] sm:max-w-md">
              Non publié : {publishError}
            </p>
          )}
        </div>
      </div>

      {/* Center & Right Controls Wrapper */}
      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 w-full lg:w-auto">
        {/* Device View Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/60 p-1">
          <button
            type="button"
            onClick={() => setDeviceView("desktop")}
            className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              deviceView === "desktop"
                ? "bg-background text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
            title="Vue Ordinateur (Desktop)"
          >
            <Monitor className={`size-3.5 sm:size-4 transition-colors ${deviceView === "desktop" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
            <span className="hidden sm:inline">Bureau</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceView("tablet")}
            className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              deviceView === "tablet"
                ? "bg-background text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
            title="Vue Tablette"
          >
            <Tablet className={`size-3.5 sm:size-4 transition-colors ${deviceView === "tablet" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
            <span className="hidden sm:inline">Tablette</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceView("mobile")}
            className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              deviceView === "mobile"
                ? "bg-background text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
            title="Vue Smartphone (Mobile)"
          >
            <Smartphone className={`size-3.5 sm:size-4 transition-colors ${deviceView === "mobile" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Action Buttons (Spaced gracefully and never overflowing) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bouton Générateur GiyaX AI (Taille compacte & Shimmer net sans flou) */}
          <Button
            type="button"
            size="sm"
            onClick={() => setIsAIGeneratorOpen(true)}
            className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold text-[11px] px-2.5 h-7.5 sm:h-8 gap-1 transition-all hover:scale-[1.02] active:scale-95 shadow-none"
          >
            {/* Rayon de lumière glissant net */}
            <span
              aria-hidden="true"
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-ai-shimmer"
            />
            <Sparkles className="size-3 fill-black text-black group-hover:rotate-45 transition-transform duration-300 relative z-10" />
            <span className="relative z-10 tracking-tight">Générer avec GiyaX AI</span>
          </Button>

          {/* Bouton Voir le site (site public réel du compte) */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="group rounded-xl text-xs px-3 h-8 sm:h-9 gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 font-bold transition-all"
          >
            <a href={siteUrl} target="_blank" rel="noreferrer" title={`Ouvrir ${siteLabel}`}>
              <span>Voir le site</span>
              <ExternalLink className="size-3.5 sm:size-4 text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </Button>

          {/* Bouton Paramétrage Vitrine (Extrême Droite) */}
          <Button
            type="button"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="group rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-700 dark:border-zinc-600 font-extrabold text-xs px-3.5 h-8 sm:h-9 gap-1.5 shadow-sm transition-all hover:border-amber-400 hover:shadow-amber-500/10"
          >
            <SlidersHorizontal className="size-3.5 sm:size-4 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
            <span>Paramétrage</span>
          </Button>
        </div>
      </div>

      {/* MODAL PARAMETRAGE VITRINE */}
      <ShowcaseSettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      {/* MODAL GENERATEUR GiyaX AI */}
      <ShowcaseAIGeneratorModal open={isAIGeneratorOpen} onOpenChange={setIsAIGeneratorOpen} />
    </div>
  );
}
