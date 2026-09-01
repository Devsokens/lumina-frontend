"use client";

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
import { useShowcaseStore } from "@/stores/useShowcaseStore";
import { toast } from "sonner";
import Link from "next/link";

export function ShowcaseEditorToolbar() {
  const {
    deviceView,
    setDeviceView,
    isEditingInline,
    setIsEditingInline,
    publishShowcase,
    resetToDefaults,
    lastSavedAt,
  } = useShowcaseStore();

  function handlePublish() {
    publishShowcase();
    toast.success("Vitrine publiée avec succès sur festivalurban.giya.ga !");
  }

  function handleReset() {
    if (confirm("Voulez-vous réinitialiser tous les textes et styles par défaut ?")) {
      resetToDefaults();
      toast.info("Modèle réinitialisé aux valeurs initiales.");
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
              Éditeur de Vitrine Publique
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En ligne
            </span>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground">
            URL : <strong className="text-foreground">festivalurban.giya.ga</strong>
            {lastSavedAt && ` • Enregistré à ${lastSavedAt}`}
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
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-600/20"
        >
          <Check className="size-3.5" />
          <span>Publier</span>
        </Button>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-xl text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10"
        >
          <Link href="/demo-event-tenant/event" target="_blank">
            <span>Voir le site</span>
            <ExternalLink className="size-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
