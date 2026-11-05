"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EvButton, EvHr, EvSectionTitle, EvSwitch, EV_PORTAL } from "@/components/events/ev-ui";
import { amount, formatEventDay, formulaColor } from "@/lib/event-meta";
import { TEMPLATE_CATEGORIES, TICKET_TEMPLATES, defaultTemplateFor, getTicketTemplate } from "@/lib/ticket-templates";
import { cn } from "@/lib/utils";
import { capacityOf, newId, potentialOf, type EditorForm, type EditorFormula } from "./editor-model";
import { KIND_LABEL, TicketMini } from "./ticket-design";

type Props = { form: EditorForm; set: (patch: Partial<EditorForm>) => void; eventId: string | null };

const CATEGORIES = ["Tous", ...TEMPLATE_CATEGORIES] as const;
type Category = (typeof CATEGORIES)[number];

const SWATCHES = [
  { label: "Couleur du modèle", bg: "#0C4A3A" },
  { label: "Couleurs de l'affiche", bg: "#13343A" },
  { label: "Or", bg: "#C79A3B" },
  { label: "Nuit", bg: "#1F3A68" },
  { label: "Sur mesure", bg: "conic-gradient(#C2547A, #E39A1F, #0F8A64, #2C5BA8, #C2547A)" },
];

type Draft = { name: string; price: string; quantity: string; description: string; saleEndsAt: string; maxPerOrder: string; visible: boolean };

const toDraft = (f: EditorFormula): Draft => ({
  name: f.name,
  price: f.price ? String(Math.round(f.price / 100)) : "0",
  quantity: String(f.quantity || ""),
  description: f.description ?? "",
  saleEndsAt: f.saleEndsAt ? f.saleEndsAt.slice(0, 10) : "",
  maxPerOrder: f.maxPerOrder ? String(f.maxPerOrder) : "10",
  visible: f.visible ?? true,
});

const digits = (v: string) => Number(v.replace(/\D/g, "") || 0);

