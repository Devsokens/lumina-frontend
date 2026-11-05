"use client";

import { useState } from "react";
import { ChevronDown, Copy, Lock, Trash2, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EvSwitch, EV_PORTAL } from "@/components/events/ev-ui";
import { QUESTION_KINDS, questionKind, type QuestionKind } from "@/lib/event-meta";
import { cn } from "@/lib/utils";
import { newId, type EditorForm, type EditorQuestion } from "./editor-model";

type Props = { form: EditorForm; set: (patch: Partial<EditorForm>) => void };

// Icônes des types de question (tracés du design).
const KIND_ICON: Record<QuestionKind, string> = {
  SINGLE_CHOICE: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  MULTIPLE_CHOICE: "M4 4h16v16H4zM8 12l3 3 5-6",
  DROPDOWN: "M4 6h16M4 12h16M4 18h10",
  YES_NO: "M7 12l3 3 5-6M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0",
  SHORT_TEXT: "M4 7V5h16v2M12 5v14M9 19h6",
  PARAGRAPH: "M4 6h16M4 10h16M4 14h16M4 18h10",
  RATING_SCALE: "M4 18h16M6 18v-4M10 18v-7M14 18v-10M18 18v-13",
  STAR_RATING: "m12 3 2.6 5.6 6 .6-4.5 4 1.3 6L12 16l-5.4 3.2 1.3-6-4.5-4 6-.6z",
  NUMBER: "M5 9h14M5 15h14M10 4 8 20M16 4l-2 16",
  DATE: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
};

export function KindIcon({ kind, size = 14 }: { kind: QuestionKind; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={KIND_ICON[kind]} />
    </svg>
  );
}

const TEMPLATES: { label: string; questions: Omit<EditorQuestion, "id">[] }[] = [
  {
    label: "Profil des participants",
    questions: [
      { title: "Quelle est votre tranche d'âge ?", type: "DROPDOWN", options: ["18–21", "22–25", "26–30", "31–35", "36–40", "41–45", "46 +"], isRequired: true },
      { title: "Poste et organisation / entreprise", type: "SHORT_TEXT", isRequired: false },
      { title: "Comment avez-vous découvert cet événement ?", type: "SINGLE_CHOICE", options: ["Réseaux sociaux", "WhatsApp / recommandation", "Bouche à oreille", "Affichage public"], isRequired: true },
    ],
  },
  {
    label: "Attentes",
    questions: [
      { title: "Quels sont vos principaux centres d'intérêt ?", type: "MULTIPLE_CHOICE", options: ["Acquisition de compétences", "Networking & affaires", "Concert & ambiance live", "Dégustation VIP"], isRequired: true },
      { title: "Qu'attendez-vous de cet événement ?", type: "PARAGRAPH", isRequired: false },
    ],
  },
  {
    label: "Satisfaction",
    questions: [
      { title: "Quel est votre niveau de satisfaction ?", type: "RATING_SCALE", isRequired: true },
      { title: "Que pourrions-nous améliorer ?", type: "PARAGRAPH", isRequired: false },
    ],
  },
];

const OTHER = "Autre (préciser)";

