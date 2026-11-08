"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Download, Search, Star } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EV_PORTAL, EvButton, EvCard } from "@/components/events/ev-ui";
import { cn } from "@/lib/utils";
import type { QuestionnaireQuestion, QuestionType } from "@/types/api";
import type { AnswerValue, EventResponse } from "@/types/events";

// Résultats du questionnaire d'inscription (onglet Statistiques) : un bloc
// par question de l'événement, dont le visuel dépend du type de question.
// Une réponse par commande confirmée (GET /admin/events/:id/responses).

export type QuestionnaireData = { questions: QuestionnaireQuestion[]; responses: EventResponse[]; orders: number };

const PAL = ["#0F8A64", "#E39A1F", "#2C5BA8", "#C2547A", "#6B8E23", "#7A5BC2"];
const C = 2 * Math.PI * 60;

const TYPE_LABEL: Record<QuestionType, string> = {
  SINGLE_CHOICE: "CHOIX UNIQUE",
  MULTIPLE_CHOICE: "CHOIX MULTIPLES",
  DROPDOWN: "LISTE DÉROULANTE",
  YES_NO: "OUI / NON",
  RATING_SCALE: "ÉCHELLE 1–5",
  STAR_RATING: "NOTE EN ÉTOILES",
  NUMBER: "NOMBRE",
  DATE: "DATE",
  SHORT_TEXT: "TEXTE COURT",
  PARAGRAPH: "TEXTE LONG",
};

// Questions qu'on peut croiser avec la formule ou la présence.
const CROSSABLE: QuestionType[] = ["SINGLE_CHOICE", "DROPDOWN", "YES_NO"];

type Row = { label: string; n: number };

const filled = (v: AnswerValue | undefined): v is AnswerValue =>
  v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : typeof v === "number" ? Number.isFinite(v) : v.trim() !== "");

const share = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

function formatAnswer(q: QuestionnaireQuestion, v: AnswerValue): string {
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "number") return q.type === "RATING_SCALE" || q.type === "STAR_RATING" ? `${v} / 5` : v.toLocaleString("fr-FR");
  if (q.type === "DATE") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }
  return v;
}

// Choix : options dans l'ordre de l'éditeur, puis valeurs hors options.
function choiceRows(q: QuestionnaireQuestion, values: AnswerValue[]): Row[] {
  const counts = new Map<string, number>((q.type === "YES_NO" ? ["Oui", "Non"] : (q.options ?? [])).map((o) => [o, 0]));
  for (const v of values) for (const x of Array.isArray(v) ? v : [String(v)]) counts.set(x, (counts.get(x) ?? 0) + 1);
  return [...counts].map(([label, n]) => ({ label, n }));
}

// Textes courts : réponses identiques regroupées (casse et espaces ignorés).
function textRows(values: AnswerValue[]): Row[] {
  const groups = new Map<string, Row>();
  for (const v of values) {
    const label = String(v).trim();
    const key = label.toLocaleLowerCase("fr").replace(/\s+/g, " ");
    const g = groups.get(key);
    if (g) g.n += 1;
    else groups.set(key, { label, n: 1 });
  }
  return [...groups.values()].sort((a, b) => b.n - a.n);
}

function donut(rows: Row[]) {
  const total = rows.reduce((a, r) => a + r.n, 0) || 1;
  let acc = 0;
  return rows.map((r, i) => {
    const len = (r.n / total) * C;
    const item = { ...r, pct: share(r.n, total), color: PAL[i % PAL.length], dash: `${Math.max(len - 2.5, 0).toFixed(2)} ${C.toFixed(2)}`, off: (-acc).toFixed(2) };
    acc += len;
    return item;
  });
}

// ---------- Données de démonstration (bascule « Données de démonstration ») ----------