export function StepTickets({ form, set, eventId }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  // Formule ajoutée et pas encore validée : « Annuler » la retire.
  const [fresh, setFresh] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("Tous");
  const [page, setPage] = useState(() => {
    const idx = TICKET_TEMPLATES.findIndex((t) => t.id === form.ticketTemplate);
    return idx >= 0 ? Math.floor(idx / 4) : 0;
  });

  const capacity = capacityOf(form);
  const firstPrice = form.formulas[0]?.price ?? 500_000;

  function startEdit(f: EditorFormula) {
    setEditing(f.id);
    setDraft(toDraft(f));
  }

  function addFormula(preset?: Partial<EditorFormula>) {
    const f: EditorFormula = {
      id: newId("tt"),
      eventId: eventId ?? "",
      name: preset?.name ?? `Pass ${form.formulas.length === 0 ? "Standard" : `n° ${form.formulas.length + 1}`}`,
      price: preset?.price ?? 0,
      quantity: preset?.quantity ?? 50,
      sold: 0,
      description: preset?.description ?? "",
      saleEndsAt: preset?.saleEndsAt ?? null,
      visible: true,
    };
    set({ formulas: [...form.formulas, f] });
    setFresh(f.id);
    startEdit(f);
  }

  function saveDraft() {
    if (!draft || !editing) return;
    const current = form.formulas.find((f) => f.id === editing);
    if (!current) return;
    const quantity = digits(draft.quantity);
    if (draft.name.trim().length < 2) return toast.error("Nom de la formule : 2 caractères minimum.");
    if (quantity < 1) return toast.error("Indiquez le nombre de places.");
    if (quantity < current.sold) return toast.error(`Impossible : ${current.sold} place(s) déjà vendue(s).`);
    const next: EditorFormula = {
      ...current,
      name: draft.name.trim(),
      price: digits(draft.price) * 100,
      quantity,
      description: draft.description.trim() || null,
      saleEndsAt: draft.saleEndsAt ? new Date(`${draft.saleEndsAt}T23:59:00`).toISOString() : null,
      maxPerOrder: digits(draft.maxPerOrder) || undefined,
      visible: draft.visible,
    };
    set({ formulas: form.formulas.map((f) => (f.id === editing ? next : f)) });
    setEditing(null);
    setDraft(null);
    setFresh(null);
  }

  function cancelDraft() {
    if (fresh && fresh === editing) set({ formulas: form.formulas.filter((f) => f.id !== fresh) });
    setEditing(null);
    setDraft(null);
    setFresh(null);
  }

  function remove(f: EditorFormula) {
    if (f.sold > 0) return toast.error("Des billets de cette formule ont été vendus : elle ne peut pas être supprimée.");
    set({ formulas: form.formulas.filter((x) => x.id !== f.id) });
  }

  function duplicate(f: EditorFormula) {
    const copy: EditorFormula = { ...f, id: newId("tt"), name: `${f.name} (copie)`, sold: 0 };
    set({ formulas: [...form.formulas, copy] });
  }

  const presets: [string, Partial<EditorFormula>][] = [
    [
      "Early bird",
      {
        name: "Early bird",
        price: Math.round((firstPrice * 0.7) / 10_000) * 10_000,
        quantity: 20,
        description: "Tarif réduit pour les premiers inscrits",
        saleEndsAt: form.startDay ? new Date(new Date(`${form.startDay}T23:59:00`).getTime() - 7 * 86_400_000).toISOString() : null,
      },
    ],
    ["Étudiant", { name: "Étudiant", price: Math.round((firstPrice * 0.5) / 10_000) * 10_000, quantity: 30, description: "Sur présentation de la carte étudiante" }],
    ["Table VIP", { name: "Table VIP", price: firstPrice * 5, quantity: 10, description: "Table réservée pour 6 personnes" }],
    ["Invitation gratuite", { name: "Invitation", price: 0, quantity: 20, description: "Accès sur invitation" }],
  ];

  const list = category === "Tous" ? TICKET_TEMPLATES : TICKET_TEMPLATES.filter((t) => t.category === category);
  const pages = Math.max(1, Math.ceil(list.length / 4));
  const safePage = Math.min(page, pages - 1);
  const pageItems = list.slice(safePage * 4, safePage * 4 + 4);
  const current = getTicketTemplate(form.ticketTemplate);
  const suggested = getTicketTemplate(defaultTemplateFor(form.eventType ?? undefined));
  const sampleFormula = form.formulas[form.formulas.length > 1 ? 1 : 0];
  const title = form.title || "Votre événement";
  const meta = form.startDay ? `${formatEventDay(`${form.startDay}T${form.startTime || "00:00"}`).replace(/ \d{4}$/, "")} · ${form.startTime}${sampleFormula ? ` · ${amount(sampleFormula.price)} F` : ""}` : undefined;

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col gap-3.5">
        <EvSectionTitle
          title="Formules de pass"
          sub="Les formules s'affichent sur la vitrine dans cet ordre."
          right={
            <div className="flex shrink-0 gap-5 text-[13px] text-ev-muted">
              <span>
                Jauge <b className="text-ev-ink">{capacity} places</b>
              </span>
              <span>
                Potentiel <b className="text-ev-ink">{amount(potentialOf(form))} F</b>
              </span>
            </div>
          }
        />

        {form.formulas.length === 0 && (
          <p className="rounded-[12px] border border-dashed border-ev-dash p-5 text-center text-[13px] text-ev-muted">Aucune formule : ajoutez-en une pour ouvrir la billetterie.</p>
        )}

        {form.formulas.map((f, i) =>
          editing === f.id && draft ? (
            <div key={f.id} className="overflow-hidden rounded-[12px] border-[1.5px] border-ev-primary">
              <div className="flex items-center gap-3.5 border-b border-[#D5E6DE] bg-ev-selected px-4 py-3.5 dark:border-ev-border">
                <span className="h-[34px] w-1 rounded-[3px]" style={{ background: formulaColor(i) }} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm font-semibold">{draft.name || "Nouvelle formule"}</span>
                  <span className="text-xs text-ev-muted">
                    Modification en cours{f.sold > 0 ? ` · ${f.sold} vendu${f.sold > 1 ? "s" : ""}` : ""}
                  </span>
                </div>
                <span className="text-[15px] font-semibold">{digits(draft.price).toLocaleString("fr-FR")} F</span>
              </div>
              <div className="grid grid-cols-2 gap-3.5 px-4 py-[18px] sm:grid-cols-4">
                <label className="col-span-2 flex flex-col gap-1.5 text-[13px] font-medium">
                  Nom
                  <input value={draft.name} maxLength={80} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="h-[42px] rounded-[10px] border border-ev-border bg-ev-surface px-3 font-normal outline-none focus:border-ev-primary" />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                  Prix
                  <span className="flex h-[42px] items-center overflow-hidden rounded-[10px] border border-ev-border focus-within:border-ev-primary">
                    <input inputMode="numeric" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value.replace(/[^\d\s]/g, "") })} className="h-full min-w-0 flex-1 border-0 bg-ev-surface px-3 font-normal outline-none" />
                    <span className="flex h-full items-center border-l border-ev-border bg-ev-soft px-2.5 text-xs text-ev-muted">F</span>
                  </span>
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                  Places
                  <input inputMode="numeric" value={draft.quantity} onChange={(e) => setDraft({ ...draft, quantity: e.target.value.replace(/\D/g, "") })} className="h-[42px] rounded-[10px] border border-ev-border bg-ev-surface px-3 font-normal outline-none focus:border-ev-primary" />
                </label>
                <label className="col-span-2 flex flex-col gap-1.5 text-[13px] font-medium">
                  Avantages inclus
                  <input value={draft.description} maxLength={300} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Accès, boisson, place assise…" className="h-[42px] rounded-[10px] border border-ev-border bg-ev-surface px-3 font-normal outline-none focus:border-ev-primary" />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                  <span>Fin des ventes</span>
                  <input type="date" value={draft.saleEndsAt} max={form.startDay} onChange={(e) => setDraft({ ...draft, saleEndsAt: e.target.value })} className="h-[42px] rounded-[10px] border border-ev-border bg-ev-surface px-2.5 font-normal outline-none focus:border-ev-primary" />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                  <span>Max. par commande</span>
                  <input inputMode="numeric" value={draft.maxPerOrder} onChange={(e) => setDraft({ ...draft, maxPerOrder: e.target.value.replace(/\D/g, "") })} className="h-[42px] rounded-[10px] border border-ev-border bg-ev-surface px-3 font-normal outline-none focus:border-ev-primary" />
                </label>
                <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-ev-line pt-3 sm:col-span-4">
                  <span className="flex items-center gap-2.5 text-[13px]">
                    <EvSwitch checked={draft.visible} ariaLabel="Visible sur la vitrine" onChange={(v) => setDraft({ ...draft, visible: v })} />
                    Visible sur la vitrine
                  </span>
                  <div className="flex gap-2">
                    <EvButton size="sm" onClick={cancelDraft}>
                      Annuler
                    </EvButton>
                    <EvButton size="sm" variant="primary" onClick={saveDraft}>
                      Valider la formule
                    </EvButton>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div key={f.id} className="flex items-center gap-3.5 rounded-[12px] border border-ev-border px-4 py-3.5">
              <span className="h-[34px] w-1 shrink-0 rounded-[3px]" style={{ background: formulaColor(i) }} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-semibold">{f.name}</span>
                <span className="truncate text-xs text-ev-muted">
                  {[f.description, `${f.quantity} places`, `${f.sold} vendu${f.sold > 1 ? "s" : ""}`].filter(Boolean).join(" · ")}
                </span>
              </div>
              <span className="shrink-0 text-[15px] font-semibold">{f.price === 0 ? "Gratuit" : `${amount(f.price)} F`}</span>
              <button type="button" aria-label={`Modifier ${f.name}`} onClick={() => startEdit(f)} className="flex size-[34px] shrink-0 items-center justify-center rounded-[8px] border border-ev-border bg-ev-surface text-ev-ink2 hover:bg-ev-soft">
                <Pencil className="size-4" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label="Plus d'actions : dupliquer, supprimer" className="flex size-[34px] shrink-0 items-center justify-center rounded-[8px] text-ev-ink2 hover:bg-ev-line">
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`${EV_PORTAL} rounded-xl`}>
                  <DropdownMenuItem onClick={() => duplicate(f)}>Dupliquer</DropdownMenuItem>
                  <DropdownMenuItem className="text-ev-danger focus:text-ev-danger" onClick={() => remove(f)}>
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => addFormula()} className="flex h-[38px] items-center gap-2 rounded-[10px] border border-dashed border-[#B9CFC5] bg-[#F7FAF8] px-3.5 text-[13px] font-semibold text-ev-primary hover:bg-ev-mint dark:border-ev-dash dark:bg-ev-soft dark:text-ev-link">
            <Plus className="size-4" />
            Nouvelle formule
          </button>
          <span className="mx-1 text-xs text-ev-muted">ou partir de :</span>
          {presets.map(([label, p]) => (
            <button key={label} type="button" onClick={() => addFormula(p)} className="h-8 rounded-full border border-ev-border bg-ev-surface px-3 text-xs hover:bg-ev-soft">
              {label}
            </button>
          ))}
        </div>
      </section>

      <EvHr />

      <section className="flex flex-col gap-4">
        <EvSectionTitle title="Modèle du billet" sub="Appliqué à toutes les formules. Envoyé par e-mail et WhatsApp après paiement." />
        <div role="tablist" aria-label="Catégories de modèles" className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const sel = c === category;
            const n = c === "Tous" ? TICKET_TEMPLATES.length : TICKET_TEMPLATES.filter((t) => t.category === c).length;
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={sel}
                onClick={() => {
                  setCategory(c);
                  setPage(0);
                }}
                className={cn("h-8 rounded-full border px-3 text-[13px] font-medium", sel ? "border-ev-primary bg-ev-primary text-white" : "border-ev-border bg-ev-surface text-ev-ink2 hover:bg-ev-soft")}
              >
                {c} <span className="opacity-70">{n}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div role="radiogroup" aria-label="Modèle de billet" className="grid auto-rows-[176px] grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
              {pageItems.map((t) => {
                const sel = t.id === form.ticketTemplate;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={sel}
                    onClick={() => set({ ticketTemplate: t.id })}
                    className={cn("relative flex flex-col gap-2 rounded-[12px] p-1.5 text-left", sel ? "border-2 border-ev-primary bg-ev-selected" : "border border-ev-border bg-ev-surface hover:bg-ev-soft")}
                  >
                    <span className="flex flex-1 items-center justify-center overflow-hidden rounded-[8px] bg-[#F1EFE9]">
                      <TicketMini id={t.id} title={title} formula={form.formulas[0]?.name ?? "Pass Standard"} price={form.formulas[0] ? `${amount(form.formulas[0].price)} F` : undefined} />
                    </span>
                    <span className="flex items-center justify-between px-1 pb-0.5">
                      <span className="flex flex-col gap-px">
                        <span className="text-[13px] font-semibold">{t.label}</span>
                        <span className="text-[11px] text-ev-muted">
                          {t.category} · {KIND_LABEL[t.layout]}
                        </span>
                      </span>
                      {sel && <CheckCircle2 className="size-[18px] fill-ev-primary text-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-3">
              <button type="button" aria-label="4 modèles précédents" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className="flex size-[38px] items-center justify-center rounded-[10px] border border-ev-border bg-ev-surface text-ev-ink disabled:text-[#A8A497]">
                <ChevronLeft className="size-4" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  {Array.from({ length: pages }, (_, i) => (
                    <button key={i} type="button" aria-label={`Page ${i + 1}`} onClick={() => setPage(i)} className="h-2 rounded-full transition-all" style={{ width: i === safePage ? 20 : 8, background: i === safePage ? "var(--ev-primary)" : "#D9D6CC" }} />
                  ))}
                </div>
                <span className="text-xs text-ev-muted">
                  {safePage * 4 + 1}–{Math.min(list.length, safePage * 4 + 4)} sur {list.length}
                </span>
              </div>
              <button type="button" aria-label="4 modèles suivants" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)} className="flex size-[38px] items-center justify-center rounded-[10px] border border-ev-border bg-ev-surface text-ev-ink disabled:text-[#A8A497]">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2.5 rounded-[14px] border border-ev-line bg-ev-soft p-4 lg:w-[300px]">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-semibold">Aperçu</span>
              <span className="text-xs text-ev-muted">{current.label}</span>
            </div>
            <div className="flex min-h-[200px] flex-1 items-center justify-center overflow-hidden rounded-[10px] bg-ev-line">
              <div className="origin-center scale-[1.35] sm:scale-[1.7]">
                <TicketMini large id={current.id} title={title} formula={sampleFormula?.name ?? "Pass Standard"} meta={meta} price={form.ticketShowPrice && sampleFormula ? `${amount(sampleFormula.price)} F` : undefined} />
              </div>
            </div>
            <span className="text-xs leading-normal text-ev-muted">
              {current.category} · {KIND_LABEL[current.layout]}
              {form.eventType ? ` · suggéré pour ce type d'événement : ${suggested.category}` : ""}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6 rounded-[12px] border border-ev-line bg-ev-soft px-4 py-3.5 text-[13px]">
          <div className="flex items-center gap-2.5">
            <span className="font-medium">Couleur</span>
            <div role="radiogroup" aria-label="Couleur principale" className="flex gap-2">
              {SWATCHES.map((k, i) => {
                const isCustom = i === SWATCHES.length - 1;
                const active = isCustom
                  ? !SWATCHES.slice(0, -1).some((s) => s.bg === form.ticketColor)
                  : form.ticketColor === k.bg;
                return (
                  <button
                    key={k.label}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={k.label}
                    title={k.label}
                    onClick={() => {
                      if (isCustom) {
                        const c = window.prompt("Code couleur hexadécimal (#RRGGBB)", form.ticketColor);
                        if (c && /^#[0-9A-Fa-f]{6}$/.test(c.trim())) set({ ticketColor: c.trim() });
                      } else {
                        set({ ticketColor: k.bg });
                      }
                    }}
                    className="size-[26px] rounded-full p-0"
                    style={{
                      background: k.bg,
                      boxShadow: active ? "0 0 0 2px #FFFFFF, 0 0 0 4px #0C4A3A" : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>
          <span className="flex items-center gap-2">
            Prix <EvSwitch checked={form.ticketShowPrice} onChange={(v) => set({ ticketShowPrice: v })} ariaLabel="Afficher le prix" />
          </span>
          <span className="flex items-center gap-2">
            Logo <EvSwitch checked={form.ticketShowLogo} onChange={(v) => set({ ticketShowLogo: v })} ariaLabel="Logo de l'organisateur" />
          </span>
        </div>
      </section>
    </div>
  );
}
