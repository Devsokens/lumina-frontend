"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EV_PORTAL, EvButton, EvCard, EvProgress } from "@/components/events/ev-ui";
import { amount, formulaColor, operatorOf, pct } from "@/lib/event-meta";
import { cn } from "@/lib/utils";
import type { ApiEvent, ApiTicket, EventStats } from "@/types/events";
import { useEventResponses } from "@/hooks/useEvents";
import { QuestionVisualsLibrary } from "./question-visuals-library";
import { QuestionnaireResults, demoQuestionnaire } from "./questionnaire-results";

type Props = {
  event: ApiEvent;
  stats?: EventStats;
  tickets: ApiTicket[];
};

const DEMO_SALES = [
  2, 4, 5, 8, 10, 11, 14, 17, 19, 20, 22, 25, 29, 31, 33, 36, 40, 44, 47, 51, 55, 58, 61, 64,
];

export function TabStats({ event, stats, tickets }: Props) {
  const validTickets = useMemo(
    () => tickets.filter((t) => t.status === "VALID" || t.status === "USED"),
    [tickets]
  );

  // Bascule entre données réelles et données de démonstration
  const [demoMode, setDemoMode] = useState(validTickets.length === 0);
  const [period, setPeriod] = useState<"ALL" | "30D" | "7D">("ALL");
  const [formulaFilter, setFormulaFilter] = useState<string>("ALL");
  const [visualsLibraryOpen, setVisualsLibraryOpen] = useState(false);

  // Questionnaire d'inscription : réponses réelles (une par commande), ou
  // démonstration construite sur les questions de l'événement.
  const responsesQuery = useEventResponses(event.id);
  const questionnaireEnabled = event.settings?.questionnaireEnabled ?? false;
  const questionnaire = useMemo(() => {
    const questions = event.settings?.questionnaire ?? [];
    if (demoMode) return demoQuestionnaire(questions, event.ticketTypes.map((t) => t.name));
    const responses = responsesQuery.data?.responses ?? [];
    return {
      // Questionnaire désactivé sans réponse enregistrée : rien à afficher.
      questions: questionnaireEnabled || responses.length ? questions : [],
      responses,
      orders: responsesQuery.data?.orders ?? 0,
    };
  }, [demoMode, event.settings?.questionnaire, event.ticketTypes, questionnaireEnabled, responsesQuery.data]);

  const [nowMs] = useState(() => Date.now());

  // Filtrage des billets réels selon période + formule
  const filteredTickets = useMemo(() => {
    return validTickets.filter((t) => {
      if (formulaFilter !== "ALL" && t.ticketType.name !== formulaFilter) return false;
      if (period === "7D" && nowMs - new Date(t.createdAt).getTime() > 7 * 86_400_000) return false;
      if (period === "30D" && nowMs - new Date(t.createdAt).getTime() > 30 * 86_400_000) return false;
      return true;
    });
  }, [validTickets, formulaFilter, period, nowMs]);

  // Indicateurs clés (réels vs démo)
  const capacity = demoMode
    ? 80
    : event.capacity ?? (event.ticketTypes.reduce((s, t) => s + (t.quantity || 0), 0) || 80);

  const soldCount = demoMode ? 64 : stats?.issued ?? filteredTickets.length;
  const fillPct = pct(soldCount, capacity);
  const remainingSeats = Math.max(0, capacity - soldCount);

  const revenue = demoMode
    ? 24_000_000 // 240 000 F en centimes
    : stats?.revenue ?? filteredTickets.reduce((s, t) => s + (t.ticketType?.price ?? 0), 0);
  const potentialRevenue = demoMode
    ? 30_000_000 // 300 000 F en centimes
    : event.ticketTypes.reduce((s, t) => s + t.price * (t.quantity || 0), 0) || revenue;
  const revenuePct = pct(revenue, potentialRevenue);

  const scannedCount = demoMode
    ? 52
    : stats?.scanned ?? filteredTickets.filter((t) => t.status === "USED").length;
  const presencePct = demoMode ? 81 : pct(scannedCount, soldCount);

  const questionsCount = questionnaire.questions.length;
  const respondentsCount = questionnaire.responses.length;
  const responseRatePct = pct(respondentsCount, questionnaire.orders);

  // Courbe de ventes cumulées
  const { linePts, areaPath, yTicks, xLabels } = useMemo(() => {
    const W = 800;
    const H = 200;
    let series = demoMode ? DEMO_SALES : [0, 0];
    let maxVal = demoMode ? 80 : Math.max(capacity, 4);
    let labels = demoMode ? ["4 nov.", "10 nov.", "16 nov.", "22 nov.", "27 nov."] : ["Ouverture", "Aujourd'hui"];

    if (!demoMode && filteredTickets.length > 0) {
      maxVal = Math.max(capacity, filteredTickets.length, 4);
      const sorted = [...filteredTickets].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const byDay = new Map<string, number>();
      let running = 0;
      for (const t of sorted) {
        const d = new Date(t.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        });
        running += 1;
        byDay.set(d, running);
      }
      const entries = Array.from(byDay.entries());
      if (entries.length === 1) {
        series = [0, entries[0][1]];
        labels = ["Ouverture", entries[0][0]];
      } else {
        series = entries.map((e) => e[1]);
        const step = Math.max(1, Math.floor((entries.length - 1) / 4));
        labels = [
          entries[0][0],
          entries[Math.min(step, entries.length - 1)][0],
          entries[Math.min(step * 2, entries.length - 1)][0],
          entries[Math.min(step * 3, entries.length - 1)][0],
          entries[entries.length - 1][0],
        ];
      }
    }

    const pts = series.map((v, i) => [
      (i / Math.max(1, series.length - 1)) * W,
      H - Math.min(1, v / maxVal) * H,
    ]);
    const lPts = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    const aPath = `M0,${H} L${pts
      .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
      .join(" L")} L${W},${H} Z`;
    const stepY = Math.round(maxVal / 4);
    const ticks = [maxVal, stepY * 3, stepY * 2, stepY, 0];

    return { linePts: lPts, areaPath: aPath, yTicks: ticks, xLabels: labels };
  }, [demoMode, filteredTickets, capacity]);

  // Répartition par formule
  const formulaBreakdown = useMemo(() => {
    if (demoMode) {
      return [
        { name: "Standard", count: 40, pct: 63, width: 62.5, color: "#0F8A64" },
        { name: "VIP · Carré Or", count: 24, pct: 37, width: 37.5, color: "#E39A1F" },
      ];
    }
    const statsByType = new Map(stats?.ticketTypes.map((t) => [t.ticketTypeId, t]));
    const rows = event.ticketTypes.map((t, i) => {
      const count = statsByType.get(t.id)?.issued ?? t.sold;
      return { name: t.name, count, color: formulaColor(i) };
    });
    const sum = rows.reduce((s, r) => s + r.count, 0) || 1;
    return rows.map((r) => ({
      ...r,
      pct: Math.round((r.count / sum) * 100),
      width: (r.count / sum) * 100,
    }));
  }, [demoMode, event.ticketTypes, stats]);

  // Répartition par opérateur Mobile Money
  const paymentBreakdown = useMemo(() => {
    if (demoMode) {
      return [
        { name: "Airtel Money", count: 46, pct: 72, width: 72, color: "#0C4A3A" },
        { name: "Moov Money", count: 18, pct: 28, width: 28, color: "#2C5BA8" },
      ];
    }
    // Données réelles sans vente : rien à répartir.
    if (filteredTickets.length === 0) return [];
    let airtel = 0;
    let moov = 0;
    let other = 0;
    for (const t of filteredTickets) {
      const op = operatorOf(t.customerPhone);
      if (op === "Airtel Money") airtel += 1;
      else if (op === "Moov Money") moov += 1;
      else other += 1;
    }
    const sum = airtel + moov + other || 1;
    const list = [
      {
        name: "Airtel Money",
        count: airtel,
        pct: Math.round((airtel / sum) * 100),
        width: (airtel / sum) * 100,
        color: "#0C4A3A",
      },
      {
        name: "Moov Money",
        count: moov,
        pct: Math.round((moov / sum) * 100),
        width: (moov / sum) * 100,
        color: "#2C5BA8",
      },
    ];
    if (other > 0) {
      list.push({
        name: "Autre / Espèces",
        count: other,
        pct: Math.round((other / sum) * 100),
        width: (other / sum) * 100,
        color: "#8FC7AE",
      });
    }
    return list;
  }, [demoMode, filteredTickets]);

  // Entrées le jour J par tranche de 30 min
  const checkinsData = useMemo(() => {
    const demoSlots: [string, number][] = [
      ["08:00", 4],
      ["08:30", 12],
      ["09:00", 18],
      ["09:30", 11],
      ["10:00", 5],
      ["10:30", 2],
    ];
    const scanned = filteredTickets.filter((t) => t.scannedAt);
    // Données réelles sans entrée scannée : graphique vide.
    if (!demoMode && scanned.length === 0) return { peak: null, slots: [] };
    if (demoMode) {
      return {
        peak: "09:00",
        slots: demoSlots.map(([label, v]) => ({
          label,
          v,
          h: Math.round((v / 18) * 82),
          fill: v === 18 ? "#0C4A3A" : "#8FC7AE",
        })),
      };
    }
    const bucket = new Map<string, number>();
    for (const t of scanned) {
      const d = new Date(t.scannedAt!);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = d.getMinutes() < 30 ? "00" : "30";
      const key = `${hh}:${mm}`;
      bucket.set(key, (bucket.get(key) ?? 0) + 1);
    }
    const entries = Array.from(bucket.entries()).sort(([a], [b]) => a.localeCompare(b));
    const maxV = Math.max(...entries.map(([, v]) => v), 1);
    const peakEntry = entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best), entries[0]);
    return {
      peak: peakEntry[0],
      slots: entries.map(([label, v]) => ({
        label,
        v,
        h: Math.round((v / maxV) * 82),
        fill: v === maxV ? "#0C4A3A" : "#8FC7AE",
      })),
    };
  }, [demoMode, filteredTickets]);

  const periodLabel =
    period === "ALL"
      ? "depuis l'ouverture"
      : period === "30D"
        ? "30 derniers jours"
        : "7 derniers jours";

  return (
    <main className="flex flex-col gap-5">
      {/* Barre supérieure de filtres */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-[38px] items-center gap-1.5 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] text-ev-ink hover:bg-ev-soft"
              >
                Période : {periodLabel}
                <ChevronDown className="size-3.5 text-ev-muted" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={`${EV_PORTAL} w-52 rounded-xl`}>
              <DropdownMenuItem onClick={() => setPeriod("ALL")}>
                Depuis l&apos;ouverture
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("30D")}>
                30 derniers jours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("7D")}>
                7 derniers jours
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-[38px] items-center gap-1.5 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] text-ev-ink hover:bg-ev-soft"
              >
                Formule : {formulaFilter === "ALL" ? "toutes" : formulaFilter}
                <ChevronDown className="size-3.5 text-ev-muted" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={`${EV_PORTAL} w-52 rounded-xl`}>
              <DropdownMenuItem onClick={() => setFormulaFilter("ALL")}>
                Toutes les formules
              </DropdownMenuItem>
              {event.ticketTypes.map((t) => (
                <DropdownMenuItem key={t.id} onClick={() => setFormulaFilter(t.name)}>
                  {t.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={() => setDemoMode((v) => !v)}
            title="Basculer entre les données de démonstration et les données réelles de l'événement"
            className={cn(
              "inline-flex h-[26px] items-center rounded-full px-2.5 text-xs transition-colors",
              demoMode
                ? "bg-ev-line font-medium text-ev-ink2"
                : "border border-ev-border bg-ev-surface text-ev-muted hover:bg-ev-soft"
            )}
          >
            {demoMode ? "Données de démonstration" : "Données réelles · voir la démo"}
          </button>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => setVisualsLibraryOpen(true)}
            className="inline-flex h-[38px] flex-1 items-center justify-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] font-medium text-ev-ink hover:bg-ev-soft sm:flex-none"
          >
            Bibliothèque de visuels
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-[38px] flex-1 items-center justify-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] font-medium text-ev-ink hover:bg-ev-soft sm:flex-none"
          >
            <Download className="size-4" />
            Exporter le rapport (PDF)
          </button>
        </div>
      </div>

      {/* 4 cartes d'indicateurs clés */}
      <section
        aria-label="Indicateurs clés"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        <EvCard className="flex flex-col gap-2 p-4 sm:gap-2.5 sm:p-5">
          <span className="text-xs text-ev-muted sm:text-[13px]">Billets vendus</span>
          <span className="text-[22px] font-semibold tracking-[-0.02em] sm:text-[30px]">
            {soldCount}{" "}
            <span className="text-[13px] font-medium text-ev-muted sm:text-[15px]">/ {capacity}</span>
          </span>
          <EvProgress value={fillPct} height={6} />
          <span className="text-xs text-ev-muted">
            {fillPct} % de remplissage · {remainingSeats} place
            {remainingSeats > 1 ? "s" : ""} restante{remainingSeats > 1 ? "s" : ""}
          </span>
        </EvCard>

        <EvCard className="flex flex-col gap-2 p-4 sm:gap-2.5 sm:p-5">
          <span className="text-xs text-ev-muted sm:text-[13px]">Recettes encaissées</span>
          <span className="text-[22px] font-semibold tracking-[-0.02em] sm:text-[30px]">
            {amount(revenue)} <span className="text-[13px] font-medium text-ev-muted sm:text-[15px]">F</span>
          </span>
          <EvProgress value={revenuePct} height={6} />
          <span className="text-xs text-ev-muted">
            {revenuePct} % du potentiel ({amount(potentialRevenue)} F)
          </span>
        </EvCard>

        <EvCard className="flex flex-col gap-2 p-4 sm:gap-2.5 sm:p-5">
          <span className="text-xs text-ev-muted sm:text-[13px]">Taux de présence</span>
          <span className="text-[22px] font-semibold tracking-[-0.02em] sm:text-[30px]">{presencePct} %</span>
          <EvProgress value={presencePct} height={6} />
          <span className="text-xs text-ev-muted">
            {scannedCount} scanné{scannedCount > 1 ? "s" : ""} sur {soldCount} billet
            {soldCount > 1 ? "s" : ""}
          </span>
        </EvCard>

        <EvCard className="flex flex-col gap-2 p-4 sm:gap-2.5 sm:p-5">
          <span className="text-xs text-ev-muted sm:text-[13px]">Taux de réponse au questionnaire</span>
          <span className="text-[22px] font-semibold tracking-[-0.02em] sm:text-[30px]">{responseRatePct} %</span>
          <EvProgress value={responseRatePct} height={6} />
          <span className="text-xs text-ev-muted">
            {respondentsCount} répondant{respondentsCount > 1 ? "s" : ""} · {questionsCount}{" "}
            question{questionsCount > 1 ? "s" : ""}
          </span>
        </EvCard>
      </section>

      {/* Ventes cumulées (2/3) + Répartition des ventes (1/3) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EvCard className="flex flex-col gap-4 p-4 sm:p-[22px] lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="m-0 text-[15px] font-semibold">Ventes cumulées</h2>
            <span className="text-xs text-ev-muted">Billets · par jour</span>
          </div>

          <div className="relative flex h-[240px] gap-2.5">
            <div className="flex w-[22px] flex-col justify-between pb-[22px] text-right text-[11px] text-ev-muted">
              {yTicks.map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="relative flex-1 border-b border-[#D9D6CC]">
                <div className="absolute inset-0 flex flex-col justify-between">
                  <span className="border-t border-dashed border-[#B9B5A9]" />
                  <span className="border-t border-[#F1EFE9]" />
                  <span className="border-t border-[#F1EFE9]" />
                  <span className="border-t border-[#F1EFE9]" />
                  <span />
                </div>
                <span className="absolute -top-[9px] right-0 bg-ev-surface pl-1.5 text-[11px] text-ev-muted">
                  Capacité {capacity}
                </span>
                <svg
                  viewBox="0 0 800 200"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Courbe des ventes cumulées"
                  className="absolute inset-0 size-full overflow-visible"
                >
                  <path d={areaPath} fill="#0F8A64" fillOpacity="0.08" />
                  <polyline
                    points={linePts}
                    fill="none"
                    stroke="#0F8A64"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className="absolute -right-1 size-[9px] rounded-full bg-[#0F8A64] shadow-[0_0_0_2px_#FFFFFF]"
                  style={{
                    top: `${Math.max(0, Math.min(92, Math.round((1 - soldCount / Math.max(capacity, 1)) * 180)))}px`,
                  }}
                />
                <span className="absolute right-3 top-[46px] text-xs font-semibold">
                  {soldCount} billet{soldCount > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-ev-muted">
                {xLabels.map((lbl, i) => (
                  <span key={i}>{lbl}</span>
                ))}
              </div>
            </div>
          </div>
        </EvCard>

        <EvCard className="flex flex-col gap-[22px] p-4 sm:p-[22px]">
          <h2 className="m-0 text-[15px] font-semibold">Répartition des ventes</h2>

          {/* Par formule */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[13px] text-ev-muted">Par formule</span>
            <div className="flex h-3.5 gap-0.5 overflow-hidden rounded-[4px]">
              {formulaBreakdown.map((f) => (
                <div
                  key={f.name}
                  title={`${f.name} : ${f.count}`}
                  style={{ width: `${f.width}%`, background: f.color }}
                />
              ))}
            </div>
            <div className="flex flex-col gap-1.5 text-[13px]">
              {formulaBreakdown.map((f) => (
                <div key={f.name} className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-[2px]"
                    style={{ background: f.color }}
                  />
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="font-semibold">{f.count}</span>
                  <span className="w-11 text-right text-ev-muted">{f.pct} %</span>
                </div>
              ))}
            </div>
          </div>

          {/* Par moyen de paiement */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[13px] text-ev-muted">Par moyen de paiement</span>
            {paymentBreakdown.length === 0 && <span className="text-[13px] text-ev-muted">Aucune vente pour l&apos;instant.</span>}
            <div className="flex h-3.5 gap-0.5 overflow-hidden rounded-[4px]">
              {paymentBreakdown.map((p) => (
                <div
                  key={p.name}
                  title={`${p.name} : ${p.count}`}
                  style={{ width: `${p.width}%`, background: p.color }}
                />
              ))}
            </div>
            <div className="flex flex-col gap-1.5 text-[13px]">
              {paymentBreakdown.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-[2px]"
                    style={{ background: p.color }}
                  />
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="font-semibold">{p.count}</span>
                  <span className="w-11 text-right text-ev-muted">{p.pct} %</span>
                </div>
              ))}
            </div>
          </div>
        </EvCard>
      </div>

      {/* Entrées le jour J */}
      <EvCard className="flex flex-col gap-4 p-4 sm:p-[22px]">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="m-0 text-[15px] font-semibold">Entrées le jour J</h2>
          <span className="text-xs text-ev-muted">
            {checkinsData.peak ? `Scans par tranche de 30 min · pic à ${checkinsData.peak}` : "Aucune entrée scannée pour l'instant"}
          </span>
        </div>
        <div className="flex h-40 items-end gap-2 border-b border-[#D9D6CC] px-1 sm:gap-[18px] sm:px-2">
          {checkinsData.slots.map((c) => (
            <div
              key={c.label}
              title={`${c.label} : ${c.v} entrées`}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="text-xs font-semibold">{c.v}</span>
              <div
                className="w-full max-w-[64px] rounded-t-[4px]"
                style={{ height: `${c.h}%`, background: c.fill }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 px-1 text-[10px] text-ev-muted sm:gap-[18px] sm:px-2 sm:text-[11px]">
          {checkinsData.slots.map((c) => (
            <span key={c.label} className="flex-1 text-center">
              {c.label}
            </span>
          ))}
        </div>
      </EvCard>

      <QuestionnaireResults data={questionnaire} enabled={questionnaireEnabled} demo={demoMode} loading={!demoMode && responsesQuery.isLoading} />

      {/* Modale 5b · Bibliothèque de visuels par type de question */}
      <Dialog open={visualsLibraryOpen} onOpenChange={setVisualsLibraryOpen}>
        <DialogContent className={`${EV_PORTAL} max-h-[90vh] max-w-[95vw] overflow-y-auto bg-ev-bg p-6 sm:max-w-[1200px]`}>
          <DialogHeader className="sr-only">
            <DialogTitle>Un visuel par type de question</DialogTitle>
            <DialogDescription>
              Bibliothèque des 12 visuels statistiques adaptés à chaque type de question.
            </DialogDescription>
          </DialogHeader>
          <QuestionVisualsLibrary />
          <DialogFooter>
            <EvButton onClick={() => setVisualsLibraryOpen(false)}>Fermer</EvButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
