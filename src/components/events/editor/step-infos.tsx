"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Bold, Italic, Link2, List, MapPin, Plus, Sparkles, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AiDescriptionButton } from "@/components/events/ai-description-button";
import { EV_PORTAL, EvButton, EvCheckbox, EvHr, EvInput, EvLabel, EvSectionTitle } from "@/components/events/ev-ui";
import { TypeIcon } from "@/components/events/ev-icons";
import { EVENT_TYPE_OPTIONS, typeAvailable } from "@/lib/event-meta";
import type { CropFocus, EventLogoRole } from "@/lib/events";
import { prepareImage } from "@/lib/image";
import { defaultTemplateFor } from "@/lib/ticket-templates";
import { cn } from "@/lib/utils";
import { durationLabel, newId, type EditorForm } from "./editor-model";
import { EventPageExtras } from "./step-infos-page";

type Props = {
  form: EditorForm;
  set: (patch: Partial<EditorForm>) => void;
  soldCount: number;
  orgName: string;
  onOpenPosterStudio: () => void;
};

const TITLE_MAX = 80;

const LOGO_ROLES: { value: EventLogoRole; label: string }[] = [
  { value: "MAIN_ORGANIZER", label: "Organisateur principal" },
  { value: "CO_ORGANIZER", label: "Co-organisateur" },
  { value: "PARTNER", label: "Partenaire" },
  { value: "SPONSOR", label: "Sponsor" },
  { value: "INSTITUTION", label: "Institution" },
];

const CROP_OPTIONS: { value: CropFocus; label: string }[] = [
  { value: "center", label: "Centré" },
  { value: "top", label: "Haut" },
  { value: "bottom", label: "Bas" },
  { value: "left", label: "Gauche" },
  { value: "right", label: "Droite" },
];

