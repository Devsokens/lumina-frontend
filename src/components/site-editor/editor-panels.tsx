"use client";

import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Check, Eye, EyeOff, GripVertical, ImagePlus, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { EvSoon } from "@/components/events/ev-ui";
import { SECTIONS, type SectionKey } from "@/components/site-editor/editor-model";
import {
  MODEL_LABELS,
  PALETTE_KEYS,
  TYPO_LABELS,
  contrastRatio,
  designPatch,
  paletteFor,
  palettesFor,
  type SiteColors,
  type SiteLook,
  type SiteModel,
  type SiteTypo,
} from "@/lib/event-site-theme";
import { FEATURES } from "@/lib/features";
import { prepareImage } from "@/lib/image";
import type { ShowcaseContent } from "@/stores/useShowcaseStore";
import type { SiteEvent } from "@/components/event-site/site-data";
import { cn } from "@/lib/utils";

type Update = (patch: Partial<ShowcaseContent>, key?: string) => void;

function PanelHead({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 pb-2.5 pt-4">
      <span className="text-sm font-semibold">{title}</span>
      {right}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="flex items-center gap-2 text-[13px] font-semibold text-ev-ink">{children}</span>;
}

// ---------- Sections (écran 19) ----------

export function SectionsPanel({
  content,
  update,
  selected,
  onSelect,
  page,
}: {
  content: ShowcaseContent;
  update: Update;
  selected: SectionKey | null;
  onSelect: (s: SectionKey) => void;
  page: string;
}) {
  const vis = content.visibleSections;
  return (
    <div className="flex h-full flex-col">
      <PanelHead title="Sections" right={<span className="text-xs text-ev-muted">{page === "home" ? "Accueil" : "Événement"}</span>} />
      <ol className="m-0 flex list-none flex-col gap-0.5 px-2 py-0">
        {SECTIONS.map((s) => {
          const cur = selected === s.key;
          const shown = !s.vis || vis?.[s.vis] !== false;
          return (
            <li
              key={s.key}
              className={cn(
                "flex h-10 items-center gap-2.5 rounded-[10px] px-2 text-[13px] transition-colors",
                cur ? "bg-ev-mint font-semibold text-ev-primary" : "font-medium text-ev-ink hover:bg-ev-soft",
                !shown && "opacity-55"
              )}
            >
              <GripVertical aria-hidden className="size-3.5 shrink-0 text-[#B9B5A9]" />
              <button type="button" onClick={() => onSelect(s.key)} className="flex h-full flex-1 items-center text-left">
                {s.label}
              </button>
              {s.vis ? (
                <button
                  type="button"
                  aria-label={`${shown ? "Masquer" : "Afficher"} ${s.label}`}
                  title={FEATURES.showcaseSections ? undefined : "Bientôt : masquer une section"}
                  disabled={!FEATURES.showcaseSections}
                  onClick={() => update({ visibleSections: { ...content.visibleSections!, [s.vis!]: !shown } }, `vis-${s.key}`)}
                  className={cn("flex size-[26px] items-center justify-center rounded-md disabled:cursor-not-allowed", cur ? "text-ev-primary" : "text-[#A8A497]")}
                >
                  {shown ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
              ) : (
                <span className="flex size-[26px] items-center justify-center text-[#A8A497]">
                  <Eye className="size-4" />
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <div className="px-4 py-3">
        <button
          type="button"
          disabled
          className="flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-[#B9CFC5] bg-[#F7FAF8] text-[13px] font-semibold text-ev-primary dark:bg-ev-soft"
        >
          <Plus className="size-4" /> Ajouter une section <EvSoon />
        </button>
      </div>
      <div className="mt-auto flex flex-col gap-2.5 border-t border-ev-line p-4">
        <span className="flex items-center gap-2 text-xs font-semibold text-ev-muted">
          BIBLIOTHÈQUE <EvSoon />
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {["Témoignages", "Partenaires", "Équipe", "Vidéo", "Chiffres clés", "Compte à rebours"].map((b) => (
            <span key={b} className="cursor-not-allowed rounded-[8px] bg-ev-bg p-2 text-ev-ink2 opacity-80">
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Thème (écran 20) ----------

const TYPO_FONT: Record<SiteTypo, string> = {
  expressive: "var(--font-es-bricolage)",
  moderne: "var(--font-es-manrope)",
  elegante: "var(--font-es-fraunces)",
  audacieuse: "var(--font-es-unbounded)",
};

function ModelThumb({ model }: { model: SiteModel }) {
  return model === "nuit" ? (
    <div className="flex h-[78px] flex-col gap-1.5 rounded-[8px] bg-[#0E0C0A] p-2.5">
      <span className="h-1.5 w-3/5 rounded-full bg-white/85" />
      <span className="h-1.5 w-2/5 rounded-full bg-[#F5B83D]" />
      <span className="mt-auto h-2.5 w-1/3 rounded-full bg-[#F5B83D]" />
    </div>
  ) : (
    <div className="flex h-[78px] flex-col overflow-hidden rounded-[8px] border border-ev-line bg-white">
      <div className="flex h-[44px] items-start bg-[#2B2E33] p-2.5">
        <span className="h-1.5 w-3/5 rounded-full bg-white/90" />
      </div>
      <div className="flex gap-1.5 p-2">
        <span className="h-3 flex-1 rounded bg-[#EDEDEA]" />
        <span className="h-3 flex-1 rounded bg-[#EDEDEA]" />
      </div>
    </div>
  );
}

export function ThemePanel({ content, update, look }: { content: ShowcaseContent; update: Update; look: SiteLook }) {
  const palettes = palettesFor(look.model);
  const p = paletteFor(look);
  const ok = contrastRatio(p.text, p.bg) >= 4.5;
  const logoInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [extracting, setExtracting] = useState(false);

  // Toute modification d'apparence passe par design (+ anciens champs).
  const apply = (next: Partial<SiteLook>, key: string) => update(designPatch({ ...look, ...next }, content.design), key);

  function setModel(model: SiteModel) {
    if (model === look.model) return;
    apply({ model, typo: model === "lumiere" ? "moderne" : "expressive", palette: look.palette === "custom" ? "custom" : "amber" }, "model");
  }

  function setColor(key: keyof SiteColors, hex: string) {
    const base: SiteColors = look.colors ?? { accent: p.accent, background: p.bg, text: p.text };
    apply({ palette: "custom", colors: { ...base, [key]: hex } }, `color-${key}`);
  }

  // Couleurs tirées du logo : teinte dominante la plus vive (hors blanc,
  // noir et gris) comme accent ; fond et texte du modèle choisi.
  async function fromLogo() {
    const src = content.orgLogoUrl;
    if (!src) return void toast.info("Ajoutez d'abord votre logo (ci-dessous).");
    setExtracting(true);
    try {
      const accent = await dominantColor(src);
      if (!accent) return void toast.error("Couleur introuvable dans ce logo.");
      const base = palettesFor(look.model).amber;
      apply({ palette: "custom", colors: { accent, background: base.bg, text: base.text } }, "logo-colors");
      toast.success("Couleurs appliquées depuis votre logo.");
    } catch {
      toast.error("Logo illisible pour l'analyse des couleurs.");
    } finally {
      setExtracting(false);
    }
  }

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setBusy(true);
    prepareImage(file, 512)
      .then((url) => update({ orgLogoUrl: url }, "logo"))
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Image illisible."))
      .finally(() => {
        input.value = "";
        setBusy(false);
      });
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PanelHead
        title="Thème"
        right={
          <button
            type="button"
            onClick={() => apply({ palette: "amber", colors: undefined, typo: look.model === "lumiere" ? "moderne" : "expressive", radius: "arrondis" }, "reset-theme")}
            className="text-xs text-ev-muted hover:text-ev-ink"
          >
            Réinitialiser
          </button>
        }
      />
      <div className="-mt-3 flex flex-col gap-2 px-4">
        <Label>Modèle</Label>
        <div className="grid grid-cols-2 gap-2.5">
          {(["nuit", "lumiere"] as SiteModel[]).map((m) => {
            const cur = look.model === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={cur}
                onClick={() => setModel(m)}
                className={cn("flex flex-col gap-2 rounded-[12px] p-1.5 pb-2 text-left transition-colors", cur ? "border-2 border-ev-primary" : "border border-ev-border hover:border-ev-dash")}
              >
                <ModelThumb model={m} />
                <span className="flex items-center justify-between px-1 text-[13px] font-semibold">
                  {MODEL_LABELS[m]}
                  {cur && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-ev-primary text-white">
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => void fromLogo()}
        disabled={extracting}
        className="mx-4 flex items-center gap-3 rounded-[12px] border border-ev-border bg-ev-selected p-3.5 text-left transition-colors hover:border-ev-primary disabled:opacity-70"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-ev-primary text-white">
          {extracting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-ev-primary">Créer mon thème depuis le logo</span>
          <span className="text-xs text-ev-ink2">Couleur d&apos;accent tirée de votre logo</span>
        </span>
      </button>

      <div className="flex flex-col gap-2.5 px-4">
        <Label>Palette</Label>
        <div className="grid grid-cols-5 gap-2">
          {PALETTE_KEYS.map((k) => {
            const pal = palettes[k];
            const cur = look.palette === k;
            return (
              <button
                key={k}
                type="button"
                aria-label={pal.name}
                aria-pressed={cur}
                title={pal.name}
                onClick={() => apply({ palette: k, colors: undefined }, "palette")}
                className={cn("flex h-11 overflow-hidden rounded-[10px]", cur ? "shadow-[0_0_0_2px_#fff,0_0_0_4px_var(--ev-primary)]" : "shadow-[inset_0_0_0_1px_rgba(0,0,0,.1)]")}
              >
                <span className="flex-1" style={{ background: pal.bg }} />
                <span className="flex-1" style={{ background: pal.accent }} />
              </button>
            );
          })}
        </div>
        {(
          [
            ["accent", "Accent", p.accent],
            ["background", "Fond", p.bg],
            ["text", "Texte", p.text],
          ] as const
        ).map(([key, label, hex]) => (
          <label key={key} className="flex h-[42px] cursor-pointer items-center gap-3 rounded-[10px] border border-ev-border px-2.5 hover:border-ev-dash">
            <span className="relative size-[22px] shrink-0 overflow-hidden rounded-[6px] shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]" style={{ background: hex }}>
              <input type="color" value={hex.toLowerCase()} onChange={(e) => setColor(key, e.target.value.toUpperCase())} aria-label={`Couleur ${label}`} className="absolute inset-0 cursor-pointer opacity-0" />
            </span>
            <span className="flex-1 text-[13px]">{label}</span>
            <span className="rounded-[6px] bg-ev-bg px-2 py-1 font-ev-mono text-xs">{hex.toUpperCase()}</span>
          </label>
        ))}
        <span className={cn("flex items-center gap-1.5 text-xs", ok ? "text-ev-ok" : "text-ev-gold-text")}>
          <Check className="size-3.5" />
          {ok ? "Lisibilité vérifiée : contraste texte / fond suffisant" : "Contraste faible entre le texte et le fond : choisissez des couleurs plus éloignées"}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 px-4">
        <Label>Typographie</Label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(TYPO_LABELS) as SiteTypo[]).map((t) => {
            const cur = look.typo === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={cur}
                onClick={() => apply({ typo: t }, "typo")}
                className={cn("flex flex-col items-start gap-1 rounded-[12px] px-3 py-2.5 text-left", cur ? "border-2 border-ev-primary bg-ev-selected" : "border border-ev-border hover:border-ev-dash")}
              >
                <span className="text-[22px] font-extrabold leading-none" style={{ fontFamily: TYPO_FONT[t] }}>
                  Aa
                </span>
                <span className="text-xs text-ev-muted">{TYPO_LABELS[t]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-4">
        <Label>Arrondis</Label>
        <div role="radiogroup" aria-label="Arrondis" className="grid grid-cols-3 rounded-[10px] bg-[#F1EFE9] p-[3px] dark:bg-ev-line">
          {(
            [
              ["droits", "Droits"],
              ["doux", "Doux"],
              ["arrondis", "Arrondis"],
            ] as const
          ).map(([r, label]) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={look.radius === r}
              onClick={() => apply({ radius: r }, "radius")}
              className={cn("flex h-[30px] items-center justify-center rounded-[8px] text-[13px]", look.radius === r ? "bg-ev-surface font-semibold" : "text-ev-ink3 hover:text-ev-ink")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-4">
        <Label>Logo et icône</Label>
        <div className="grid grid-cols-2 gap-2">
          <input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onLogo} />
          <button
            type="button"
            onClick={() => logoInput.current?.click()}
            disabled={busy}
            className="flex h-[88px] flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[12px] border border-dashed border-ev-dash text-xs text-ev-muted hover:border-ev-primary"
          >
            {content.orgLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={content.orgLogoUrl} alt="Logo" className="max-h-12 max-w-[80%] object-contain" />
            ) : (
              <ImagePlus className="size-5" />
            )}
            {busy ? "Envoi…" : content.orgLogoUrl ? "Remplacer le logo" : "Ajouter un logo"}
          </button>
          <span className="flex h-[88px] cursor-not-allowed flex-col items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-ev-dash text-xs text-ev-muted opacity-70">
            <ImagePlus className="size-5" />
            Icône du site <EvSoon />
          </span>
        </div>
        {content.orgLogoUrl && (
          <button type="button" onClick={() => update({ orgLogoUrl: null }, "logo")} className="self-start text-xs text-ev-muted hover:text-ev-danger">
            Retirer le logo
          </button>
        )}
      </div>
    </div>
  );
}

// Couleur dominante la plus saturée d'une image (canvas réduit à 48 px).
function dominantColor(src: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 48;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const buckets = new Map<string, { n: number; r: number; g: number; b: number; sat: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
          if (a < 200) continue;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          if (sat < 0.25 || max < 40 || min > 230) continue;
          const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
          const cur = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0, sat: 0 };
          buckets.set(key, { n: cur.n + 1, r: cur.r + r, g: cur.g + g, b: cur.b + b, sat: cur.sat + sat });
        }
        let best: { n: number; r: number; g: number; b: number; sat: number } | null = null;
        for (const v of buckets.values()) if (!best || v.n * (v.sat / v.n) > best.n * (best.sat / best.n)) best = v;
        if (!best) return resolve(null);
        const hex = (v: number) => Math.round(v / best!.n).toString(16).padStart(2, "0");
        resolve(`#${hex(best.r)}${hex(best.g)}${hex(best.b)}`.toUpperCase());
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

// ---------- Pages ----------

export function PagesPanel({ events, page, onPage }: { events: SiteEvent[]; page: string; onPage: (p: string) => void }) {
  const item = (key: string, label: string, sub?: string) => (
    <button
      key={key}
      type="button"
      onClick={() => onPage(key)}
      className={cn("flex flex-col gap-0.5 rounded-[10px] px-3 py-2.5 text-left", page === key ? "bg-ev-mint text-ev-primary" : "hover:bg-ev-soft")}
    >
      <span className="text-[13px] font-semibold">{label}</span>
      {sub && <span className="text-xs text-ev-muted">{sub}</span>}
    </button>
  );
  return (
    <div className="flex flex-col gap-1 pb-6">
      <PanelHead title="Pages" />
      <div className="flex flex-col gap-1 px-2">{item("home", "Accueil", "Page principale du site")}</div>
      <span className="px-4 pb-1 pt-4 text-xs font-semibold text-ev-muted">PAGES D&apos;ÉVÉNEMENT</span>
      <div className="flex flex-col gap-1 px-2">
        {events.length === 0 ? (
          <span className="px-3 text-xs text-ev-muted">Aucun événement en vente : publiez-en un depuis Mes événements.</span>
        ) : (
          events.map((e) => item(e.id, e.title, `${e.day} ${e.month.toLowerCase()}. · ${e.category}`))
        )}
      </div>
      <div className="px-4 pt-4">
        <span className="flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-ev-dash text-[13px] font-semibold text-ev-muted">
          <Plus className="size-4" /> Ajouter une page <EvSoon />
        </span>
      </div>
    </div>
  );
}

// ---------- Médias ----------

export function MediaPanel({ content, update }: { content: ShowcaseContent; update: Update }) {
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const gallery = content.galleryImages ?? [];

  function pick(kind: "cover" | "gallery", e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = Array.from(input.files ?? []).slice(0, kind === "cover" ? 1 : 12 - gallery.length);
    if (!files.length) return;
    setBusy(kind);
    Promise.all(files.map((f) => prepareImage(f, 1600)))
      .then((urls) => (kind === "cover" ? update({ orgCoverUrl: urls[0] }, "cover") : update({ galleryImages: [...gallery, ...urls].slice(0, 12) }, "gallery")))
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Image illisible."))
      .finally(() => {
        input.value = "";
        setBusy(null);
      });
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PanelHead title="Médias" />
      <div className="-mt-3 flex flex-col gap-2.5 px-4">
        <Label>Photo de couverture</Label>
        <span className="text-xs text-ev-muted">En haut de l&apos;accueil et dans la présentation.</span>
        <input ref={coverInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick("cover", e)} />
        <button
          type="button"
          onClick={() => coverInput.current?.click()}
          className="relative flex h-[120px] items-center justify-center overflow-hidden rounded-[12px] border border-dashed border-ev-dash text-xs text-ev-muted hover:border-ev-primary"
        >
          {content.orgCoverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.orgCoverUrl} alt="Couverture" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1.5">
              <ImagePlus className="size-5" />
              {busy === "cover" ? "Envoi…" : "Ajouter une photo"}
            </span>
          )}
        </button>
        {content.orgCoverUrl && (
          <div className="flex gap-3 text-xs">
            <button type="button" onClick={() => coverInput.current?.click()} className="font-semibold text-ev-primary">
              Remplacer
            </button>
            <button type="button" onClick={() => update({ orgCoverUrl: "" }, "cover")} className="text-ev-muted hover:text-ev-danger">
              Retirer
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 px-4">
        <Label>Souvenirs · {gallery.length} / 12</Label>
        <span className="text-xs text-ev-muted">Photos de vos événements passés.</span>
        <input ref={galleryInput} type="file" multiple accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick("gallery", e)} />
        <div className="grid grid-cols-3 gap-1.5">
          {gallery.map((src, i) => (
            <div key={`${i}-${src.slice(-12)}`} className="group relative aspect-square overflow-hidden rounded-[8px] bg-ev-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label="Retirer cette photo"
                onClick={() => update({ galleryImages: gallery.filter((_, j) => j !== i) }, "gallery")}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
          {gallery.length < 12 && (
            <button
              type="button"
              onClick={() => galleryInput.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[8px] border border-dashed border-ev-dash text-[11px] text-ev-muted hover:border-ev-primary"
            >
              <Plus className="size-4" />
              {busy === "gallery" ? "Envoi…" : "Ajouter"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