const DEMO_QUESTIONS: QuestionnaireQuestion[] = [
  { id: "d1", title: "Comment avez-vous découvert l'événement ?", type: "SINGLE_CHOICE", options: ["Réseaux sociaux", "WhatsApp / recommandation", "Bouche à oreille", "Affichage public"], isRequired: true },
  { id: "d2", title: "Qu'est-ce qui vous intéresse le plus ?", type: "MULTIPLE_CHOICE", options: ["Acquisition de compétences", "Networking & affaires", "Concert & ambiance live", "Dégustation VIP"], isRequired: false },
  { id: "d3", title: "Quelle est votre profession ?", type: "SHORT_TEXT", isRequired: false },
  { id: "d4", title: "Êtes-vous Gabonais(e) ?", type: "YES_NO", isRequired: true },
  { id: "d5", title: "Quel est votre niveau d'attente ?", type: "RATING_SCALE", isRequired: false },
  { id: "d6", title: "Votre tranche d'âge", type: "DROPDOWN", options: ["18–25 ans", "26–35 ans", "36–45 ans", "46 ans et +"], isRequired: false },
  { id: "d7", title: "Décrivez-vous en quelques mots", type: "PARAGRAPH", isRequired: false },
];
const DEMO_NAMES = ["Awa Mba", "Paul Obame", "Léa Nzé", "Junior Ondo", "Grâce Moussavou", "Cédric Ella", "Inès Mabika", "Hervé Ndong", "Sarah Boussougou", "Kevin Mintsa"];
const DEMO_JOBS = ["Étudiant(e)", "Comptable", "Entrepreneur(e)", "Ingénieur(e)", "Enseignant(e)", "Commerçant(e)", "Fonctionnaire", "Développeur(se)"];
const DEMO_TEXTS = [
  "Étudiant en management, je prépare le lancement d'une activité de livraison à Libreville.",
  "Responsable d'une association de jeunes, je veux renforcer mes compétences en gestion d'équipe.",
  "Ingénieure logiciel passionnée par la tech, je cherche un réseau de mentors et d'investisseurs.",
  "Fonctionnaire en reconversion vers l'entrepreneuriat agricole dans l'Estuaire.",
  "Photographe indépendant, je viens rencontrer des organisateurs et des marques.",
  "Je découvre l'événement grâce à une amie, j'aime la musique live et les rencontres.",
];

// Générateur pseudo-aléatoire déterministe : la démo reste identique d'un affichage à l'autre.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoQuestionnaire(questions: QuestionnaireQuestion[], ticketTypes: string[]): QuestionnaireData {
  const qs = questions.length ? questions : DEMO_QUESTIONS;
  const types = ticketTypes.length ? ticketTypes : ["Standard", "VIP"];
  const rand = rng(42);
  // Les premières options ressortent davantage, comme dans la réalité.
  const pick = <T,>(list: T[]) => {
    const weights = list.map((_, i) => 1 / (i + 1.2));
    let r = rand() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < list.length; i++) if ((r -= weights[i]) <= 0) return list[i];
    return list[list.length - 1];
  };
  const responses: EventResponse[] = Array.from({ length: 64 }, (_, i) => {
    const answers: Record<string, AnswerValue> = {};
    for (const q of qs) {
      if (!q.isRequired && rand() < 0.1) continue;
      const options = q.options?.length ? q.options : ["Option A", "Option B", "Option C"];
      switch (q.type) {
        case "SINGLE_CHOICE":
        case "DROPDOWN":
          answers[q.id] = pick(options);
          break;
        case "MULTIPLE_CHOICE":
          answers[q.id] = options.filter((_, j) => rand() < 0.75 / (j + 1) + 0.15);
          if (!(answers[q.id] as string[]).length) answers[q.id] = [options[0]];
          break;
        case "YES_NO":
          answers[q.id] = rand() < 0.86 ? "Oui" : "Non";
          break;
        case "RATING_SCALE":
        case "STAR_RATING":
          answers[q.id] = pick([5, 4, 3, 2, 1]);
          break;
        case "NUMBER":
          answers[q.id] = Math.round(18 + rand() * 30);
          break;
        case "DATE":
          answers[q.id] = `2026-12-${String(1 + Math.floor(rand() * 20)).padStart(2, "0")}`;
          break;
        case "PARAGRAPH":
          answers[q.id] = DEMO_TEXTS[i % DEMO_TEXTS.length];
          break;
        default:
          answers[q.id] = pick(DEMO_JOBS);
      }
    }
    return {
      id: `demo-${i}`,
      orderNumber: `EVT-DEMO-${String(i + 1).padStart(3, "0")}`,
      customerName: DEMO_NAMES[i % DEMO_NAMES.length],
      customerEmail: null,
      customerPhone: null,
      createdAt: new Date(Date.UTC(2026, 10, 1 + (i % 20))).toISOString(),
      answers,
      ticketTypes: [pick(types)],
      tickets: 1,
      checkedIn: rand() < 0.81,
    };
  });
  return { questions: qs, responses, orders: 70 };
}

