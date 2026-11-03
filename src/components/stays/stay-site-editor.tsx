"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, ExternalLink, Loader2, Monitor, Plus, Smartphone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Choice, Field, ImageField, ImagePicker, Panel } from "@/components/site/site-editor";
import { VitrineHeader } from "@/components/vitrine/header";
import { StaysHome } from "@/components/stays/stays-home";
import { TenantContext } from "@/hooks/useTenant";
import { useListings } from "@/hooks/useStays";
import { useSaveStaySite } from "@/hooks/useAdmin";
import { apiError } from "@/lib/api";
import { siteFontVariables } from "@/lib/site-fonts";
import {
  STAY_LAYOUTS,
  STAY_LAYOUT_INFO,
  STAY_MOTIONS,
  STAY_MOTION_INFO,
  STAY_PALETTES,
  STAY_PALETTE_INFO,
  STAY_TYPOGRAPHIES,
  STAY_TYPOGRAPHY_INFO,
  normalizeStaySite,
  staySiteOf,
  staySiteStyle,
  type StayLayout,
  type StaySiteConfig,
  type StaySiteSections,
} from "@/lib/stay-site";
import type { Tenant } from "@/types/api";
import { cn } from "@/lib/utils";

const SECTION_LABELS: Record<keyof StaySiteSections, string> = {
  highlights: "Points forts",
  featured: "Logements coups de cœur",
  about: "À propos (présentation)",
  gallery: "Galerie photos",
  contact: "Contact et réseaux",
};

