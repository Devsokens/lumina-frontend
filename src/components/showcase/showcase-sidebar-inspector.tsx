"use client";

import {
  Palette,
  Type,
  Image as ImageIcon,
  Ticket,
  Music,
  Phone,
  Sparkles,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { useShowcaseStore, type ShowcaseTheme } from "@/stores/useShowcaseStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const THEMES: { id: ShowcaseTheme; name: string; gradient: string; accent: string }[] = [
  {
    id: "amber",
    name: "Ambre Solaire (Afro Vibes)",
    gradient: "from-amber-500 to-orange-600",
    accent: "bg-amber-500",
  },
  {
    id: "emerald",
    name: "Émeraude & Forêt Équatoriale",
    gradient: "from-emerald-500 to-teal-700",
    accent: "bg-emerald-500",
  },
  {
    id: "electric",
    name: "Nuit Électrique & Cyber DJ",
    gradient: "from-cyan-500 to-blue-600",
    accent: "bg-cyan-500",
  },
  {
    id: "ruby",
    name: "Rubis & Soirée VIP Prestige",
    gradient: "from-rose-500 to-purple-600",
    accent: "bg-rose-500",
  },
  {
    id: "dark",
    name: "Noir Onyx Minimaliste",
    gradient: "from-zinc-700 to-zinc-950",
    accent: "bg-zinc-800",
  },
];

const FONTS = ["Outfit", "Syne", "Inter", "Plus Jakarta Sans"] as const;