// ---------- Export CSV ----------

// Séparateur « ; » et BOM : ouverture directe dans Excel en français. Une
// cellule qui commence par = + - @ est neutralisée (injection de formules).
function csvCell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

function exportCsv(questions: QuestionnaireQuestion[], responses: EventResponse[]) {
  const head = ["Commande", "Nom", "E-mail", "Téléphone", "Formules", "Billets", "Présent", "Date", ...questions.map((q) => q.title)];
  const rows = responses.map((r) => [
    r.orderNumber,
    r.customerName ?? "",
    r.customerEmail ?? "",
    r.customerPhone ?? "",
    r.ticketTypes.join(", "),
    String(r.tickets),
    r.checkedIn ? "Oui" : "Non",
    new Date(r.createdAt).toLocaleString("fr-FR"),
    ...questions.map((q) => (filled(r.answers[q.id]) ? formatAnswer(q, r.answers[q.id]) : "")),
  ]);
  const csv = "﻿" + [head, ...rows].map((line) => line.map(csvCell).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "reponses-questionnaire.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- Composant ----------

export function QuestionnaireResults({
  data,
  enabled,
  demo,
  loading,
}: {
  data: QuestionnaireData;
  // Questionnaire activé dans l'éditeur (sinon, message d'activation).
  enabled: boolean;
  demo: boolean;
  loading?: boolean;
}) {
  const { questions, responses, orders } = data;
  const [crossWith, setCrossWith] = useState<"NONE" | "FORMULA" | "PRESENCE">("NONE");
  const crossable = questions.filter((q) => CROSSABLE.includes(q.type));
  const [crossId, setCrossId] = useState<string | null>(null);
  const crossQuestion = crossable.find((q) => q.id === crossId) ?? crossable[0] ?? null;
  const [individualOpen, setIndividualOpen] = useState(false);
  const [search, setSearch] = useState("");

  if (!questions.length) {
    return (
      <EvCard className="mt-4 flex flex-col gap-2 p-5 sm:p-6">
        <h2 className="m-0 text-xl font-semibold tracking-[-0.01em]">Résultats du questionnaire</h2>
        <p className="m-0 max-w-[620px] text-sm leading-relaxed text-ev-muted">
          {enabled
            ? "Le questionnaire est activé mais ne contient aucune question. Ajoutez-en dans Modifier l'événement › Questionnaire."
            : "Aucun questionnaire pour cet événement. Activez-le dans Modifier l'événement › Questionnaire : les réponses des inscrits s'afficheront ici, question par question."}
        </p>
      </EvCard>
    );
  }

  const shown = search.trim()
    ? responses.filter((r) =>
        [r.customerName ?? "", ...Object.values(r.answers).map((v) => (Array.isArray(v) ? v.join(" ") : String(v)))]
          .join(" ")
          .toLocaleLowerCase("fr")
          .includes(search.trim().toLocaleLowerCase("fr"))
      )
    : responses;

  return (
    <>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-xl font-semibold tracking-[-0.01em]">Résultats du questionnaire</h2>
          <span className="text-[13px] text-ev-muted">
            {loading
              ? "Chargement des réponses…"
              : `${responses.length} répondant${responses.length > 1 ? "s" : ""} sur ${orders} inscription${orders > 1 ? "s" : ""} · une réponse par commande${demo ? " · données de démonstration" : ""}`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {crossable.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] text-ev-ink hover:bg-ev-soft"
                >
                  Croiser avec : {crossWith === "NONE" ? "aucun" : crossWith === "FORMULA" ? "formule" : "présence"}
                  <ChevronDown className="size-3.5 text-ev-muted" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`${EV_PORTAL} w-52 rounded-xl`}>
                <DropdownMenuItem onClick={() => setCrossWith("NONE")}>Aucun</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCrossWith("FORMULA")}>Formule de billet</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCrossWith("PRESENCE")}>Présence le jour J</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button
            type="button"
            disabled={!responses.length}
            onClick={() => setIndividualOpen(true)}
            className="h-9 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] font-medium text-ev-ink hover:bg-ev-soft disabled:opacity-50"
          >
            Réponses individuelles
          </button>
          <button
            type="button"
            disabled={demo || !responses.length}
            title={demo ? "Export disponible avec les données réelles" : undefined}
            onClick={() => exportCsv(questions, responses)}
            className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] font-medium text-ev-ink hover:bg-ev-soft disabled:opacity-50"
          >
            <Download className="size-3.5" /> Exporter (CSV)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {questions.map((q, i) => (
          <QuestionCard key={q.id} index={i + 1} question={q} responses={responses} onAll={() => setIndividualOpen(true)} />
        ))}
        {crossWith !== "NONE" && crossQuestion && (
          <CrossCard
            question={crossQuestion}
            questions={crossable}
            onQuestion={setCrossId}
            responses={responses}
            by={crossWith}
          />
        )}
      </div>

      <Dialog open={individualOpen} onOpenChange={setIndividualOpen}>
        <DialogContent className={`${EV_PORTAL} sm:max-w-[680px]`}>
          <DialogHeader>
            <DialogTitle>Réponses individuelles</DialogTitle>
            <DialogDescription>
              {responses.length} réponse{responses.length > 1 ? "s" : ""} au questionnaire d&apos;inscription, une par commande.
            </DialogDescription>
          </DialogHeader>
          <label className="flex h-9 items-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-ev-muted">
            <Search className="size-4 shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un nom ou une réponse"
              aria-label="Rechercher dans les réponses"
              className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-ev-ink outline-none placeholder:text-ev-muted"
            />
          </label>
          <div className="flex max-h-[420px] flex-col gap-2.5 overflow-y-auto pr-1">
            {shown.length === 0 && <p className="m-0 py-6 text-center text-sm text-ev-muted">Aucune réponse ne correspond.</p>}
            {shown.map((r) => (
              <article key={r.id} className="flex flex-col gap-2 rounded-[12px] border border-ev-border bg-ev-bg p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-ev-muted">
                  <span className="text-[13px] font-semibold text-ev-ink">{r.customerName || "Sans nom"}</span>
                  <span>
                    {r.ticketTypes.join(", ")} · {r.tickets} billet{r.tickets > 1 ? "s" : ""} · {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    {r.checkedIn ? " · présent" : ""}
                  </span>
                </div>
                <dl className="m-0 grid gap-1.5 text-[13px]">
                  {questions
                    .filter((q) => filled(r.answers[q.id]))
                    .map((q) => (
                      <div key={q.id} className="grid gap-0.5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-3">
                        <dt className="text-ev-muted">{q.title}</dt>
                        <dd className="m-0 text-ev-ink2">{formatAnswer(q, r.answers[q.id])}</dd>
                      </div>
                    ))}
                </dl>
              </article>
            ))}
          </div>
          <DialogFooter>
            <EvButton onClick={() => setIndividualOpen(false)}>Fermer</EvButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Une carte par question ----------

function CardHead({ index, question, answered, total, children }: { index: number; question: QuestionnaireQuestion; answered: number; total: number; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">{TYPE_LABEL[question.type] ?? "QUESTION"}</span>
        <h3 className="m-0 text-[15px] font-semibold">
          Q{index} · {question.title}
          {question.isRequired && <span className="text-ev-muted"> *</span>}
        </h3>
        <span className="text-xs text-ev-muted">
          {answered} réponse{answered > 1 ? "s" : ""} · {share(answered, total)} %
        </span>
      </div>
      {children}
    </div>
  );
}

function QuestionCard({ index, question: q, responses, onAll }: { index: number; question: QuestionnaireQuestion; responses: EventResponse[]; onAll: () => void }) {
  const values = useMemo(() => responses.map((r) => r.answers[q.id]).filter(filled), [responses, q.id]);
  const [view, setView] = useState<"pie" | "bars" | "table" | "list">(q.type === "MULTIPLE_CHOICE" || q.type === "SHORT_TEXT" ? "bars" : "pie");
  const [search, setSearch] = useState("");
  const answered = values.length;
  const wide = q.type === "PARAGRAPH";
  const empty = <p className="m-0 rounded-[10px] bg-ev-bg px-3.5 py-6 text-center text-[13px] text-ev-muted">Pas encore de réponse à cette question.</p>;

  let body: React.ReactNode = empty;
  let switcher: React.ReactNode = null;

  if (answered > 0) {
    switch (q.type) {
      case "SINGLE_CHOICE":
      case "DROPDOWN": {
        const rows = choiceRows(q, values);
        switcher = <ChartSwitch options={["pie", "bars", "table"]} value={view} onChange={(v) => setView(v as typeof view)} />;
        body = view === "pie" ? <Donut rows={rows} /> : view === "bars" ? <Bars rows={rows} total={answered} /> : <RowsTable rows={rows} total={answered} />;
        break;
      }
      case "MULTIPLE_CHOICE": {
        // % des répondants ayant coché chaque option.
        const rows = choiceRows(q, values).sort((a, b) => b.n - a.n);
        switcher = <ChartSwitch options={["bars", "table"]} value={view} onChange={(v) => setView(v as typeof view)} />;
        body = view === "table" ? <RowsTable rows={rows} total={answered} /> : <Bars rows={rows} total={answered} />;
        break;
      }
      case "YES_NO":
        body = <HalfDonut rows={choiceRows(q, values)} />;
        break;
      case "RATING_SCALE":
      case "STAR_RATING":
        body = <Scale values={values as number[]} stars={q.type === "STAR_RATING"} />;
        break;
      case "NUMBER":
        body = <Numbers values={values as number[]} />;
        break;
      case "DATE": {
        const rows = textRows(values)
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((r) => ({ ...r, label: formatAnswer(q, r.label) }));
        body = <Bars rows={rows.slice(0, 8)} total={answered} />;
        break;
      }
      case "PARAGRAPH": {
        const texts = values.map(String);
        const found = search.trim() ? texts.filter((t) => t.toLocaleLowerCase("fr").includes(search.trim().toLocaleLowerCase("fr"))) : texts;
        switcher = (
          <label className="flex h-9 w-full items-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-ev-muted sm:w-[260px]">
            <Search className="size-4 shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans les réponses"
              aria-label={`Rechercher dans les réponses à « ${q.title} »`}
              className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-ev-ink outline-none placeholder:text-ev-muted"
            />
          </label>
        );
        body = (
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-ev-muted">{search.trim() ? `${found.length} RÉPONSE${found.length > 1 ? "S" : ""} TROUVÉE${found.length > 1 ? "S" : ""}` : "RÉPONSES RÉCENTES"}</span>
            {found.length === 0 ? (
              <p className="m-0 text-xs text-ev-muted">Aucune réponse ne contient « {search} ».</p>
            ) : (
              <div className="grid gap-2.5 md:grid-cols-2">
                {found.slice(0, search.trim() ? 8 : 4).map((t, i) => (
                  <blockquote key={i} className="m-0 rounded-[10px] bg-ev-bg px-3.5 py-3 text-[13px] leading-[1.55] text-ev-ink2">
                    « {t} »
                  </blockquote>
                ))}
              </div>
            )}
            <button type="button" onClick={onAll} className="self-start border-0 bg-transparent p-0 text-[13px] font-semibold text-ev-link hover:underline">
              Voir les {answered} réponses
            </button>
          </div>
        );
        break;
      }
      default: {
        // Texte court : réponses regroupées, ou liste des dernières.
        const rows = textRows(values);
        switcher = <ChartSwitch options={["bars", "list"]} value={view} onChange={(v) => setView(v as typeof view)} />;
        body =
          view === "list" ? (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px]">
              {values.slice(0, 8).map((v, i) => (
                <li key={i} className="rounded-[8px] bg-ev-bg px-3 py-2 text-ev-ink2">
                  {String(v)}
                </li>
              ))}
            </ul>
          ) : (
            <Bars rows={rows.slice(0, 6)} total={answered} note={rows.length > 6 ? `+ ${rows.length - 6} autre${rows.length - 6 > 1 ? "s" : ""} réponse${rows.length - 6 > 1 ? "s" : ""} différente${rows.length - 6 > 1 ? "s" : ""}` : undefined} />
          );
      }
    }
  }

  return (
    <EvCard className={cn("flex flex-col gap-[18px] p-4 sm:p-[22px]", wide && "lg:col-span-2")}>
      <CardHead index={index} question={q} answered={answered} total={responses.length}>
        {answered > 0 && !wide && switcher}
      </CardHead>
      {wide && answered > 0 && switcher}
      {body}
    </EvCard>
  );
}

// ---------- Visuels ----------

function Legend({ rows }: { rows: ReturnType<typeof donut> }) {
  return (
    <ul className="m-0 flex w-full flex-1 list-none flex-col gap-3 p-0">
      {rows.map((l) => (
        <li key={l.label} className="flex items-center gap-2.5 text-[13px]">
          <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: l.color }} />
          <span className="min-w-0 flex-1 truncate">{l.label}</span>
          <span className="font-semibold">{l.pct} %</span>
          <span className="w-7 text-right text-ev-muted">{l.n}</span>
        </li>
      ))}
    </ul>
  );
}