export function StepInfos({ form, set, soldCount, orgName: _orgName, onOpenPosterStudio }: Props) {
  void _orgName;
  const fileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const duration = durationLabel(form);

  // Mise en forme légère (Markdown) : **gras**, *italique*, listes, liens.
  function wrap(before: string, after = before, placeholder = "texte") {
    const el = descRef.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const selected = value.slice(a, b) || placeholder;
    const next = value.slice(0, a) + before + selected + after + value.slice(b);
    set({ description: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + before.length, a + before.length + selected.length);
    });
  }
  function bullet() {
    const el = descRef.current;
    if (!el) return;
    const { selectionStart: a, value } = el;
    const lineStart = value.lastIndexOf("\n", a - 1) + 1;
    set({ description: value.slice(0, lineStart) + "- " + value.slice(lineStart) });
    requestAnimationFrame(() => el.focus());
  }
  function link() {
    const url = window.prompt("Adresse du lien (https://…)", "https://");
    if (!url || !/^https:\/\/\S+$/.test(url)) return;
    wrap("[", `](${url})`, "lien");
  }

  async function onPoster(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop lourde (5 Mo max).");
      input.value = "";
      return;
    }
    try {
      set({ imageUrl: await prepareImage(file) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image illisible.");
    } finally {
      input.value = "";
    }
  }

  async function onLogosPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    const remainingSlots = Math.max(0, 6 - form.logos.length);
    if (remainingSlots === 0) {
      toast.error("Maximum 6 logos atteint.");
      input.value = "";
      return;
    }
    const batch = files.slice(0, remainingSlots);
    const added = [...form.logos];
    for (const file of batch) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`« ${file.name} » dépasse 5 Mo.`);
        continue;
      }
      try {
        const dataUrl = await prepareImage(file);
        const cleanName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Partenaire";
        added.push({
          id: newId("logo"),
          name: cleanName,
          role: added.length === 0 ? "MAIN_ORGANIZER" : "PARTNER",
          imageUrl: dataUrl,
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Image de logo illisible.");
      }
    }
    set({ logos: added });
    input.value = "";
  }

  return (
    <div className="flex flex-col gap-7">
      {soldCount > 0 && (
        <div className="flex items-start gap-3 rounded-[12px] border border-[#F0D9AE] bg-ev-warn-bg px-3.5 py-3 dark:border-[#5c4a22]">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-ev-gold-text" />
          <span className="text-[13px] leading-normal text-[#5C3D07] dark:text-[#e9cf98]">
            <b>
              {soldCount} billet{soldCount > 1 ? "s" : ""} déjà vendu{soldCount > 1 ? "s" : ""}.
            </b>{" "}
            Si la date ou le lieu change, les participants seront prévenus automatiquement par e-mail et WhatsApp.
          </span>
        </div>
      )}

      <section className="flex flex-col gap-3.5">
        <EvSectionTitle title="Type d'événement" sub="Il adapte les modèles de billet, le questionnaire et le certificat proposés." />
        <div role="radiogroup" aria-label="Type d'événement" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EVENT_TYPE_OPTIONS.map((o) => {
            const sel = form.eventType === o.value;
            const available = typeAvailable(o);
            return (
              <button
                key={o.key}
                type="button"
                role="radio"
                aria-checked={sel}
                disabled={!available}
                title={available ? undefined : "Bientôt : ce type n'est pas encore enregistré par le serveur."}
                onClick={() => set({ eventType: o.value, ticketTemplate: defaultTemplateFor(o.value ?? undefined) })}
                className={cn(
                  "flex h-[50px] items-center gap-2.5 rounded-[12px] px-3 text-left text-[13px] text-ev-ink transition-colors disabled:cursor-not-allowed disabled:opacity-55",
                  sel ? "border-[1.5px] border-ev-primary bg-ev-selected font-semibold" : "border border-ev-border bg-ev-surface font-medium hover:bg-ev-soft"
                )}
              >
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-[8px]", sel ? "bg-ev-primary text-white" : "bg-[#F1EFE9] text-ev-ink2 dark:bg-ev-line")}>
                  <TypeIcon icon={o.icon} size={15} />
                </span>
                <span className="min-w-0 leading-tight">{o.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <EvHr />

      <section className="flex flex-col gap-[18px]">
        <h2 className="m-0 text-base font-semibold">Présentation</h2>
        <label className="flex flex-col gap-2">
          <EvLabel required hint={`${form.title.length} / ${TITLE_MAX}`}>
            Titre
          </EvLabel>
          <EvInput h={46} className="text-[15px]" value={form.title} maxLength={TITLE_MAX} onChange={(e) => set({ title: e.target.value })} placeholder="Nom de votre événement" />
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium">Description et programme</span>
            <AiDescriptionButton
              context={{ title: form.title, eventType: form.eventType ?? undefined, venueName: form.venueName || undefined, startDate: form.startDay || undefined }}
              onApply={(text) => set({ description: text })}
              trigger={(open) => (
                <button type="button" onClick={open} className="flex h-[30px] items-center gap-1.5 rounded-[8px] border border-ev-border bg-ev-surface px-2.5 text-xs font-semibold text-ev-link hover:bg-ev-soft">
                  <Sparkles className="size-3.5" />
                  Améliorer avec l&apos;IA
                </button>
              )}
            />
          </div>
          <div className="overflow-hidden rounded-[10px] border border-ev-border focus-within:border-ev-primary focus-within:shadow-[0_0_0_3px_var(--ev-mint)]">
            <div className="flex gap-0.5 border-b border-ev-line bg-ev-soft p-1.5">
              <button
                type="button"
                aria-label="Gras"
                title="Gras"
                onClick={() => wrap("**")}
                className="flex h-7 w-[30px] items-center justify-center rounded-[6px] text-ev-ink hover:bg-ev-line"
              >
                <Bold className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Italique"
                title="Italique"
                onClick={() => wrap("*")}
                className="flex h-7 w-[30px] items-center justify-center rounded-[6px] text-ev-ink hover:bg-ev-line"
              >
                <Italic className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Liste à puces"
                title="Liste à puces"
                onClick={() => bullet()}
                className="flex h-7 w-[30px] items-center justify-center rounded-[6px] text-ev-ink hover:bg-ev-line"
              >
                <List className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Lien"
                title="Lien"
                onClick={() => link()}
                className="flex h-7 w-[30px] items-center justify-center rounded-[6px] text-ev-ink hover:bg-ev-line"
              >
                <Link2 className="size-4" />
              </button>
            </div>
            <textarea
              ref={descRef}
              rows={4}
              aria-label="Description"
              maxLength={3000}
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="Programme, intervenants, ce qui attend les participants…"
              className="block w-full resize-y border-0 bg-ev-surface px-3.5 py-3 text-sm leading-relaxed text-ev-ink2 outline-none placeholder:text-ev-muted"
            />
          </div>
        </div>
      </section>

      <EvHr />

      <section className="flex flex-col gap-3.5">
        <EvSectionTitle title="Affiche" sub="Format portrait 4:5 recommandé · PNG, JPG ou WEBP · 5 Mo max." />
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => void onPoster(e)} />
        <div className="flex flex-col gap-[18px] sm:flex-row sm:items-stretch">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[260px] shrink-0 overflow-hidden rounded-[14px] bg-[#0B1B1C] shadow-[0_8px_24px_rgba(12,22,18,.12)] sm:mx-0 sm:h-[450px] sm:w-[360px] sm:max-w-none">
            {form.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imageUrl} alt="Affiche actuelle" className="block size-full object-cover" />
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="flex size-full flex-col items-center justify-center gap-2 text-sm text-white/70">
                <Upload className="size-6" />
                Importer une affiche
              </button>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="flex h-10 items-center justify-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface text-[13px] font-semibold text-ev-ink hover:bg-ev-soft">
                <Upload className="size-4" />
                {form.imageUrl ? "Remplacer" : "Importer"}
              </button>
              <button type="button" onClick={onOpenPosterStudio} className="flex h-10 items-center justify-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface text-[13px] font-semibold text-ev-link hover:bg-ev-soft">
                <Sparkles className="size-4" />
                Générer avec l&apos;IA
              </button>
            </div>
            {form.imageUrl && (
              <div className="flex flex-col gap-2.5">
                <span className="text-[13px] font-medium">Recadrages automatiques</span>
                <div className="flex flex-wrap items-end gap-3">
                  {(
                    [
                      ["Vitrine 4:5", 72, 90, form.posterCrops.portrait45 ?? "center"],
                      ["WhatsApp 1:1", 90, 90, form.posterCrops.square11 ?? "center"],
                      ["En-tête 16:9", 160, 90, form.posterCrops.banner169 ?? "center"],
                    ] as const
                  ).map(([label, w, h, pos]) => (
                    <div key={label} className="flex flex-col gap-1.5">
                      <span className="block overflow-hidden rounded-[6px] bg-[#0B1B1C]" style={{ width: w, height: h }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.imageUrl} alt="" className="block size-full object-cover" style={{ objectPosition: pos }} />
                      </span>
                      <span className="text-[11px] text-ev-muted">{label}</span>
                    </div>
                  ))}
                </div>
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCropDialogOpen(true)}
                    className="p-0 text-[13px] font-semibold text-ev-link hover:underline"
                  >
                    Ajuster les recadrages
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <EvHr />

      <section className="flex flex-col gap-3.5">
        <EvSectionTitle
          title="Logos des organisateurs et partenaires"
          sub="PNG transparent ou SVG recommandé · glissez ou ajoutez jusqu'à 6 logos."
          right={
            <span className="shrink-0 text-xs text-ev-muted">
              {form.logos.length} logo{form.logos.length > 1 ? "s" : ""} · 6 max.
            </span>
          }
        />
        <input
          ref={logoFileRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => void onLogosPicked(e)}
        />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {form.logos.map((logo) => (
            <div key={logo.id} className="flex flex-col overflow-hidden rounded-[12px] border border-ev-border">
              <div className="relative flex h-[84px] items-center justify-center bg-ev-bg p-2">
                {logo.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo.imageUrl} alt={logo.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="px-2 text-center text-[13px] font-semibold tracking-[0.2em] text-ev-ink">
                    {(logo.name || "LOGO").toUpperCase()}
                  </span>
                )}
                {form.logos.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Retirer ${logo.name}`}
                    onClick={() => set({ logos: form.logos.filter((l) => l.id !== logo.id) })}
                    className="absolute right-1.5 top-1.5 flex size-[26px] items-center justify-center rounded-[8px] bg-ev-surface text-ev-muted hover:text-ev-danger"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1.5 p-2.5">
                <EvInput
                  h={32}
                  className="px-2 text-[13px]"
                  value={logo.name}
                  aria-label="Nom du logo"
                  onChange={(e) =>
                    set({
                      logos: form.logos.map((l) => (l.id === logo.id ? { ...l, name: e.target.value } : l)),
                    })
                  }
                />
                <select
                  aria-label="Rôle"
                  value={logo.role}
                  onChange={(e) =>
                    set({
                      logos: form.logos.map((l) =>
                        l.id === logo.id ? { ...l, role: e.target.value as EventLogoRole } : l
                      ),
                    })
                  }
                  className="h-8 rounded-[8px] border border-ev-border bg-ev-surface px-1.5 text-xs text-ev-ink"
                >
                  {LOGO_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {form.logos.length < 6 && (
            <button
              type="button"
              onClick={() => logoFileRef.current?.click()}
              className={cn(
                "flex min-h-[150px] flex-col items-center justify-center gap-1.5 rounded-[12px] border-[1.5px] border-dashed border-[#B9CFC5] bg-[#F7FAF8] hover:bg-ev-mint/40 dark:border-ev-dash dark:bg-ev-soft",
                form.logos.length === 1 ? "col-span-1 sm:col-span-3" : "col-span-1"
              )}
            >
              <span className="flex size-[34px] items-center justify-center rounded-[10px] bg-ev-mint text-ev-primary dark:text-ev-link">
                <Plus className="size-4" />
              </span>
              <span className="text-[13px] font-semibold">Ajouter des logos</span>
              <span className="text-xs text-ev-muted">Plusieurs fichiers à la fois</span>
            </button>
          )}
        </div>
        <fieldset className="m-0 flex flex-wrap items-center gap-[18px] border-0 p-0 text-[13px]">
          <legend className="float-left mr-1.5 p-0 font-medium">Afficher sur</legend>
          {(
            [
              ["vitrine", "Vitrine"],
              ["billets", "Billets"],
              ["certificats", "Certificats"],
            ] as const
          ).map(([key, label]) => (
            <EvCheckbox
              key={key}
              checked={form.logosDisplay[key]}
              onChange={(v) => set({ logosDisplay: { ...form.logosDisplay, [key]: v } })}
              label={label}
            />
          ))}
        </fieldset>
      </section>

      <EvHr />

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-base font-semibold">Date et lieu</h2>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <EvLabel required>Début</EvLabel>
            <div className="flex gap-2">
              <EvInput type="date" className="min-w-0 flex-1" value={form.startDay} aria-label="Date de début" onChange={(e) => set({ startDay: e.target.value, endDay: form.endDay && form.endDay >= e.target.value ? form.endDay : e.target.value })} />
              <EvInput type="time" className="w-[108px] shrink-0" value={form.startTime} aria-label="Heure de début" onChange={(e) => set({ startTime: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <EvLabel>Fin</EvLabel>
            <div className="flex gap-2">
              <EvInput type="date" className="min-w-0 flex-1" value={form.endDay} min={form.startDay} aria-label="Date de fin" onChange={(e) => set({ endDay: e.target.value })} />
              <EvInput type="time" className="w-[108px] shrink-0" value={form.endTime} aria-label="Heure de fin" onChange={(e) => set({ endTime: e.target.value })} />
            </div>
          </div>
        </div>
        <span className="-mt-1.5 text-xs text-ev-muted">Heure de Libreville (UTC+1){duration ? ` · ${duration}` : ""}</span>
        <div className="flex flex-wrap items-center gap-3.5">
          <span className="text-[13px] font-medium">Format</span>
          <div role="radiogroup" aria-label="Format" className="inline-flex rounded-[10px] bg-ev-line p-[3px]">
            {(
              [
                ["ONSITE", "Sur place"],
                ["ONLINE", "En ligne"],
                ["HYBRID", "Hybride"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={form.format === v}
                onClick={() => set({ format: v })}
                className={cn("h-8 rounded-[8px] px-3.5 text-[13px]", form.format === v ? "bg-ev-surface font-semibold text-ev-ink" : "text-ev-ink3")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-[2fr_1fr]">
          <label className="flex flex-col gap-2">
            <EvLabel required>Lieu</EvLabel>
            <span className="flex h-11 items-center gap-2.5 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-ev-muted focus-within:border-ev-primary focus-within:shadow-[0_0_0_3px_var(--ev-mint)]">
              <MapPin className="size-4 shrink-0" />
              <input value={form.venueName} maxLength={150} onChange={(e) => set({ venueName: e.target.value })} placeholder="Salle, adresse…" className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ev-ink outline-none placeholder:text-ev-muted" />
            </span>
          </label>
          <label className="flex flex-col gap-2">
            <EvLabel>Ville</EvLabel>
            <EvInput value={form.city} maxLength={120} onChange={(e) => set({ city: e.target.value })} />
          </label>
        </div>
      </section>

      <EvHr />

      <EventPageExtras form={form} set={set} />

      {/* Modale d'ajustement des recadrages de l'affiche */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className={`${EV_PORTAL} sm:max-w-[480px]`}>
          <DialogHeader>
            <DialogTitle>Ajuster les recadrages automatiques</DialogTitle>
            <DialogDescription>
              Choisissez le point focal utilisé pour chaque déclinaison de votre affiche.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {(
              [
                ["portrait45", "Vitrine 4:5"],
                ["square11", "WhatsApp 1:1"],
                ["banner169", "En-tête 16:9"],
              ] as const
            ).map(([key, label]) => {
              const cur = form.posterCrops[key] ?? "center";
              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-ev-ink">{label}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {CROP_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          set({ posterCrops: { ...form.posterCrops, [key]: opt.value } })
                        }
                        className={cn(
                          "h-8 rounded-[8px] border px-3 text-xs font-medium",
                          cur === opt.value
                            ? "border-ev-primary bg-ev-selected font-semibold text-ev-ink"
                            : "border-ev-border bg-ev-surface text-ev-ink2 hover:bg-ev-soft"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <EvButton variant="primary" onClick={() => setCropDialogOpen(false)}>
              Terminé
            </EvButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