export function StepQuestionnaire({ form, set }: Props) {
  const [open, setOpen] = useState<string | null>(form.questions[0]?.id ?? null);
  const questions = form.questions;
  const update = (id: string, patch: Partial<EditorQuestion>) => set({ questions: questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) });
  const minutes = Math.max(1, Math.ceil((questions.length * 15) / 60));

  function add(kind: QuestionKind) {
    const meta = questionKind(kind);
    const q: EditorQuestion = { id: newId(), title: "", type: kind, isRequired: true, ...(meta.hasOptions ? { options: ["Option 1", "Option 2"] } : {}) };
    set({ questions: [...questions, q], questionnaireEnabled: true });
    setOpen(q.id);
  }

  function fromTemplate(i: number) {
    const added = TEMPLATES[i].questions.map((q) => ({ ...q, id: newId() }));
    set({ questions: [...questions, ...added], questionnaireEnabled: true });
    setOpen(added[0]?.id ?? null);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-center justify-between gap-4 rounded-[12px] border border-ev-border bg-ev-soft px-[18px] py-4">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-[15px] font-semibold">Questionnaire d&apos;inscription</h2>
          <span className="text-[13px] text-ev-muted">Rempli par chaque participant au moment de l&apos;achat · les réponses alimentent l&apos;onglet Statistiques.</span>
        </div>
        <BigSwitch checked={form.questionnaireEnabled} onChange={(v) => set({ questionnaireEnabled: v })} label="Activer le questionnaire" />
      </section>

      <section className="flex flex-col gap-2.5">
        <span className="text-[13px] font-medium">Toujours collectés</span>
        <div className="flex flex-wrap gap-2">
          {["Nom complet", "E-mail", "Téléphone (Mobile Money)"].map((l) => (
            <span key={l} className="flex h-8 items-center gap-1.5 rounded-full bg-[#F1EFE9] px-3 text-[13px] text-ev-ink2 dark:bg-ev-line">
              <Lock className="size-3.5" />
              {l}
            </span>
          ))}
        </div>
      </section>

      <section className={cn("flex flex-col gap-2.5", !form.questionnaireEnabled && "opacity-60")}>
        <div className="flex items-baseline justify-between">
          <h2 className="m-0 text-base font-semibold">
            Questions <span className="font-medium text-ev-muted">· {questions.length}</span>
          </h2>
          {questions.length > 0 && <span className="text-xs text-ev-muted">≈ {minutes} min pour répondre</span>}
        </div>

        {questions.map((q, i) => {
          const num = String(i + 1).padStart(2, "0");
          const meta = questionKind(q.type);
          if (open !== q.id) {
            return (
              <button key={q.id} type="button" onClick={() => setOpen(q.id)} className="flex items-center gap-3 rounded-[12px] border border-ev-border bg-ev-surface px-4 py-3.5 text-left hover:bg-ev-soft">
                <span className="font-ev-mono text-xs text-ev-muted">{num}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{q.title || <span className="text-ev-muted">Question sans intitulé</span>}</span>
                <span className="hidden whitespace-nowrap rounded-[6px] bg-[#F1EFE9] px-2 py-[3px] text-xs text-ev-ink2 sm:inline dark:bg-ev-line">{meta.chip}</span>
                <span className={cn("w-[76px] text-right text-xs", q.isRequired ? "text-ev-ink2" : "text-ev-muted")}>{q.isRequired ? "Obligatoire" : "Facultatif"}</span>
                <ChevronDown className="size-4 text-ev-muted" />
              </button>
            );
          }
          const options = q.options ?? [];
          return (
            <div key={q.id} className="overflow-hidden rounded-[12px] border-[1.5px] border-ev-primary">
              <div className="flex flex-wrap items-center gap-3 border-b border-[#D5E6DE] bg-ev-selected px-4 py-3 dark:border-ev-border">
                <span className="font-ev-mono text-xs text-ev-muted">{num}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="flex h-8 items-center gap-2 rounded-[8px] border border-[#D5E6DE] bg-ev-surface px-2.5 text-[13px] font-medium dark:border-ev-border">
                      <KindIcon kind={q.type as QuestionKind} />
                      {meta.label}
                      <ChevronDown className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className={`${EV_PORTAL} w-56 rounded-xl`}>
                    {QUESTION_KINDS.map((k) => (
                      <DropdownMenuItem
                        key={k.kind}
                        className="gap-2"
                        onClick={() => update(q.id, { type: k.kind, options: k.hasOptions ? (q.options?.length ? q.options : ["Option 1", "Option 2"]) : undefined })}
                      >
                        <KindIcon kind={k.kind} />
                        {k.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="flex-1" />
                <span className="flex items-center gap-2 text-[13px]">
                  Obligatoire
                  <EvSwitch checked={q.isRequired} onChange={(v) => update(q.id, { isRequired: v })} ariaLabel="Question obligatoire" />
                </span>
              </div>
              <div className="flex flex-col gap-3 p-4">
                <input
                  value={q.title}
                  maxLength={300}
                  autoFocus={!q.title}
                  onChange={(e) => update(q.id, { title: e.target.value })}
                  placeholder="Intitulé de la question"
                  aria-label="Intitulé de la question"
                  className="h-11 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[15px] font-medium outline-none focus:border-ev-primary focus:shadow-[0_0_0_3px_var(--ev-mint)]"
                />
                {meta.hasOptions ? (
                  <div className="flex flex-col gap-1.5 pl-1">
                    {options.map((o, oi) => (
                      <div key={oi} className="flex items-center gap-2.5">
                        {q.type === "DROPDOWN" ? (
                          <span className="w-4 shrink-0 text-center font-ev-mono text-xs text-ev-muted">{oi + 1}</span>
                        ) : (
                          <span aria-hidden className={cn("size-4 shrink-0 border-[1.5px] border-[#B9B5A9]", q.type === "MULTIPLE_CHOICE" ? "rounded-[4px]" : "rounded-full")} />
                        )}
                        <input
                          value={o}
                          maxLength={200}
                          aria-label="Option"
                          onChange={(e) => update(q.id, { options: options.map((x, xi) => (xi === oi ? e.target.value : x)) })}
                          className="h-[38px] min-w-0 flex-1 border-0 border-b border-ev-line bg-transparent px-2.5 text-sm outline-none focus:border-ev-primary"
                        />
                        <button type="button" aria-label="Supprimer l'option" onClick={() => update(q.id, { options: options.filter((_, xi) => xi !== oi) })} className="flex size-[30px] items-center justify-center rounded-[8px] text-[#8A8F8B] hover:bg-ev-line">
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 pl-0 pt-1.5 text-[13px] sm:pl-[26px]">
                      <button type="button" disabled={options.length >= 30} onClick={() => update(q.id, { options: [...options, `Option ${options.length + 1}`] })} className="font-semibold text-ev-link">
                        + Ajouter une option
                      </button>
                      {!options.includes(OTHER) && (
                        <button type="button" onClick={() => update(q.id, { options: [...options, OTHER] })} className="text-ev-muted hover:text-ev-ink">
                          + Ajouter « Autre (préciser) »
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <AnswerPreview kind={q.type as QuestionKind} />
                )}
                <div className="flex justify-end gap-1 border-t border-ev-line pt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const copy = { ...q, id: newId(), options: q.options ? [...q.options] : undefined };
                      const next = [...questions];
                      next.splice(i + 1, 0, copy);
                      set({ questions: next });
                      setOpen(copy.id);
                    }}
                    className="flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] text-ev-ink2 hover:bg-ev-line"
                  >
                    <Copy className="size-4" />
                    Dupliquer
                  </button>
                  <button type="button" onClick={() => set({ questions: questions.filter((x) => x.id !== q.id) })} className="flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] text-ev-ink2 hover:bg-ev-line">
                    <Trash2 className="size-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-3 rounded-[14px] border-[1.5px] border-dashed border-ev-dash p-[18px]">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="text-sm font-semibold">Ajouter une question</span>
          <span className="text-xs text-ev-muted">
            ou{" "}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="font-semibold text-ev-link">
                  partir d&apos;un modèle
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`${EV_PORTAL} rounded-xl`}>
                {TEMPLATES.map((t, i) => (
                  <DropdownMenuItem key={t.label} onClick={() => fromTemplate(i)}>
                    {t.label} · {t.questions.length} questions
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>{" "}
            (profil, attentes, satisfaction)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {QUESTION_KINDS.map((k) => (
            <button
              key={k.kind}
              type="button"
              disabled={questions.length >= 50}
              onClick={() => add(k.kind)}
              className="flex h-11 items-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface px-2.5 text-left text-xs font-medium text-ev-ink hover:bg-ev-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex size-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F1EFE9] text-ev-ink2 dark:bg-ev-line">
                <KindIcon kind={k.kind} />
              </span>
              <span className="min-w-0 truncate">{k.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function AnswerPreview({ kind }: { kind: QuestionKind }) {
  const box = "rounded-[10px] border border-dashed border-ev-border bg-ev-soft px-3 text-sm text-ev-muted";
  switch (kind) {
    case "RATING_SCALE":
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className="flex size-9 items-center justify-center rounded-[8px] border border-ev-border text-sm text-ev-ink2">
              {n}
            </span>
          ))}
        </div>
      );
    case "PARAGRAPH":
      return <div className={cn(box, "h-20 py-2.5")}>Réponse longue</div>;
    case "YES_NO":
      return (
        <div className="flex gap-2">
          {["Oui", "Non"].map((l) => (
            <span key={l} className="flex h-9 items-center rounded-[8px] border border-ev-border px-4 text-sm text-ev-ink2">
              {l}
            </span>
          ))}
        </div>
      );
    case "STAR_RATING":
      return <div className="text-xl tracking-[4px] text-ev-amber">★★★★★</div>;
    case "NUMBER":
      return <div className={cn(box, "flex h-10 w-40 items-center")}>Nombre</div>;
    case "DATE":
      return <div className={cn(box, "flex h-10 w-40 items-center")}>jj/mm/aaaa</div>;
    default:
      return <div className={cn(box, "flex h-10 items-center")}>Réponse courte</div>;
  }
}

// Interrupteur 44 × 26 des en-têtes de section.
export function BigSwitch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative h-[26px] w-11 shrink-0 rounded-full transition-colors disabled:opacity-50", checked ? "bg-ev-primary" : "bg-[#D9D6CC] dark:bg-ev-dash")}
    >
      <span className={cn("absolute top-[3px] size-5 rounded-full bg-white shadow-sm transition-all", checked ? "left-[21px]" : "left-[3px]")} />
    </button>
  );
}