function Donut({ rows }: { rows: Row[] }) {
  const d = donut(rows.filter((r) => r.n > 0));
  const top = [...d].sort((a, b) => b.n - a.n)[0];
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
      <div className="relative size-[176px] shrink-0">
        <svg width="176" height="176" viewBox="0 0 160 160" role="img" aria-label={d.map((s) => `${s.label} ${s.pct} %`).join(", ")}>
          <circle cx="80" cy="80" r="60" fill="none" stroke="#F1EFE9" strokeWidth="24" />
          {d.map((s) => (
            <circle key={s.label} cx="80" cy="80" r="60" fill="none" stroke={s.color} strokeWidth="24" strokeDasharray={s.dash} strokeDashoffset={s.off} transform="rotate(-90 80 80)" />
          ))}
        </svg>
        {top && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <span className="text-[26px] font-semibold">{top.pct} %</span>
            <span className="line-clamp-2 text-[11px] leading-tight text-ev-muted">{top.label}</span>
          </div>
        )}
      </div>
      <Legend rows={donut(rows)} />
    </div>
  );
}

function Bars({ rows, total, note }: { rows: Row[]; total: number; note?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className="flex flex-col gap-3.5">
      {rows.map((l, i) => (
        <div key={l.label} className="flex flex-col gap-1.5 text-[13px]">
          <div className="flex justify-between gap-3">
            <span className="min-w-0 truncate">{l.label}</span>
            <span className="shrink-0">
              <b>{share(l.n, total)} %</b> <span className="text-ev-muted">· {l.n}</span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-[4px] bg-[#F1EFE9] dark:bg-ev-line">
            <div className="h-full rounded-r-[4px]" style={{ width: `${Math.round((l.n / max) * 100)}%`, background: i === 0 && l.n === max ? "#0C4A3A" : "#0F8A64" }} />
          </div>
        </div>
      ))}
      {note && <span className="text-xs text-ev-muted">{note}</span>}
    </div>
  );
}

function RowsTable({ rows, total }: { rows: Row[]; total: number }) {
  return (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr className="text-left text-xs text-ev-muted">
          <th className="border-b border-ev-border pb-2 font-medium">Réponse</th>
          <th className="w-16 border-b border-ev-border pb-2 text-right font-medium">Nombre</th>
          <th className="w-14 border-b border-ev-border pb-2 text-right font-medium">%</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td className="border-b border-ev-line py-2">{r.label}</td>
            <td className="border-b border-ev-line py-2 text-right">{r.n}</td>
            <td className="border-b border-ev-line py-2 text-right font-semibold">{share(r.n, total)} %</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function HalfDonut({ rows }: { rows: Row[] }) {
  const total = rows.reduce((a, r) => a + r.n, 0) || 1;
  const yes = rows.find((r) => r.label === "Oui")?.n ?? 0;
  const no = rows.find((r) => r.label === "Non")?.n ?? 0;
  const halfC = Math.PI * 60;
  const yesArc = (yes / total) * halfC;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
      <div className="relative h-[124px] w-[220px] shrink-0">
        <svg width="220" height="124" viewBox="0 0 160 90" role="img" aria-label={`Oui ${share(yes, total)} %, Non ${share(no, total)} %`}>
          <circle cx="80" cy="80" r="60" fill="none" stroke="#F1EFE9" strokeWidth="22" strokeDasharray={`${halfC.toFixed(2)} ${C.toFixed(2)}`} transform="rotate(180 80 80)" />
          {yes > 0 && <circle cx="80" cy="80" r="60" fill="none" stroke="#0F8A64" strokeWidth="22" strokeDasharray={`${Math.max(yesArc - 1.5, 0).toFixed(2)} ${C.toFixed(2)}`} transform="rotate(180 80 80)" />}
          {no > 0 && (
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="none"
              stroke="#B9B5A9"
              strokeWidth="22"
              strokeDasharray={`${Math.max(halfC - yesArc - 1.5, 0).toFixed(2)} ${C.toFixed(2)}`}
              strokeDashoffset={(-(yesArc + 1.5)).toFixed(2)}
              transform="rotate(180 80 80)"
            />
          )}
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-[30px] font-semibold tracking-[-0.02em]">{share(yes, total)} %</span>
          <span className="text-[11px] text-ev-muted">répondent Oui</span>
        </div>
      </div>
      <ul className="m-0 flex w-full flex-1 list-none flex-col gap-3 p-0 text-[13px]">
        {[
          ["Oui", yes, "#0F8A64"],
          ["Non", no, "#B9B5A9"],
        ].map(([label, n, color]) => (
          <li key={label as string} className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-[3px]" style={{ background: color as string }} />
            <span className="flex-1">{label}</span>
            <b>{share(n as number, total)} %</b>
            <span className="w-7 text-right text-ev-muted">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Scale({ values, stars }: { values: number[]; stars: boolean }) {
  const counts = [5, 4, 3, 2, 1].map((n) => ({ n, v: values.filter((x) => x === n).length }));
  const max = Math.max(1, ...counts.map((c) => c.v));
  const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1);
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex shrink-0 flex-col items-center gap-1 sm:w-[140px]">
        <span className="text-[34px] font-semibold tracking-[-0.02em]">
          {avg.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}
          <span className="text-base font-medium text-ev-muted"> / 5</span>
        </span>
        {stars ? (
          <span className="flex gap-0.5" aria-hidden>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className={cn("size-4", n <= Math.round(avg) ? "fill-[#E39A1F] text-[#E39A1F]" : "text-ev-line")} />
            ))}
          </span>
        ) : (
          <span className="text-xs text-ev-muted">note moyenne</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {counts.map((c) => (
          <div key={c.n} className="flex items-center gap-3 text-[13px]">
            <span className="w-8 shrink-0 text-ev-muted">{stars ? `${c.n} ★` : c.n}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-[4px] bg-[#F1EFE9] dark:bg-ev-line">
              <div className="h-full rounded-r-[4px]" style={{ width: `${Math.round((c.v / max) * 100)}%`, background: c.n >= 4 ? "#0F8A64" : "#B9B5A9" }} />
            </div>
            <b className="w-7 shrink-0 text-right">{c.v}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function Numbers({ values }: { values: number[] }) {
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  // Histogramme : jusqu'à 6 tranches égales.
  const bins = Math.min(6, new Set(sorted).size);
  const width = (max - min) / bins || 1;
  const slots = Array.from({ length: bins }, (_, i) => {
    const from = min + i * width;
    const to = i === bins - 1 ? max : from + width;
    const v = sorted.filter((x) => x >= from && (i === bins - 1 ? x <= to : x < to)).length;
    const fmt = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
    return { label: bins === 1 ? fmt(from) : `${fmt(from)}–${fmt(to)}`, v };
  });
  const top = Math.max(1, ...slots.map((s) => s.v));
  const fmt = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          ["Min.", min],
          ["Moyenne", avg],
          ["Médiane", median],
          ["Max.", max],
        ].map(([label, n]) => (
          <div key={label as string} className="flex flex-col gap-0.5 rounded-[10px] bg-ev-bg px-2 py-2.5">
            <span className="text-[11px] text-ev-muted">{label}</span>
            <span className="text-base font-semibold">{fmt(n as number)}</span>
          </div>
        ))}
      </div>
      <div className="flex h-[110px] items-end gap-2">
        {slots.map((s) => (
          <div key={s.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[11px] font-semibold">{s.v}</span>
            <div className="w-full max-w-[56px] rounded-t-[4px]" style={{ height: `${Math.round((s.v / top) * 78)}%`, background: s.v === top ? "#0C4A3A" : "#8FC7AE" }} />
            <span className="w-full truncate text-center text-[10px] text-ev-muted">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Croisement ----------

function CrossCard({
  question,
  questions,
  onQuestion,
  responses,
  by,
}: {
  question: QuestionnaireQuestion;
  questions: QuestionnaireQuestion[];
  onQuestion: (id: string) => void;
  responses: EventResponse[];
  by: "FORMULA" | "PRESENCE";
}) {
  const answered = responses.filter((r) => filled(r.answers[question.id]));
  const groups = by === "PRESENCE" ? ["Entrés", "Non scannés"] : [...new Set(answered.flatMap((r) => r.ticketTypes))];
  const groupsOf = (r: EventResponse) => (by === "PRESENCE" ? [r.checkedIn ? "Entrés" : "Non scannés"] : r.ticketTypes);
  const rows = choiceRows(question, answered.map((r) => r.answers[question.id]))
    .filter((row) => row.n > 0)
    .map((row) => {
      const who = answered.filter((r) => String(r.answers[question.id]) === row.label);
      const parts = groups.map((g) => who.filter((r) => groupsOf(r).includes(g)).length);
      const sum = parts.reduce((a, b) => a + b, 0) || 1;
      return { label: row.label, n: who.length, parts: parts.map((v) => ({ v, w: Math.round((v / sum) * 100) })) };
    });
  return (
    <EvCard className="flex flex-col gap-[18px] p-4 sm:p-[22px] lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="self-start rounded-[6px] bg-ev-mint px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-primary dark:text-ev-link">CROISEMENT</span>
          <h3 className="m-0 text-[15px] font-semibold">
            {question.title} × {by === "FORMULA" ? "formule de billet" : "présence"}
          </h3>
          {questions.length > 1 && (
            <select
              value={question.id}
              onChange={(e) => onQuestion(e.target.value)}
              aria-label="Question croisée"
              className="h-8 max-w-[320px] rounded-[8px] border border-ev-border bg-ev-surface px-2 text-xs text-ev-ink"
            >
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-[13px]">
          {groups.map((g, i) => (
            <span key={g} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px]" style={{ background: PAL[i % PAL.length] }} />
              {g}
            </span>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="m-0 text-[13px] text-ev-muted">Pas encore de réponse à croiser.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((x) => (
            <div key={x.label} className="flex flex-col gap-1.5 text-[13px] sm:flex-row sm:items-center sm:gap-3.5">
              <div className="flex items-center justify-between sm:w-[230px]">
                <span className="truncate">{x.label}</span>
                <span className="text-xs text-ev-muted sm:hidden">{x.n} rép.</span>
              </div>
              <div className="flex h-[22px] w-full flex-1 gap-0.5 overflow-hidden rounded-[4px]" title={groups.map((g, i) => `${g} ${x.parts[i].v}`).join(" · ")}>
                {x.parts.map((p, i) =>
                  p.w > 0 ? (
                    <div key={i} style={{ width: `${p.w}%`, background: PAL[i % PAL.length] }} className="flex items-center overflow-hidden pl-2 text-[11px] font-semibold text-white">
                      {p.w >= 12 ? `${p.w} %` : ""}
                    </div>
                  ) : null
                )}
              </div>
              <span className="hidden w-10 text-right text-ev-muted sm:inline">{x.n}</span>
            </div>
          ))}
        </div>
      )}
    </EvCard>
  );
}

// ---------- Bascule de visuel ----------

export function ChartSwitch({ options, value, onChange }: { options: ("hist" | "pie" | "bars" | "table" | "list")[]; value: string; onChange: (v: string) => void }) {
  const icons: Record<string, { label: string; d: string }> = {
    hist: { label: "Histogramme", d: "M5 20V10M10 20V4M15 20v-8M20 20v-4" },
    pie: { label: "Secteurs", d: "M21 12A9 9 0 1 1 12 3v9z" },
    bars: { label: "Barres", d: "M4 6h12M4 12h16M4 18h8" },
    table: { label: "Tableau", d: "M3 10h18M9 10v10M3 5h18v15H3z" },
    list: { label: "Liste des réponses", d: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
  };
  return (
    <div role="group" aria-label="Type de graphique" className="flex shrink-0 rounded-[9px] bg-ev-line p-[3px]">
      {options.map((opt) => {
        const meta = icons[opt];
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            aria-label={meta.label}
            aria-pressed={active}
            onClick={() => onChange(opt)}
            className={cn("flex h-7 w-8 items-center justify-center rounded-[7px] border-0 transition-colors", active ? "bg-ev-surface text-ev-ink" : "bg-transparent text-ev-muted hover:text-ev-ink")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={meta.d} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