export function ShowcaseSidebarInspector() {
  const {
    theme,
    setTheme,
    fontFamily,
    setFontFamily,
    activeInspectorTab,
    setActiveInspectorTab,
    siteTitle,
    tagline,
    heroHeadline,
    heroSubheadline,
    eventDate,
    eventTime,
    eventLocation,
    ctaText,
    coverImageUrl,
    whatsappNumber,
    instagramHandle,
    tickets,
    artists,
    updateField,
    updateTicket,
    updateArtist,
  } = useShowcaseStore();

  return (
    <div className="w-full lg:w-80 shrink-0 rounded-3xl border border-border bg-card p-4 shadow-xs flex flex-col gap-4">
      {/* Inspector Tab Buttons */}
      <div className="grid grid-cols-5 gap-1 rounded-2xl bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setActiveInspectorTab("theme")}
          className={`flex flex-col items-center justify-center rounded-xl p-2 text-[10px] font-semibold transition-all ${
            activeInspectorTab === "theme"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Thème & Couleurs"
        >
          <Palette className="size-4 mb-1" />
          <span>Style</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInspectorTab("content")}
          className={`flex flex-col items-center justify-center rounded-xl p-2 text-[10px] font-semibold transition-all ${
            activeInspectorTab === "content"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Textes & Hero"
        >
          <Type className="size-4 mb-1" />
          <span>Textes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInspectorTab("tickets")}
          className={`flex flex-col items-center justify-center rounded-xl p-2 text-[10px] font-semibold transition-all ${
            activeInspectorTab === "tickets"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Billetterie & Prix"
        >
          <Ticket className="size-4 mb-1" />
          <span>Pass</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInspectorTab("lineup")}
          className={`flex flex-col items-center justify-center rounded-xl p-2 text-[10px] font-semibold transition-all ${
            activeInspectorTab === "lineup"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Lineup & Artistes"
        >
          <Music className="size-4 mb-1" />
          <span>Artistes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInspectorTab("contact")}
          className={`flex flex-col items-center justify-center rounded-xl p-2 text-[10px] font-semibold transition-all ${
            activeInspectorTab === "contact"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="WhatsApp & Contact"
        >
          <Phone className="size-4 mb-1" />
          <span>Contact</span>
        </button>
      </div>

      {/* Tab 1: Theme & Style */}
      {activeInspectorTab === "theme" && (
        <div className="space-y-4 text-xs">
          <div>
            <Label className="text-xs font-bold text-foreground mb-2 block">
              Palette de couleurs du festival
            </Label>
            <div className="space-y-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`flex w-full items-center justify-between rounded-xl border p-2.5 transition-all text-left ${
                    theme === t.id
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`size-4.5 rounded-full bg-gradient-to-r ${t.gradient} shadow-xs`}
                    />
                    <span className="font-semibold text-foreground text-xs">{t.name}</span>
                  </div>
                  {theme === t.id && (
                    <span className="text-[10px] font-bold text-primary">Actif</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <Label className="text-xs font-bold text-foreground mb-2 block">
              Typographie des titres
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => setFontFamily(font)}
                  className={`rounded-xl border p-2 text-xs font-semibold transition-all text-center ${
                    fontFamily === font
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:bg-muted/40"
                  }`}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Content & Hero */}
      {activeInspectorTab === "content" && (
        <div className="space-y-3.5 text-xs max-h-[600px] overflow-y-auto pr-1">
          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Nom de l&apos;événement</Label>
            <Input
              value={siteTitle}
              onChange={(e) => updateField("siteTitle", e.target.value)}
              className="h-8.5 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Grand Titre Hero</Label>
            <Input
              value={heroHeadline}
              onChange={(e) => updateField("heroHeadline", e.target.value)}
              className="h-8.5 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Slogan & Description</Label>
            <Textarea
              value={heroSubheadline}
              onChange={(e) => updateField("heroSubheadline", e.target.value)}
              rows={2}
              className="text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Date & Horaires</Label>
            <Input
              value={eventDate}
              onChange={(e) => updateField("eventDate", e.target.value)}
              className="h-8.5 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Lieu & Ville</Label>
            <Input
              value={eventLocation}
              onChange={(e) => updateField("eventLocation", e.target.value)}
              className="h-8.5 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Texte du Bouton d&apos;Achat (CTA)</Label>
            <Input
              value={ctaText}
              onChange={(e) => updateField("ctaText", e.target.value)}
              className="h-8.5 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Image d&apos;affiche / Flyer (URL)</Label>
            <Input
              value={coverImageUrl}
              onChange={(e) => updateField("coverImageUrl", e.target.value)}
              className="h-8.5 text-xs rounded-xl font-mono"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Tickets */}
      {activeInspectorTab === "tickets" && (
        <div className="space-y-3 text-xs max-h-[600px] overflow-y-auto pr-1">
          <p className="text-muted-foreground text-[11px]">
            Modifiez les prix en FCFA et descriptions des pass en direct.
          </p>

          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-border bg-muted/20 p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-xs">{t.name}</span>
                <span className="font-mono font-extrabold text-primary">
                  {t.price.toLocaleString("fr-FR")} FCFA
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Prix FCFA</Label>
                  <Input
                    type="number"
                    value={t.price}
                    onChange={(e) =>
                      updateTicket(t.id, { price: Number(e.target.value) })
                    }
                    className="h-7 text-xs rounded-lg font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Places restantes</Label>
                  <Input
                    type="number"
                    value={t.stockLeft}
                    onChange={(e) =>
                      updateTicket(t.id, { stockLeft: Number(e.target.value) })
                    }
                    className="h-7 text-xs rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Lineup & Artists */}
      {activeInspectorTab === "lineup" && (
        <div className="space-y-3 text-xs max-h-[600px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-semibold">
              Artistes & Programme
            </span>
          </div>

          {artists.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-border bg-muted/20 p-3 space-y-2"
            >
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Nom de l&apos;artiste</Label>
                <Input
                  value={a.name}
                  onChange={(e) => updateArtist(a.id, { name: e.target.value })}
                  className="h-7 text-xs rounded-lg font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Rôle / Genre</Label>
                  <Input
                    value={a.role}
                    onChange={(e) => updateArtist(a.id, { role: e.target.value })}
                    className="h-7 text-xs rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Jour & Heure</Label>
                  <Input
                    value={a.time}
                    onChange={(e) => updateArtist(a.id, { time: e.target.value })}
                    className="h-7 text-xs rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Contact & WhatsApp */}
      {activeInspectorTab === "contact" && (
        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Numéro WhatsApp Billetterie</Label>
            <Input
              value={whatsappNumber}
              onChange={(e) => updateField("whatsappNumber", e.target.value)}
              className="h-8.5 text-xs rounded-xl font-mono"
              placeholder="+241..."
            />
            <p className="text-[10px] text-muted-foreground">
              Bouton WhatsApp flottant pour les clients souhaitant commander via agent.
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold">Instagram Officiel</Label>
            <Input
              value={instagramHandle}
              onChange={(e) => updateField("instagramHandle", e.target.value)}
              className="h-8.5 text-xs rounded-xl"
              placeholder="@festival..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
