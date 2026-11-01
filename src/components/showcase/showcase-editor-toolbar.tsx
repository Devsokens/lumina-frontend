"use client";

import { useEffect, useRef } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Check,
  Globe,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Eye,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  showcaseContentOf,
  showcaseFromConfig,
  useShowcaseStore,
} from "@/stores/useShowcaseStore";
import { useSaveShowcase } from "@/hooks/useAdmin";
import { apiError } from "@/lib/api";
import { publicSiteLabel, publicSiteUrl } from "@/lib/tenant-url";
import { toast } from "sonner";

type ToolbarProps = {
  slug: string;
  tenantName: string;
  config: Record<string, unknown>;
};

export function ShowcaseEditorToolbar({ slug, tenantName, config }: ToolbarProps) {
  const {
    deviceView,
    setDeviceView,
    isEditingInline,
    setIsEditingInline,
    lastSavedAt,
  } = useShowcaseStore();
  const save = useSaveShowcase();
  const siteUrl = publicSiteUrl(slug);
  const { mutateAsync } = save;

  // Publication automatique : chaque modification est enregistrée sur le
  // serveur 2 s après la dernière saisie, et le site public la reprend.
  const published = useRef(JSON.stringify(showcaseContentOf(useShowcaseStore.getState())));
  useEffect(() => {
    let timer: number | undefined;
    const unsubscribe = useShowcaseStore.subscribe((state) => {
      const content = showcaseContentOf(state);
      const json = JSON.stringify(content);
      if (json === published.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        try {
          await mutateAsync(content);
          published.current = json;
          useShowcaseStore.setState({ isPublished: true, lastSavedAt: null });
        } catch (err) {
          toast.error(apiError(err, "Publication automatique impossible (images trop lourdes ?)"), {
            id: "showcase-autosave",
          });
        }
      }, 2000);
    });
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, [mutateAsync]);

  // Publication réelle : la vitrine est enregistrée sur le serveur et le site
  // public du compte l'affiche immédiatement.
  async function handlePublish() {
    try {
      const content = showcaseContentOf(useShowcaseStore.getState());
      await save.mutateAsync(content);
      published.current = JSON.stringify(content);
      useShowcaseStore.setState({ isPublished: true, lastSavedAt: null });
      toast.success(`Vitrine publiée sur ${publicSiteLabel(slug)}`);
    } catch (err) {
      toast.error(apiError(err, "Échec de la publication (images trop lourdes ?)"));
    }
  }

  // Annule les modifications non publiées : retour à la version en ligne.
  function handleReset() {
    if (confirm("Annuler les modifications non publiées ?")) {
      useShowcaseStore.setState({ ...showcaseFromConfig(config, tenantName), lastSavedAt: null });
      toast.info("Modifications annulées.");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
      {/* Left: Site Subdomain & Live Status */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Globe className="size-4.5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold text-foreground">
              Vitrine Officielle de l&apos;Organisation
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En ligne
            </span>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground">
            Portail : <strong className="text-foreground">{publicSiteLabel(slug)}</strong>
            {save.isPending
              ? " • Publication en cours…"
              : lastSavedAt
                ? ` • Publication automatique dans 2 s (${lastSavedAt})`
                : " • Publié automatiquement"}
          </p>
        </div>
      </div>

      {/* Center: Device View Switcher */}
      <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setDeviceView("desktop")}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            deviceView === "desktop"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Vue Ordinateur (Desktop)"
        >
          <Monitor className="size-3.5" />
          <span className="hidden sm:inline">Bureau</span>
        </button>

        <button
          type="button"
          onClick={() => setDeviceView("tablet")}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            deviceView === "tablet"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Vue Tablette"
        >
          <Tablet className="size-3.5" />
          <span className="hidden sm:inline">Tablette</span>
        </button>

        <button
          type="button"
          onClick={() => setDeviceView("mobile")}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            deviceView === "mobile"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Vue Smartphone (Mobile)"
        >
          <Smartphone className="size-3.5" />
          <span className="hidden sm:inline">Mobile</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Toggle Mode Edition Inline */}
        <Button
          type="button"
          variant={isEditingInline ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setIsEditingInline(!isEditingInline);
            toast.info(
              !isEditingInline
                ? "Mode Édition au Clic activé : cliquez sur n'importe quel texte pour le modifier !"
                : "Mode Prévisualisation acheteur activé."
            );
          }}
          className={`rounded-xl text-xs gap-1.5 ${
            isEditingInline ? "bg-amber-600 hover:bg-amber-500 text-white font-bold" : ""
          }`}
        >
          {isEditingInline ? <Edit3 className="size-3.5" /> : <Eye className="size-3.5" />}
          <span>{isEditingInline ? "Mode Édition Activé" : "Mode Aperçu"}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="rounded-xl text-xs text-muted-foreground hover:text-foreground"
          title="Réinitialiser"
        >
          <RotateCcw className="size-3.5" />
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={handlePublish}
          disabled={save.isPending}

          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-600/20"
        >
          <Check className="size-3.5" />
          <span>{save.isPending ? "Publication..." : "Publier"}</span>
        </Button>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-xl text-xs gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold"
        >
          <a href={siteUrl} target="_blank" rel="noreferrer">
            <span>Voir le site en ligne</span>
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
