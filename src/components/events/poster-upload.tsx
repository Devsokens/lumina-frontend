"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, Link2, Loader2, RefreshCw, Sparkles, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, uploadError, useUploadImage } from "@/hooks/useUpload";
import { aiError, isPlanLimited, useGenerateVisual } from "@/hooks/useAi";
import { PricingUpgradeModal } from "@/components/shared/pricing-upgrade-modal";
import { cn } from "@/lib/utils";
import type { EventType } from "@/types/api";

const AI_STYLES = [
  { id: "affiche-concert", label: "Affiche concert" },
  { id: "elegant", label: "Élégant / Gala" },
  { id: "afro-moderne", label: "Afro moderne" },
  { id: "corporate", label: "Corporate" },
  { id: "neon", label: "Néon / Club" },
  { id: "minimal", label: "Minimaliste" },
];

type Props = {
  value: string;
  onChange: (url: string) => void;
  eventTitle: string;
  eventType?: EventType;
};

// Affiche de l'événement : import (glisser-déposer ou parcourir), URL, ou
// génération IA. Seule une URL http(s) renvoyée par le serveur est
// enregistrée : jamais d'image en base64 dans l'événement.
export function PosterUpload({ value, onChange, eventTitle, eventType }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [aiStyle, setAiStyle] = useState(AI_STYLES[0].id);
  const [aiPrompt, setAiPrompt] = useState("");
  const upload = useUploadImage();
  const generate = useGenerateVisual();

  async function handleFile(file: File) {
    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error("Format non pris en charge : PNG, JPG ou WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image trop lourde (5 Mo maximum).");
      return;
    }
    setProgress(0);
    try {
      const url = await upload.mutateAsync({ file, onProgress: setProgress });
      onChange(url);
      toast.success("Affiche importée.");
    } catch (err) {
      toast.error(uploadError(err));
      setShowUrl(true);
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function applyUrl() {
    const url = urlDraft.trim();
    if (!/^https:\/\/\S+$/.test(url)) {
      toast.error("Saisissez une adresse d'image commençant par https://");
      return;
    }
    onChange(url);
    setUrlDraft("");
    setShowUrl(false);
  }

  async function handleGenerate() {
    if (!eventTitle.trim()) {
      toast.error("Saisissez d'abord le titre de l'événement.");
      return;
    }
    try {
      const url = await generate.mutateAsync({ title: eventTitle, eventType, style: aiStyle, prompt: aiPrompt || undefined });
      onChange(url);
      setAiOpen(false);
      toast.success("Visuel généré.");
    } catch (err) {
      if (isPlanLimited(err)) {
        setAiOpen(false);
        setUpgradeOpen(true);
      } else toast.error(aiError(err));
    }
  }

  const busy = progress !== null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="flex items-center gap-1.5 text-xs font-bold">
          <ImageIcon className="size-4 text-primary" /> Affiche de l&apos;événement
        </Label>
        <div className="flex gap-1.5">
          <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-[11px]" onClick={() => setShowUrl((v) => !v)}>
            <Link2 className="size-3.5" /> URL
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 rounded-xl border-secondary/50 bg-secondary/15 text-[11px] font-bold text-foreground hover:bg-secondary/30"
            onClick={() => setAiOpen(true)}
          >
            <Sparkles className="size-3.5" /> Générer avec l&apos;IA
          </Button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Affiche" className="h-52 w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/80 to-transparent p-3">
            <Button type="button" size="sm" variant="secondary" className="h-7 rounded-xl text-xs" onClick={() => inputRef.current?.click()} disabled={busy}>
              <RefreshCw className="size-3" /> Remplacer
            </Button>
            <Button type="button" size="sm" variant="destructive" className="h-7 rounded-xl text-xs" onClick={() => onChange("")}>
              <Trash2 className="size-3" /> Retirer
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !busy && inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && !busy && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file && !busy) void handleFile(file);
          }}
          className={cn(
            "cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all",
            dragging ? "border-primary bg-primary/15" : "border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10"
          )}
        >
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {busy ? <Loader2 className="size-6 animate-spin" /> : <Upload className="size-6" />}
          </div>
          <p className="text-xs font-bold">
            {busy ? `Envoi en cours… ${progress}%` : "Glissez votre affiche ici ou cliquez pour parcourir"}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">PNG, JPG ou WEBP, 5 Mo maximum. Format portrait conseillé.</p>
          {busy && (
            <div className="mx-auto mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}

      {showUrl && (
        <div className="flex gap-2">
          <Input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://… (adresse de l'image)"
            className="h-9 rounded-xl text-xs"
          />
          <Button type="button" size="sm" className="h-9 rounded-xl" onClick={applyUrl}>
            Utiliser
          </Button>
        </div>
      )}

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-secondary" /> Générer une affiche
            </DialogTitle>
            <DialogDescription>À partir du titre « {eventTitle || "…"} » et du style choisi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AI_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setAiStyle(s.id)}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-xs font-semibold",
                    aiStyle === s.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Précisions (facultatif)</Label>
              <Textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Couleurs, ambiance, éléments à faire apparaître…"
                className="resize-none text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAiOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleGenerate} disabled={generate.isPending}>
              {generate.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {generate.isPending ? "Génération…" : "Générer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PricingUpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} feature="AI_POSTER" />
    </div>
  );
}