// Éditeur du site hébergement (config.staySite) : réglages à gauche, aperçu
// réel à droite (mêmes composants que le site public, avec le brouillon).
export function StaySiteEditor({ tenant }: { tenant: Tenant }) {
  const [site, setSite] = useState<StaySiteConfig>(() => staySiteOf(tenant));
  const [device, setDevice] = useState<"mobile" | "desktop">("desktop");
  const save = useSaveStaySite();
  const set = <K extends keyof StaySiteConfig>(key: K, value: StaySiteConfig[K]) => setSite((s) => ({ ...s, [key]: value }));
  const preview: Tenant = { ...tenant, config: { ...tenant.config, staySite: site } };

  async function publish() {
    try {
      await save.mutateAsync(normalizeStaySite(site));
      toast.success("Site publié.");
    } catch (err) {
      toast.error(apiError(err, "Échec de la publication."));
    }
  }

  return (
    <div className={cn(siteFontVariables, "grid gap-6 2xl:grid-cols-[minmax(0,460px)_1fr]")}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold">Site & apparence</h1>
            <p className="text-sm text-muted-foreground">Votre vitrine de réservation, à votre image.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/${tenant.slug}`} target="_blank">
                <ExternalLink className="size-4" /> Voir le site
              </Link>
            </Button>
            <Button size="sm" onClick={publish} disabled={save.isPending}>
              {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Publier
            </Button>
          </div>
        </div>

        <Panel title="Disposition">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {STAY_LAYOUTS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => set("layout", l)}
                aria-pressed={site.layout === l}
                className={cn(
                  "rounded-2xl border p-2 text-left transition-all",
                  site.layout === l ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-foreground/30"
                )}
              >
                <LayoutThumb layout={l} />
                <span className="mt-2 block text-sm font-semibold">{STAY_LAYOUT_INFO[l].label}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{STAY_LAYOUT_INFO[site.layout].hint}</p>
        </Panel>

        <Panel title="Couleurs">
          <div className="grid grid-cols-2 gap-2">
            {STAY_PALETTES.map((p) => {
              const c = STAY_PALETTE_INFO[p];
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => set("palette", p)}
                  aria-pressed={site.palette === p}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-2 text-left text-sm",
                    site.palette === p ? "border-primary ring-2 ring-primary/30" : "border-border"
                  )}
                >
                  <span className="flex shrink-0 -space-x-2">
                    {[site.mode === "sombre" ? c.dark : c.light, c.accent2, c.accent].map((col, i) => (
                      <span key={i} className="size-6 rounded-full ring-2 ring-card" style={{ background: col }} />
                    ))}
                  </span>
                  {c.label}
                </button>
              );
            })}
          </div>
          <Choice
            label="Ambiance"
            value={site.mode}
            options={[
              { value: "clair", label: "Claire" },
              { value: "sombre", label: "Sombre" },
            ]}
            onChange={(v) => set("mode", v)}
          />
        </Panel>

        <Panel title="Typographie">
          <div className="grid grid-cols-2 gap-2">
            {STAY_TYPOGRAPHIES.map((t) => {
              const info = STAY_TYPOGRAPHY_INFO[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("typography", t)}
                  aria-pressed={site.typography === t}
                  className={cn(
                    "rounded-xl border p-3 text-left",
                    site.typography === t ? "border-primary ring-2 ring-primary/30" : "border-border"
                  )}
                >
                  <span className="block truncate text-xl leading-tight" style={{ fontFamily: info.display }}>
                    {info.label}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground" style={{ fontFamily: info.body }}>
                    {info.sample}
                  </span>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title="Animations">
          <Choice
            label="Intensité"
            value={site.motion}
            options={STAY_MOTIONS.map((m) => ({ value: m, label: STAY_MOTION_INFO[m] }))}
            onChange={(v) => set("motion", v)}
          />
          <p className="text-sm text-muted-foreground">
            Apparitions au défilement, lent zoom de la couverture (vive). Coupées automatiquement pour les
            visiteurs qui limitent les animations.
          </p>
        </Panel>

        <Panel title="Accueil">
          <ImageField label="Image de couverture" value={site.coverUrl} onChange={(v) => set("coverUrl", v)} />
          <Field label="Accroche" hint="ex. Villas en bord de mer" value={site.eyebrow} max={60} onChange={(v) => set("eyebrow", v)} />
          <Field label="Grand titre" hint={`Par défaut : ${tenant.name}`} value={site.headline} max={120} onChange={(v) => set("headline", v)} />
          <Field label="Sous-titre" value={site.tagline} max={200} onChange={(v) => set("tagline", v)} />
          <Field label="Bandeau d'annonce" hint="ex. -15 % dès 7 nuits" value={site.announcement} max={140} onChange={(v) => set("announcement", v)} />
        </Panel>

        <Panel title="Sections affichées">
          {(Object.keys(SECTION_LABELS) as (keyof StaySiteSections)[]).map((k) => (
            <div key={k} className="flex items-center justify-between gap-3">
              <Label htmlFor={`sec-${k}`} className="text-base font-normal">
                {SECTION_LABELS[k]}
              </Label>
              <Switch id={`sec-${k}`} checked={site.sections[k]} onCheckedChange={(v) => set("sections", { ...site.sections, [k]: v })} />
            </div>
          ))}
        </Panel>

        <Panel title={`Points forts (${site.highlights.length}/4)`}>
          {site.highlights.map((h, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-border p-3">
              <div className="flex gap-2">
                <Input
                  value={h.title}
                  maxLength={60}
                  placeholder="ex. Piscine à débordement"
                  aria-label={`Point fort ${i + 1}`}
                  onChange={(e) => set("highlights", site.highlights.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Retirer ce point fort"
                  onClick={() => set("highlights", site.highlights.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Input
                value={h.text}
                maxLength={160}
                placeholder="Détail (facultatif)"
                aria-label={`Détail du point fort ${i + 1}`}
                onChange={(e) => set("highlights", site.highlights.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
              />
            </div>
          ))}
          {site.highlights.length < 4 && (
            <Button type="button" variant="outline" size="sm" onClick={() => set("highlights", [...site.highlights, { title: "", text: "" }])}>
              <Plus className="size-4" /> Ajouter un point fort
            </Button>
          )}
        </Panel>

        <FeaturedPicker value={site.featuredListingIds} onChange={(v) => set("featuredListingIds", v)} />

        <Panel title="À propos">
          <Field label="Titre" value={site.aboutTitle} max={120} onChange={(v) => set("aboutTitle", v)} />
          <div className="space-y-1.5">
            <Label htmlFor="stay-about">Votre histoire</Label>
            <Textarea id="stay-about" rows={6} maxLength={1500} value={site.aboutText} onChange={(e) => set("aboutText", e.target.value)} />
          </div>
          <ImageField label="Photo (hôte, lieu…)" value={site.aboutImageUrl} onChange={(v) => set("aboutImageUrl", v)} />
        </Panel>

        <Panel title={`Galerie (${site.gallery.length}/8)`}>
          <div className="grid grid-cols-4 gap-2">
            {site.gallery.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  aria-label="Retirer la photo"
                  onClick={() => set("gallery", site.gallery.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
            {site.gallery.length < 8 && <ImagePicker onPick={(v) => set("gallery", [...site.gallery, v].slice(0, 8))} className="aspect-square" />}
          </div>
        </Panel>

        <Panel title="Contact & réseaux">
          <Field label="WhatsApp" hint="+241 77 12 34 56" value={site.whatsapp} max={30} onChange={(v) => set("whatsapp", v)} />
          <Field label="E-mail" value={site.email} max={120} onChange={(v) => set("email", v)} />
          <Field label="Lien Google Maps" hint="https://maps.app.goo.gl/…" value={site.mapsUrl} max={500} onChange={(v) => set("mapsUrl", v)} />
          <Field label="Instagram" hint="https://instagram.com/…" value={site.instagramUrl} max={300} onChange={(v) => set("instagramUrl", v)} />
          <Field label="Facebook" hint="https://facebook.com/…" value={site.facebookUrl} max={300} onChange={(v) => set("facebookUrl", v)} />
          <Field label="TikTok" hint="https://tiktok.com/@…" value={site.tiktokUrl} max={300} onChange={(v) => set("tiktokUrl", v)} />
          <p className="text-sm text-muted-foreground">
            Les liens doivent commencer par https://. Téléphone, adresse et logo :{" "}
            <Link href="settings" className="underline">
              Paramètres
            </Link>
            .
          </p>
        </Panel>
      </div>

      <div className="2xl:sticky 2xl:top-4 2xl:self-start">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Aperçu (non publié)</p>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <Button size="sm" variant={device === "mobile" ? "default" : "ghost"} onClick={() => setDevice("mobile")} aria-label="Aperçu mobile">
              <Smartphone className="size-4" />
            </Button>
            <Button size="sm" variant={device === "desktop" ? "default" : "ghost"} onClick={() => setDevice("desktop")} aria-label="Aperçu ordinateur">
              <Monitor className="size-4" />
            </Button>
          </div>
        </div>
        <div
          className={cn(
            "mx-auto h-[80vh] overflow-y-auto rounded-3xl border-8 border-foreground/80 shadow-2xl",
            device === "mobile" ? "max-w-[400px]" : "w-full"
          )}
        >
          {/* key : rejoue les animations d'entrée quand le style change.
              Liens désactivés : on reste dans l'éditeur. */}
          <div
            key={`${site.layout}-${site.motion}`}
            style={staySiteStyle(site)}
            data-motion={site.motion}
            className="pointer-events-none min-h-full bg-background text-foreground [&_a]:pointer-events-none"
          >
            <TenantContext.Provider value={preview}>
              <VitrineHeader />
              <StaysHome />
            </TenantContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}

// Croquis de chaque disposition (sélecteur).
function LayoutThumb({ layout }: { layout: StayLayout }) {
  const bar = "rounded-full bg-foreground/25";
  const img = "rounded-md bg-primary/35";
  return (
    <div className="flex aspect-[4/3] flex-col gap-1 overflow-hidden rounded-xl bg-muted p-1.5">
      {layout === "riviera" && (
        <>
          <div className={cn(img, "relative flex flex-1 flex-col items-center justify-center gap-1")}>
            <span className="h-1.5 w-3/5 rounded-full bg-white/80" />
            <span className="h-1 w-2/5 rounded-full bg-white/60" />
            <span className="absolute -bottom-1 h-2.5 w-4/5 rounded-full bg-card shadow" />
          </div>
          <div className="mt-1.5 grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn(img, "aspect-square opacity-70")} />
            ))}
          </div>
        </>
      )}
      {layout === "atelier" && (
        <div className="grid flex-1 grid-cols-2 gap-1.5">
          <div className="flex flex-col justify-center gap-1">
            <span className={cn(bar, "h-2 w-full")} />
            <span className={cn(bar, "h-2 w-4/5")} />
            <span className="h-1 w-3/5 rounded-full bg-foreground/15" />
          </div>
          <div className={cn(img, "rounded-xl")} />
        </div>
      )}
      {layout === "horizon" && (
        <>
          <div className={cn(img, "flex flex-1 flex-col justify-end gap-1 rounded-lg p-1.5")}>
            <span className="h-1.5 w-1/2 rounded-full bg-white/80" />
            <span className="h-1.5 w-1/4 rounded-full bg-card" />
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn(img, "h-5 w-1/3 shrink-0 opacity-70")} />
            ))}
          </div>
        </>
      )}
      {layout === "galerie" && (
        <>
          <span className={cn(bar, "h-1.5 w-1/2")} />
          <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-1">
            <span className={cn(img, "col-span-2 row-span-2")} />
            <span className={cn(img, "opacity-70")} />
            <span className={cn(img, "opacity-50")} />
          </div>
        </>
      )}
      {layout === "boutique" && (
        <div className="flex flex-1 flex-col items-center gap-1 pt-1">
          <span className={cn(bar, "h-2 w-3/4")} />
          <span className="h-px w-1/5 bg-primary" />
          <span className="h-1 w-1/2 rounded-full bg-foreground/15" />
          <span className={cn(img, "mt-auto h-1/2 w-3/4 rounded-b-none rounded-t-full")} />
        </div>
      )}
      {layout === "nomade" && (
        <>
          <div className="flex flex-1 flex-col justify-end gap-1 rounded-lg bg-foreground/85 p-1.5">
            <span className="h-2 w-4/5 rounded-sm bg-background/80" />
            <span className="h-2 w-1/2 rounded-sm bg-background/80" />
          </div>
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-1 border-b border-foreground/15 pb-0.5">
              <span className="h-1 w-2 rounded-full bg-foreground/30" />
              <span className={cn(bar, "h-1.5 flex-1")} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function FeaturedPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const { data: listings } = useListings();
  const published = (listings ?? []).filter((l) => l.status === "PUBLISHED");
  return (
    <Panel title={`Coups de cœur (${value.length}/6)`}>
      <p className="text-sm text-muted-foreground">Logements mis en avant en haut du site. Seuls les logements en ligne apparaissent.</p>
      {published.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun logement en ligne pour l&apos;instant.</p>
      ) : (
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {published.map((l) => {
            const on = value.includes(l.id);
            return (
              <label key={l.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted">
                <input
                  type="checkbox"
                  checked={on}
                  disabled={!on && value.length >= 6}
                  onChange={() => onChange(on ? value.filter((id) => id !== l.id) : [...value, l.id])}
                  className="size-4 accent-[var(--primary)]"
                />
                {l.photos[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.photos[0]} alt="" className="size-9 rounded-md object-cover" />
                )}
                <span className="truncate text-sm">{l.title}</span>
              </label>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
