"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FIELDS, SECTION_LABEL, SECTIONS, type SectionKey, type TextField } from "@/components/site-editor/editor-model";
import { aiError, useAiText } from "@/hooks/useAi";
import { GiyaxAvatar } from "@/components/ai/giyax-avatar";
import { TypewriterText } from "@/components/ai/typewriter";
import { FEATURES } from "@/lib/features";
import { designPatch, lookOf, type HeadlineSize } from "@/lib/event-site-theme";
import type { FAQItem, ShowcaseContent } from "@/stores/useShowcaseStore";
import type { SiteEvent } from "@/components/event-site/site-data";
import { cn } from "@/lib/utils";

// Panneau de droite de l'éditeur (écran 19) : l'élément choisi sur le site,
// ses réglages et les suggestions de l'IA (POST /ai/generate). Les
// propositions de la barre IA s'affichent sur l'aperçu, pas ici.

type Update = (patch: Partial<ShowcaseContent>, key?: string) => void;
export type Selection = { section: SectionKey | null; field: TextField | null };

const INPUT =
  "w-full rounded-[10px] border border-ev-border bg-ev-surface px-3 text-sm text-ev-ink outline-none transition-[border,box-shadow] placeholder:text-ev-muted focus:border-ev-primary focus:shadow-[0_0_0_3px_var(--ev-mint)]";

