"use client";

import {
  Palette,
  Type,
  Ticket,
  Phone,
  Sparkles,
  Building,
  Calendar,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { useShowcaseStore, type ShowcaseTheme } from "@/stores/useShowcaseStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const THEMES: { id: ShowcaseTheme; name: string; gradient: string }[] = [
  {
    id: "emerald",
    name: "Émeraude Royal (Giya)",
    gradient: "from-emerald-500 to-teal-700",
  },
  {
    id: "indigo",
    name: "Bleu Nuit / Indigo Prestige",
    gradient: "from-blue-600 to-indigo-900",
  },
  {
    id: "amber",
    name: "Ambre Solaire (Afro Vibes)",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "electric",
    name: "Nuit Électrique & Cyber DJ",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "ruby",
    name: "Rubis & Soirée VIP Prestige",
    gradient: "from-rose-500 to-purple-600",
  },
  {
    id: "dark",
    name: "Noir Onyx Minimaliste",
    gradient: "from-zinc-700 to-zinc-950",
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
    orgName,
    orgTagline,
    orgCoverUrl,
    heroBadge,
    heroHeadline,
    heroSubheadline,
    heroCtaText,
    statParticipants,
    statEvents,
    statSatisfaction,
    statSecurity,
    aboutTitle,
    aboutText,
    events,
    whatsappNumber,
    supportPhone,
    contactEmail,
    address,
    rccm,
    nif,
    updateField,
    updateEvent,
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
          onClick={() => setActiveInspectorTab("org")}
          className={`flex flex-col items-center justify-center rounded-xl p-2 text-[10px] font-semibold transition-all ${
            activeInspectorTab === "org"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Organisation & Hero"
        >
          <Building className="size-4 mb-1" />
          <span>Structure</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInspectorTab("events")}
          className={`flex flex-col items-center justify-center rounded-xl p-2 text-[10px] font-semibold transition-all ${
            activeInspectorTab === "events"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Catalogue des Événements"
        >
          <Ticket className="size-4 mb-1" />
          <span>Événements</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInspectorTab("about")}
          className={`flex flex-col items-center justify-center rounded-xl p-2 text-[10px] font-semibold transition-all ${
            activeInspectorTab === "about"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="À Propos & Vision"
        >
          <FileText className="size-4 mb-1" />
          <span>À Propos</span>
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
              Palette de couleurs du portail
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

          <div className="pt-2 border-t border-border space-y-2">
            <Label className="text-xs font-bold text-foreground block">
              Typographie principale
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFontFamily(f)}
                  className={`rounded-xl border p-2.5 text-xs transition-all ${
                    fontFamily === f
                      ? "border-primary bg-primary/10 font-bold text-primary"
                      : "border-border hover:bg-muted/30"
                  }`}
                  style={{ fontFamily: f }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Organization & Hero */}
      {activeInspectorTab === "org" && (
        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <Label className="text-xs font-bold">Nom de l&apos;Organisation</Label>
            <Input
              value={orgName}
              onChange={(e) => updateField("orgName", e.target.value)}
              className="h-9 rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Slogan & Activité</Label>
            <Input
              value={orgTagline}
              onChange={(e) => updateField("orgTagline", e.target.value)}
              className="h-9 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1 pt-1 border-t border-border">
            <Label className="text-xs font-bold">Badge Hero</Label>
            <Input
              value={heroBadge}
              onChange={(e) => updateField("heroBadge", e.target.value)}
              className="h-9 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Grand Titre Hero</Label>
            <Input
              value={heroHeadline}
              onChange={(e) => updateField("heroHeadline", e.target.value)}
              className="h-9 rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Texte de Présentation Hero</Label>
            <Textarea
              value={heroSubheadline}
              onChange={(e) => updateField("heroSubheadline", e.target.value)}
              rows={3}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Bouton CTA Principal</Label>
            <Input
              value={heroCtaText}
              onChange={(e) => updateField("heroCtaText", e.target.value)}
              className="h-9 rounded-xl text-xs font-bold"
            />
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <Label className="text-xs font-bold">Chiffres Clés (Statistiques)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-muted-foreground">Participants</span>
                <Input
                  value={statParticipants}
                  onChange={(e) => updateField("statParticipants", e.target.value)}
                  className="h-8 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Éditions</span>
                <Input
                  value={statEvents}
                  onChange={(e) => updateField("statEvents", e.target.value)}
                  className="h-8 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Events Catalog */}
      {activeInspectorTab === "events" && (
        <div className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-foreground">
              Événements dans le Catalogue ({events.length})
            </Label>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="rounded-2xl border border-border bg-muted/20 p-3 space-y-2 text-xs"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-primary">{evt.category}</span>
                  <Input
                    value={evt.title}
                    onChange={(e) => updateEvent(evt.id, { title: e.target.value })}
                    className="h-8 rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <span className="text-[10px] text-muted-foreground">Date</span>
                    <Input
                      value={evt.date}
                      onChange={(e) => updateEvent(evt.id, { date: e.target.value })}
                      className="h-7 rounded-lg text-[11px]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Prix Dès (FCFA)</span>
                    <Input
                      type="number"
                      value={evt.startingPrice}
                      onChange={(e) =>
                        updateEvent(evt.id, { startingPrice: Number(e.target.value) })
                      }
                      className="h-7 rounded-lg text-[11px] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground">Lieu</span>
                  <Input
                    value={evt.location}
                    onChange={(e) => updateEvent(evt.id, { location: e.target.value })}
                    className="h-7 rounded-lg text-[11px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: About & Vision */}
      {activeInspectorTab === "about" && (
        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <Label className="text-xs font-bold">Titre de la Section À Propos</Label>
            <Input
              value={aboutTitle}
              onChange={(e) => updateField("aboutTitle", e.target.value)}
              className="h-9 rounded-xl text-xs font-bold"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Texte de Présentation de l&apos;Organisation</Label>
            <Textarea
              value={aboutText}
              onChange={(e) => updateField("aboutText", e.target.value)}
              rows={6}
              className="rounded-xl text-xs leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Tab 5: Contact & Legal */}
      {activeInspectorTab === "contact" && (
        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <Label className="text-xs font-bold">Numéro WhatsApp (Bouton Direct)</Label>
            <Input
              value={whatsappNumber}
              onChange={(e) => updateField("whatsappNumber", e.target.value)}
              className="h-9 rounded-xl text-xs font-mono"
              placeholder="+241 77 XX XX XX"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Téléphone Support Client</Label>
            <Input
              value={supportPhone}
              onChange={(e) => updateField("supportPhone", e.target.value)}
              className="h-9 rounded-xl text-xs font-mono"
              placeholder="+241 74 XX XX XX"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Email de Contact</Label>
            <Input
              value={contactEmail}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              className="h-9 rounded-xl text-xs"
              placeholder="contact@organisation.ga"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Adresse / Ville</Label>
            <Input
              value={address}
              onChange={(e) => updateField("address", e.target.value)}
              className="h-9 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold">N° NIF</Label>
              <Input
                value={nif}
                onChange={(e) => updateField("nif", e.target.value)}
                className="h-8 rounded-lg text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold">N° RCCM</Label>
              <Input
                value={rccm}
                onChange={(e) => updateField("rccm", e.target.value)}
                className="h-8 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
