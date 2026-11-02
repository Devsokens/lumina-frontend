"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, ExternalLink, ImagePlus, Loader2, Monitor, Smartphone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TenantContext } from "@/hooks/useTenant";
import { useAdminProducts } from "@/hooks/useMenu";
import { useSaveSite } from "@/hooks/useAdmin";
import { apiError } from "@/lib/api";
import { prepareImage } from "@/lib/image";
import {
  DAYS,
  FONT_INFO,
  LAYOUT_INFO,
  PALETTE_INFO,
  SITE_FONTS,
  SITE_MENU_LAYOUTS,
  SITE_PALETTES,
  normalizeSite,
  siteOf,
  type SiteConfig,
  type SiteSections,
} from "@/lib/site";
import { siteStyle } from "@/components/site/site-theme";
import { siteFontVariables } from "@/lib/site-fonts";
import { SiteHome } from "@/components/site/site-home";
import type { Tenant } from "@/types/api";

const SECTION_LABELS: Record<keyof SiteSections, string> = {
  featured: "Plats vedettes",
  about: "La maison (présentation)",
  gallery: "Galerie photos",
  hours: "Horaires et badge « ouvert »",
  location: "Adresse et itinéraire",
};

// Éditeur du site public (config.site) : réglages à gauche, aperçu réel à
// droite (mêmes composants que le site, avec le brouillon).
export function SiteEditor({ tenant }: { tenant: Tenant }) {
  const [site, setSite] = useState<SiteConfig>(() => siteOf(tenant));
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const save = useSaveSite();
  const set = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => setSite((s) => ({ ...s, [key]: value }));
  const preview: Tenant = { ...tenant, config: { ...tenant.config, site } };
  const publicUrl = `/${tenant.slug}`;

  async function publish() {
    try {
      await save.mutateAsync(normalizeSite(site));
      toast.success("Site publié.");
    } catch (err) {
      toast.error(apiError(err, "Échec de la publication."));
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,440px)_1fr]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold">Site & apparence</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={publicUrl} target="_blank">
                <ExternalLink className="size-4" /> Voir le site
              </Link>
            </Button>
            <Button size="sm" onClick={publish} disabled={save.isPending}>
              {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Publier
            </Button>
          </div>
        </div>

        <Panel title="Style">
          <Label>Couleur signature</Label>
          <div className="grid grid-cols-3 gap-2">
            {SITE_PALETTES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set("palette", p)}
                className={`flex items-center gap-2 rounded-xl border p-2 text-left text-sm ${site.palette === p ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
              >
                <span className="size-6 shrink-0 rounded-full" style={{ background: PALETTE_INFO[p].accent }} />
                {PALETTE_INFO[p].label}
              </button>
            ))}
          </div>
          <Choice
            label="Ambiance"
            value={site.mode}
            options={[
              { value: "clair", label: "Claire" },
              { value: "sombre", label: "Sombre (soirée)" },
            ]}
            onChange={(v) => set("mode", v)}
          />
          <Choice
            label="Typographie"
            value={site.font}
            options={SITE_FONTS.map((f) => ({ value: f, label: FONT_INFO[f].label }))}
            onChange={(v) => set("font", v)}
          />
          <Choice
            label="Présentation du menu"
            value={site.menuLayout}
            options={SITE_MENU_LAYOUTS.map((l) => ({ value: l, label: LAYOUT_INFO[l].label }))}
            onChange={(v) => set("menuLayout", v)}
          />
          <p className="text-sm text-muted-foreground">{LAYOUT_INFO[site.menuLayout].hint}</p>
        </Panel>

        <Panel title="Accueil">
          <ImageField label="Image de couverture" value={site.coverUrl} onChange={(v) => set("coverUrl", v)} />
          <Field label="Accroche au-dessus du nom" hint="ex. Cuisine gabonaise de saison" value={site.eyebrow} max={60} onChange={(v) => set("eyebrow", v)} />
          <Field label="Slogan" value={site.tagline} max={140} onChange={(v) => set("tagline", v)} />
          <Field label="Bandeau d'annonce" hint="ex. Brunch tous les dimanches dès 11 h" value={site.announcement} max={140} onChange={(v) => set("announcement", v)} />
          <p className="text-sm text-muted-foreground">
            Logo, téléphone et adresse : <Link href="settings" className="underline">Paramètres</Link>.
          </p>
        </Panel>

        <Panel title="Sections affichées">
          {(Object.keys(SECTION_LABELS) as (keyof SiteSections)[]).map((k) => (
            <div key={k} className="flex items-center justify-between gap-3">
              <Label htmlFor={`sec-${k}`} className="text-base font-normal">{SECTION_LABELS[k]}</Label>
              <Switch
                id={`sec-${k}`}
                checked={site.sections[k]}
                onCheckedChange={(v) => set("sections", { ...site.sections, [k]: v })}
              />
            </div>
          ))}
        </Panel>

        <FeaturedPicker value={site.featuredProductIds} onChange={(v) => set("featuredProductIds", v)} />

        <Panel title="La maison">
          <Field label="Titre" value={site.aboutTitle} max={120} onChange={(v) => set("aboutTitle", v)} />
          <div className="space-y-1.5">
            <Label htmlFor="about">Votre histoire</Label>
            <Textarea id="about" rows={6} maxLength={1500} value={site.aboutText} onChange={(e) => set("aboutText", e.target.value)} />
          </div>
          <ImageField label="Photo (chef, salle…)" value={site.aboutImageUrl} onChange={(v) => set("aboutImageUrl", v)} />
        </Panel>

        <Panel title={`Galerie (${site.gallery.length}/6)`}>
          <div className="grid grid-cols-3 gap-2">
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
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            {site.gallery.length < 6 && (
              <ImagePicker onPick={(v) => set("gallery", [...site.gallery, v].slice(0, 6))} className="aspect-square" />
            )}
          </div>
        </Panel>

        <Panel title="Horaires">
          {site.hours.map((h, i) => (
            <div key={h.day} className="flex items-center gap-2">
              <Switch
                checked={h.open}
                aria-label={`${DAYS[h.day]} ouvert`}
                onCheckedChange={(v) => set("hours", site.hours.map((x, j) => (j === i ? { ...x, open: v } : x)))}
              />
              <span className="w-24 text-sm">{DAYS[h.day]}</span>
              {h.open ? (
                <>
                  <Input type="time" value={h.from} className="w-28" aria-label={`${DAYS[h.day]} ouverture`}
                    onChange={(e) => set("hours", site.hours.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)))} />
                  <Input type="time" value={h.to} className="w-28" aria-label={`${DAYS[h.day]} fermeture`}
                    onChange={(e) => set("hours", site.hours.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)))} />
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Fermé</span>
              )}
            </div>
          ))}
        </Panel>

        <Panel title="Contact & réseaux">
          <Field label="WhatsApp (réservations)" hint="+241 77 12 34 56" value={site.whatsapp} max={30} onChange={(v) => set("whatsapp", v)} />
          <Field label="E-mail" value={site.email} max={120} onChange={(v) => set("email", v)} />
          <Field label="Lien Google Maps" hint="https://maps.app.goo.gl/…" value={site.mapsUrl} max={500} onChange={(v) => set("mapsUrl", v)} />
          <Field label="Instagram" hint="https://instagram.com/…" value={site.instagramUrl} max={300} onChange={(v) => set("instagramUrl", v)} />
          <Field label="Facebook" hint="https://facebook.com/…" value={site.facebookUrl} max={300} onChange={(v) => set("facebookUrl", v)} />
          <Field label="TikTok" hint="https://tiktok.com/@…" value={site.tiktokUrl} max={300} onChange={(v) => set("tiktokUrl", v)} />
          <p className="text-sm text-muted-foreground">Les liens doivent commencer par https://.</p>
        </Panel>
      </div>

      <div className="xl:sticky xl:top-4 xl:self-start">
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
          className={`mx-auto h-[78vh] overflow-y-auto rounded-3xl border-8 border-foreground/80 shadow-2xl ${device === "mobile" ? "max-w-[400px]" : "w-full"}`}
        >
          {/* Les liens de l'aperçu sont désactivés : on reste dans l'éditeur. */}
          <div style={siteStyle(site)} className={`${siteFontVariables} pointer-events-none min-h-full bg-background text-foreground [&_a]:pointer-events-none`}>
            <TenantContext.Provider value={preview}>
              <SiteHome />
            </TenantContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, hint, value, max, onChange }: { label: string; hint?: string; value: string; max: number; onChange: (v: string) => void }) {
  const id = `f-${label.replace(/\W+/g, "-")}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} maxLength={max} placeholder={hint} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-full border px-4 py-1.5 text-sm ${value === o.value ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ImagePicker({ onPick, className = "" }: { onPick: (dataUrl: string) => void; className?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary ${className}`}
      >
        {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
        Ajouter
      </button>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            onPick(await prepareImage(file));
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Image illisible.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {value ? (
        <div className="relative overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="aspect-video w-full object-cover" />
          <Button type="button" size="sm" variant="secondary" className="absolute right-2 top-2" onClick={() => onChange("")}>
            <Trash2 className="size-4" /> Retirer
          </Button>
        </div>
      ) : (
        <ImagePicker onPick={onChange} className="aspect-video w-full" />
      )}
    </div>
  );
}

function FeaturedPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const { data: products } = useAdminProducts();
  return (
    <Panel title={`Plats vedettes (${value.length}/6)`}>
      <p className="text-sm text-muted-foreground">
        Sans sélection, les 4 premiers articles avec photo sont mis en avant.
      </p>
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {(products ?? []).map((p) => {
          const on = value.includes(p.id);
          return (
            <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted">
              <input
                type="checkbox"
                checked={on}
                disabled={!on && value.length >= 6}
                onChange={() => onChange(on ? value.filter((id) => id !== p.id) : [...value, p.id])}
                className="size-4 accent-[var(--primary)]"
              />
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt="" className="size-9 rounded-md object-cover" />
              )}
              <span className="text-sm">{p.name}</span>
            </label>
          );
        })}
      </div>
    </Panel>
  );
}