function Field({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold text-ev-ink2">
      <span className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">{label}</span>
        {hint !== undefined && <span className="font-normal text-ev-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function TextInput({ field, content, update, autoFocus }: { field: TextField; content: ShowcaseContent; update: Update; autoFocus?: boolean }) {
  const meta = FIELDS[field];
  const value = (content[field] as string) ?? "";
  return meta.rows > 1 ? (
    <textarea
      rows={meta.rows}
      autoFocus={autoFocus}
      maxLength={meta.max}
      value={value}
      onChange={(e) => update({ [field]: e.target.value }, field)}
      className={cn(INPUT, "resize-y py-2.5 font-medium")}
    />
  ) : (
    <input autoFocus={autoFocus} maxLength={meta.max} value={value} onChange={(e) => update({ [field]: e.target.value }, field)} className={cn(INPUT, "h-10 font-medium")} />
  );
}

// Variantes : une par ligne, sans numéros ni guillemets.
function parseVariants(text: string) {
  return text
    .split(/\n+/)
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").replace(/^["«“]\s*|\s*["»”]$/g, "").trim())
    .filter((l) => l.length > 2)
    .slice(0, 3);
}

function AiSuggestions({ field, content, update }: { field: TextField; content: ShowcaseContent; update: Update }) {
  const ai = useAiText();
  const [items, setItems] = useState<string[]>([]);
  const meta = FIELDS[field];
  const current = ((content[field] as string) ?? "").slice(0, 220);

  async function suggest(tone?: string) {
    const prompt = `Propose 3 variantes pour « ${meta.label} » du site d'un organisateur d'événements (${content.orgName}). ${
      current ? `Texte actuel : « ${current} ». ` : ""
    }${tone ? `Consigne : ${tone}. ` : ""}Maximum ${Math.min(meta.max, 160)} caractères chacune. Une variante par ligne, sans numéro ni guillemets.`;
    try {
      const text = await ai.mutateAsync({ prompt });
      const list = parseVariants(text);
      if (!list.length) toast.error("L'IA n'a rien proposé, réessayez.");
      setItems(list);
    } catch (err) {
      toast.error(aiError(err));
    }
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-[12px] border border-[#D5E6DE] bg-ev-selected p-3.5 dark:border-ev-border">
      <span className="flex items-center gap-2 text-[13px] font-semibold text-ev-primary">
        <GiyaxAvatar size={22} mood={ai.isPending ? "thinking" : "idle"} /> {ai.isPending ? "GiyaX AI réfléchit…" : "Suggestions de l'IA"}
      </span>
      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => void suggest()}
          disabled={ai.isPending}
          className="flex h-9 items-center justify-center gap-2 rounded-[10px] border border-[#D5E6DE] bg-ev-surface text-[13px] font-semibold text-ev-primary disabled:opacity-60 dark:border-ev-border"
        >
          {ai.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {ai.isPending ? "Rédaction…" : "Proposer 3 variantes"}
        </button>
      ) : (
        items.map((t, i) => (
          <button
            key={`${i}-${t}`}
            type="button"
            onClick={() => update({ [field]: t.slice(0, meta.max) }, `${field}-ai`)}
            className="flex items-center justify-between gap-2.5 rounded-[10px] border border-[#D5E6DE] bg-ev-surface px-3 py-2.5 text-left text-[13px] dark:border-ev-border"
          >
            {/* Les variantes s'écrivent l'une après l'autre. */}
            <TypewriterText text={t} delay={i * 450} />
            <span className="shrink-0 text-xs font-semibold text-ev-primary">Appliquer</span>
          </button>
        ))
      )}
      <div className="flex flex-wrap gap-1.5">
        {["Plus court", "Plus percutant", "Plus formel"].map((tone) => (
          <button
            key={tone}
            type="button"
            disabled={ai.isPending}
            onClick={() => void suggest(tone.toLowerCase())}
            className="h-7 rounded-full border border-[#D5E6DE] bg-ev-surface px-2.5 text-xs disabled:opacity-60 dark:border-ev-border"
          >
            {tone}
          </button>
        ))}
      </div>
    </div>
  );
}

function FaqEditor({ content, update }: { content: ShowcaseContent; update: Update }) {
  const faqs = content.faqs ?? [];
  const set = (next: FAQItem[]) => update({ faqs: next }, "faqs");
  return (
    <div className="flex flex-col gap-3">
      {faqs.map((f, i) => (
        <div key={f.id} className="flex flex-col gap-2 rounded-[12px] border border-ev-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ev-muted">Question {i + 1}</span>
            <button type="button" aria-label="Supprimer la question" onClick={() => set(faqs.filter((x) => x.id !== f.id))} className="text-ev-muted hover:text-ev-danger">
              <Trash2 className="size-3.5" />
            </button>
          </div>
          <input value={f.question} maxLength={200} onChange={(e) => set(faqs.map((x) => (x.id === f.id ? { ...x, question: e.target.value } : x)))} placeholder="Question" className={cn(INPUT, "h-9 font-medium")} />
          <textarea rows={3} value={f.answer} maxLength={1500} onChange={(e) => set(faqs.map((x) => (x.id === f.id ? { ...x, answer: e.target.value } : x)))} placeholder="Réponse" className={cn(INPUT, "resize-y py-2")} />
        </div>
      ))}
      {faqs.length < 30 && (
        <button
          type="button"
          onClick={() => set([...faqs, { id: `faq-${Date.now().toString(36)}`, question: "", answer: "" }])}
          className="flex h-9 items-center justify-center gap-2 rounded-[10px] border border-dashed border-ev-dash text-[13px] font-semibold text-ev-primary"
        >
          <Plus className="size-4" /> Ajouter une question
        </button>
      )}
    </div>
  );
}

const CONTACT_FIELDS: { key: keyof ShowcaseContent; label: string; max: number; placeholder?: string }[] = [
  { key: "supportPhone", label: "Téléphone", max: 30, placeholder: "+241 77 12 34 56" },
  { key: "whatsappNumber", label: "WhatsApp", max: 30, placeholder: "+241 77 12 34 56" },
  { key: "contactEmail", label: "E-mail", max: 120, placeholder: "contact@exemple.ga" },
  { key: "address", label: "Adresse", max: 300, placeholder: "Quartier, ville" },
  { key: "instagramHandle", label: "Instagram", max: 60, placeholder: "@votre-compte" },
  { key: "facebookUrl", label: "Facebook", max: 300, placeholder: "https://facebook.com/…" },
  { key: "nif", label: "NIF", max: 60 },
  { key: "rccm", label: "RCCM", max: 60 },
];

function SectionForm({ section, content, update, events, onField }: { section: SectionKey; content: ShowcaseContent; update: Update; events: SiteEvent[]; onField: (f: TextField) => void }) {
  const fields = (Object.keys(FIELDS) as TextField[]).filter((f) => FIELDS[f].section === section);
  return (
    <div className="flex flex-col gap-4">
      {fields.map((f) => (
        <Field key={f} label={FIELDS[f].label} hint={<button type="button" onClick={() => onField(f)} className="inline-flex items-center gap-1 text-ev-primary"><Sparkles className="size-3" /> IA</button>}>
          <TextInput field={f} content={content} update={update} />
        </Field>
      ))}
      {section === "events" && (
        <p className="m-0 rounded-[12px] bg-ev-soft p-3.5 text-[13px] leading-relaxed text-ev-ink2">
          Cette section affiche vos {events.length} événement{events.length > 1 ? "s" : ""} en vente. Titre, affiche, date et billets se modifient dans{" "}
          <Link href="/admin/event/events" className="font-semibold text-ev-primary underline underline-offset-2">
            Mes événements
          </Link>
          .
        </p>
      )}
      {section === "gallery" && (
        <p className="m-0 rounded-[12px] bg-ev-soft p-3.5 text-[13px] leading-relaxed text-ev-ink2">
          {content.galleryImages.length} photo{content.galleryImages.length > 1 ? "s" : ""} · ajoutez ou retirez des photos dans l&apos;onglet Médias (icône image, à gauche). Albums par événement : bientôt.
        </p>
      )}
      {section === "faq" && <FaqEditor content={content} update={update} />}
      {(section === "footer" || section === "header") && (
        <div className="grid grid-cols-2 gap-3">
          {CONTACT_FIELDS.map((c) => (
            <Field key={c.key} label={c.label}>
              <input
                value={(content[c.key] as string) ?? ""}
                maxLength={c.max}
                placeholder={c.placeholder}
                onChange={(e) => update({ [c.key]: e.target.value }, c.key)}
                className={cn(INPUT, "h-9 text-[13px]")}
              />
            </Field>
          ))}
        </div>
      )}
    </div>
  );
}

export function Inspector({
  selection,
  setSelection,
  content,
  update,
  events,
  pageEvent,
}: {
  selection: Selection;
  setSelection: (s: Selection) => void;
  content: ShowcaseContent;
  update: Update;
  events: SiteEvent[];
  pageEvent: SiteEvent | null;
}) {
  const [tab, setTab] = useState<"content" | "style" | "section">("content");
  const { section, field } = selection;

  const header = field ? (
    <>
      <span className="text-xs text-ev-muted">
        {SECTION_LABEL[FIELDS[field].section]} › {FIELDS[field].crumb}
      </span>
      <span className="text-[15px] font-semibold">{FIELDS[field].label}</span>
    </>
  ) : section ? (
    <>
      <span className="text-xs text-ev-muted">Section</span>
      <span className="text-[15px] font-semibold">{SECTION_LABEL[section]}</span>
    </>
  ) : (
    <>
      <span className="text-xs text-ev-muted">{pageEvent ? "Page d'événement" : "Accueil"}</span>
      <span className="text-[15px] font-semibold">Modifier le site</span>
    </>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-1 border-b border-ev-line px-4 py-3.5">{header}</div>

      {!section && !field ? (
        <div className="flex flex-col gap-3 p-4 text-[13px] text-ev-ink2">
          {pageEvent ? (
            <p className="m-0 leading-relaxed">
              Cette page reprend l&apos;événement « {pageEvent.title} » : son contenu se modifie dans{" "}
              <Link href={`/admin/event/events/${pageEvent.id}`} className="font-semibold text-ev-primary underline underline-offset-2">
                Mes événements
              </Link>
              . Le thème, l&apos;en-tête et le pied de page sont ceux du site.
            </p>
          ) : (
            <p className="m-0 leading-relaxed">Cliquez sur un texte ou une section du site pour le modifier, ou choisissez une section :</p>
          )}
          <div className="flex flex-col gap-1">
            {SECTIONS.filter((s) => !pageEvent || s.key === "header" || s.key === "footer").map((s) => (
              <button key={s.key} type="button" onClick={() => setSelection({ section: s.key, field: null })} className="rounded-[8px] px-2.5 py-2 text-left font-medium hover:bg-ev-soft">
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Onglets" className="flex gap-1 px-4 pt-2.5">
            {(
              [
                ["content", "Contenu"],
                ["style", "Style"],
                ["section", "Section"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={cn("h-8 border-b-2 px-3 text-[13px]", tab === k ? "border-ev-primary font-semibold" : "border-transparent text-ev-muted")}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto border-t border-ev-line p-4">
            {tab === "content" &&
              (field ? (
                <>
                  <Field label="Texte" hint={`${((content[field] as string) ?? "").length} / ${FIELDS[field].max}`}>
                    <TextInput key={field} field={field} content={content} update={update} autoFocus />
                  </Field>
                  {field === "heroHeadline" && <HighlightPicker content={content} update={update} />}
                  <AiSuggestions key={field} field={field} content={content} update={update} />
                  {field === "heroHeadline" && <HeadlineSizePicker content={content} update={update} />}
                </>
              ) : (
                section && <SectionForm section={section} content={content} update={update} events={events} onField={(f) => setSelection({ section, field: f })} />
              ))}
            {tab === "style" && (
              <p className="m-0 rounded-[12px] bg-ev-soft p-3.5 text-[13px] leading-relaxed text-ev-ink2">
                Bientôt : taille, couleur et alignement de chaque élément. En attendant, couleurs et typographie se règlent pour tout le site dans l&apos;onglet Thème.
              </p>
            )}
            {tab === "section" && section && (
              <div className="flex flex-col gap-3 text-[13px] text-ev-ink2">
                <span>
                  Section : <b className="text-ev-ink">{SECTION_LABEL[section]}</b>
                </span>
                <span className="text-ev-muted">
                  {FEATURES.showcaseSections ? "Afficher ou masquer : œil de la section, dans la liste à gauche. Déplacer une section : bientôt." : "Masquer ou déplacer une section : bientôt."}
                </span>
                {field && (
                  <button type="button" onClick={() => setSelection({ section, field: null })} className="self-start font-semibold text-ev-primary">
                    Voir tous les réglages de la section
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Mot du titre mis en couleur (design.highlight) : un mot du titre, le
// dernier par défaut (modèle Nuit), ou aucun.
function HighlightPicker({ content, update }: { content: ShowcaseContent; update: Update }) {
  const look = lookOf(content);
  const words = [...new Set((content.heroHeadline ?? "").split(/\s+/).filter((w) => w.length > 1))];
  const value = content.design?.highlight;
  const set = (highlight: string | undefined) => {
    const base = designPatch(look, content.design);
    const design = { ...base.design! };
    if (highlight === undefined) delete design.highlight;
    else design.highlight = highlight;
    update({ ...base, design }, "highlight");
  };
  return (
    <Field label="Mot mis en couleur">
      <select
        value={value === undefined ? "__auto" : value === "" ? "__none" : value}
        onChange={(e) => set(e.target.value === "__auto" ? undefined : e.target.value === "__none" ? "" : e.target.value)}
        className={cn(INPUT, "h-[38px] font-normal")}
      >
        <option value="__auto">{look.model === "nuit" ? "Dernier mot (automatique)" : "Aucun (automatique)"}</option>
        <option value="__none">Aucun</option>
        {words.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
        {value && !words.includes(value) && <option value={value}>{value}</option>}
      </select>
    </Field>
  );
}

function HeadlineSizePicker({ content, update }: { content: ShowcaseContent; update: Update }) {
  const look = lookOf(content);
  const cur = look.headlineSize ?? "L";
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-semibold text-ev-ink2">Taille</span>
      <div role="radiogroup" aria-label="Taille du titre" className="grid grid-cols-4 rounded-[10px] bg-[#F1EFE9] p-[3px] dark:bg-ev-line">
        {(["S", "M", "L", "XL"] as HeadlineSize[]).map((size) => (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={cur === size}
            onClick={() => update(designPatch({ ...look, headlineSize: size }, content.design), "headline-size")}
            className={cn("flex h-[30px] items-center justify-center rounded-[8px] text-xs", cur === size ? "bg-ev-surface font-semibold" : "text-ev-ink3 hover:text-ev-ink")}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
