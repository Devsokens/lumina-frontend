"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Download, Search } from "lucide-react";
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
import { QuestionVisualsLibrary } from "./question-visuals-library";

type Props = {
  event: ApiEvent;
  stats?: EventStats;
  tickets: ApiTicket[];
};

const PAL = ["#0F8A64", "#E39A1F", "#2C5BA8", "#C2547A", "#6B8E23"];
const C = 2 * Math.PI * 60;

type DonutRow = [string, number];

function buildDonut(rows: DonutRow[]) {
  const total = rows.reduce((a, r) => a + r[1], 0) || 1;
  let acc = 0;
  return rows.map(([label, n], i) => {
    const len = (n / total) * C;
    const item = {
      label,
      n,
      pctNum: Math.round((n / total) * 100),
      pct: `${Math.round((n / total) * 100)} %`,
      color: PAL[i % PAL.length],
      dash: `${Math.max(len - 2.5, 0).toFixed(2)} ${C.toFixed(2)}`,
      off: (-acc).toFixed(2),
    };
    acc += len;
    return item;
  });
}

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
  const [crossWith, setCrossWith] = useState<"NONE" | "FORMULA" | "PRESENCE">("FORMULA");

  // Vues par carte de question
  const [q1View, setQ1View] = useState<"pie" | "bars" | "table">("pie");
  const [q2View, setQ2View] = useState<"bars" | "table">("bars");
  const [q3View, setQ3View] = useState<"pie" | "list">("pie");
  const [q7View, setQ7View] = useState<"hist" | "pie" | "table">("hist");
  const [q5Search, setQ5Search] = useState("");

  const [visualsLibraryOpen, setVisualsLibraryOpen] = useState(false);
  const [individualOpen, setIndividualOpen] = useState(false);

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

  const questionsCount = event.settings?.questionnaire?.length || 7;
  const respondentsCount = demoMode ? 64 : soldCount;
  const responseRatePct = demoMode
    ? 100
    : event.settings?.questionnaireEnabled
      ? 100
      : 0;

  // Courbe de ventes cumulées
  const { linePts, areaPath, yTicks, xLabels } = useMemo(() => {
    const W = 800;
    const H = 200;
    let series = DEMO_SALES;
    let maxVal = 80;
    let labels = ["4 nov.", "10 nov.", "16 nov.", "22 nov.", "27 nov."];

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
    if (demoMode || event.ticketTypes.length === 0) {
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
    if (demoMode || filteredTickets.length === 0) {
      return [
        { name: "Airtel Money", count: 46, pct: 72, width: 72, color: "#0C4A3A" },
        { name: "Moov Money", count: 18, pct: 28, width: 28, color: "#2C5BA8" },
      ];
    }
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
    if (demoMode || scanned.length === 0) {
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

  // Données des questions du questionnaire (fidèles au design)
  const d1 = useMemo(
    () =>
      buildDonut([
        ["Réseaux sociaux (Instagram, TikTok)", 29],
        ["WhatsApp / recommandation", 20],
        ["Bouche à oreille", 10],
        ["Affichage public", 5],
      ]),
    []
  );

  const d3 = useMemo(
    () =>
      buildDonut([
        ["Étudiant(e)", 15],
        ["Salarié(e) du privé", 11],
        ["Entrepreneur(e)", 8],
        ["Fonction publique", 5],
        ["ONG / association", 2],
      ]),
    []
  );

  const halfC = Math.PI * 60;
  const yesArc = 0.89 * halfC;
  const half = {
    track: `${halfC.toFixed(2)} ${C.toFixed(2)}`,
    yes: `${(yesArc - 1.5).toFixed(2)} ${C.toFixed(2)}`,
    no: `${(halfC - yesArc - 1.5).toFixed(2)} ${C.toFixed(2)}`,
    noOff: (-(yesArc + 1.5)).toFixed(2),
  };

  const interets = [
    { label: "Acquisition de compétences", n: 50, pct: "78 %", w: 78 },
    { label: "Networking & affaires", n: 43, pct: "67 %", w: 67 },
    { label: "Concert & ambiance live", n: 22, pct: "34 %", w: 34 },
    { label: "Dégustation VIP", n: 14, pct: "22 %", w: 22 },
  ];

  const scaleRows = [
    { label: "5", v: 29, w: 100, fill: "#0F8A64" },
    { label: "4", v: 20, w: Math.round((20 / 29) * 100), fill: "#0F8A64" },
    { label: "3", v: 9, w: Math.round((9 / 29) * 100), fill: "#B9B5A9" },
    { label: "2", v: 4, w: Math.round((4 / 29) * 100), fill: "#B9B5A9" },
    { label: "1", v: 2, w: Math.round((2 / 29) * 100), fill: "#B9B5A9" },
  ];

  const ages = [
    { label: "18–21", v: 9 },
    { label: "22–25", v: 18 },
    { label: "26–30", v: 16 },
    { label: "31–35", v: 10 },
    { label: "36–40", v: 6 },
    { label: "41–45", v: 3 },
    { label: "46 +", v: 2 },
  ].map((a) => ({
    ...a,
    h: Math.round((a.v / 18) * 82),
    fill: a.v >= 16 ? "#0C4A3A" : "#8FC7AE",
  }));

  const themes = [
    { label: "Ambition / motivation", n: 21, w: 100 },
    { label: "Études en gestion", n: 14, w: Math.round((14 / 21) * 100) },
    { label: "Passion pour la tech", n: 12, w: Math.round((12 / 21) * 100) },
    { label: "Porteur de projet", n: 11, w: Math.round((11 / 21) * 100) },
    { label: "Engagement associatif", n: 7, w: Math.round((7 / 21) * 100) },
    { label: "Reconversion", n: 5, w: Math.round((5 / 21) * 100) },
  ];

  const allExcerpts = [
    "Étudiant en management, je prépare le lancement d'une activité de livraison à Libreville.",
    "Responsable d'une association de jeunes, je veux renforcer mes compétences en gestion d'équipe.",
    "Ingénieure logiciel passionnée par la tech, je cherche un réseau de mentors et d'investisseurs.",
    "Fonctionnaire en reconversion vers l'entrepreneuriat agricole dans l'Estuaire.",
  ];
  const filteredExcerpts = q5Search.trim()
    ? allExcerpts.filter((txt) => txt.toLowerCase().includes(q5Search.trim().toLowerCase()))
    : allExcerpts.slice(0, 2);

  const crossRows = [
    { label: "Réseaux sociaux", a: 21, b: 8 },
    { label: "WhatsApp / recommandation", a: 9, b: 11 },
    { label: "Bouche à oreille", a: 6, b: 4 },
    { label: "Affichage public", a: 4, b: 1 },
  ].map((r) => {
    const n = r.a + r.b;
    const wa = Math.round((r.a / n) * 100);
    const wb = 100 - wa;
    return { ...r, n, wa, wb, pa: `${wa} %`, pb: `${wb} %` };
  });

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
            Scans par tranche de 30 min · pic à {checkinsData.peak}
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

      {/* En-tête Résultats du questionnaire */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-xl font-semibold tracking-[-0.01em]">
            Résultats du questionnaire
          </h2>
          <span className="text-[13px] text-ev-muted">
            Un bloc par question · le visuel s&apos;adapte au type de question · 64 répondants
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] text-ev-ink hover:bg-ev-soft"
              >
                Croiser avec :{" "}
                {crossWith === "NONE"
                  ? "aucun"
                  : crossWith === "FORMULA"
                    ? "formule de pass"
                    : "présence"}
                <ChevronDown className="size-3.5 text-ev-muted" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`${EV_PORTAL} w-52 rounded-xl`}>
              <DropdownMenuItem onClick={() => setCrossWith("NONE")}>Aucun</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCrossWith("FORMULA")}>
                Formule de pass
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCrossWith("PRESENCE")}>
                Présence le jour J
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={() => setIndividualOpen(true)}
            className="h-9 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] font-medium text-ev-ink hover:bg-ev-soft"
          >
            Réponses individuelles
          </button>
        </div>
      </div>

      {/* Grille des cartes de résultats du questionnaire */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Q1 · Choix unique (Anneau) */}
        <EvCard className="flex flex-col gap-[18px] p-4 sm:p-[22px]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
                CHOIX UNIQUE
              </span>
              <h3 className="m-0 text-[15px] font-semibold">
                Q1 · Comment avez-vous découvert l&apos;événement ?
              </h3>
              <span className="text-xs text-ev-muted">64 réponses · 100 %</span>
            </div>
            <ChartSwitch
              options={["pie", "bars", "table"]}
              value={q1View}
              onChange={(v) => setQ1View(v as "pie" | "bars" | "table")}
            />
          </div>

          {q1View === "pie" && (
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
              <div className="relative size-[176px] shrink-0">
                <svg
                  width="176"
                  height="176"
                  viewBox="0 0 160 160"
                  role="img"
                  aria-label="Répartition des canaux d'acquisition"
                >
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#F1EFE9" strokeWidth="24" />
                  {d1.map((s) => (
                    <circle
                      key={s.label}
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="24"
                      strokeDasharray={s.dash}
                      strokeDashoffset={s.off}
                      transform="rotate(-90 80 80)"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[26px] font-semibold">45 %</span>
                  <span className="text-[11px] text-ev-muted">Réseaux sociaux</span>
                </div>
              </div>
              <ul className="m-0 flex w-full flex-1 list-none flex-col gap-3 p-0">
                {d1.map((l) => (
                  <li key={l.label} className="flex items-center gap-2.5 text-[13px]">
                    <span
                      className="size-2.5 shrink-0 rounded-[3px]"
                      style={{ background: l.color }}
                    />
                    <span className="flex-1">{l.label}</span>
                    <span className="font-semibold">{l.pct}</span>
                    <span className="w-7 text-right text-ev-muted">{l.n}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {q1View === "bars" && (
            <div className="flex flex-col gap-3.5">
              {d1.map((l) => (
                <div key={l.label} className="flex flex-col gap-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <span>{l.label}</span>
                    <span>
                      <b>{l.pct}</b> <span className="text-ev-muted">· {l.n}</span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-[4px] bg-[#F1EFE9]">
                    <div
                      className="h-full rounded-r-[4px]"
                      style={{ width: `${l.pctNum}%`, background: l.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {q1View === "table" && (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-ev-line text-left text-xs text-ev-muted">
                  <th className="py-2 font-medium">Option</th>
                  <th className="py-2 text-right font-medium">Réponses</th>
                  <th className="py-2 text-right font-medium">Part</th>
                </tr>
              </thead>
              <tbody>
                {d1.map((l) => (
                  <tr key={l.label} className="border-b border-ev-line last:border-b-0">
                    <td className="py-2.5">{l.label}</td>
                    <td className="py-2.5 text-right text-ev-muted">{l.n}</td>
                    <td className="py-2.5 text-right font-semibold">{l.pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </EvCard>

        {/* Q2 · Choix multiples (Barres) */}
        <EvCard className="flex flex-col gap-[18px] p-4 sm:p-[22px]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
                CHOIX MULTIPLES
              </span>
              <h3 className="m-0 text-[15px] font-semibold">
                Q2 · Principaux centres d&apos;intérêt
              </h3>
              <span className="text-xs text-ev-muted">
                64 répondants · 2,0 choix en moyenne
              </span>
            </div>
            <ChartSwitch
              options={["bars", "table"]}
              value={q2View}
              onChange={(v) => setQ2View(v as "bars" | "table")}
            />
          </div>

          {q2View === "bars" ? (
            <div className="flex flex-col gap-4">
              {interets.map((r) => (
                <div
                  key={r.label}
                  title={`${r.label} : ${r.n}`}
                  className="flex flex-col gap-1.5"
                >
                  <div className="flex justify-between text-[13px]">
                    <span>{r.label}</span>
                    <span>
                      <b>{r.pct}</b> <span className="text-ev-muted">· {r.n}</span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-[4px] bg-[#F1EFE9]">
                    <div
                      className="h-full rounded-r-[4px] bg-[#0F8A64]"
                      style={{ width: `${r.w}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-ev-line text-left text-xs text-ev-muted">
                  <th className="py-2 font-medium">Option</th>
                  <th className="py-2 text-right font-medium">Sélections</th>
                  <th className="py-2 text-right font-medium">% répondants</th>
                </tr>
              </thead>
              <tbody>
                {interets.map((r) => (
                  <tr key={r.label} className="border-b border-ev-line last:border-b-0">
                    <td className="py-2.5">{r.label}</td>
                    <td className="py-2.5 text-right text-ev-muted">{r.n}</td>
                    <td className="py-2.5 text-right font-semibold">{r.pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <span className="text-xs text-ev-muted">
            % des répondants · plusieurs choix possibles, le total dépasse 100 %.
          </span>
        </EvCard>

        {/* Q3 · Texte court regroupé */}
        <EvCard className="flex flex-col gap-[18px] p-4 sm:p-[22px]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
                TEXTE COURT · REGROUPÉ
              </span>
              <h3 className="m-0 text-[15px] font-semibold">Q3 · Poste et organisation</h3>
              <span className="text-xs text-ev-muted">
                41 réponses sur 64 · question facultative
              </span>
            </div>
            <ChartSwitch
              options={["pie", "list"]}
              value={q3View}
              onChange={(v) => setQ3View(v as "pie" | "list")}
            />
          </div>

          {q3View === "pie" ? (
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
              <div className="relative size-[176px] shrink-0">
                <svg
                  width="176"
                  height="176"
                  viewBox="0 0 160 160"
                  role="img"
                  aria-label="Profils professionnels"
                >
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#F1EFE9" strokeWidth="24" />
                  {d3.map((s) => (
                    <circle
                      key={s.label}
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="24"
                      strokeDasharray={s.dash}
                      strokeDashoffset={s.off}
                      transform="rotate(-90 80 80)"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[26px] font-semibold">41</span>
                  <span className="text-[11px] text-ev-muted">réponses</span>
                </div>
              </div>
              <ul className="m-0 flex w-full flex-1 list-none flex-col gap-3 p-0">
                {d3.map((l) => (
                  <li key={l.label} className="flex items-center gap-2.5 text-[13px]">
                    <span
                      className="size-2.5 shrink-0 rounded-[3px]"
                      style={{ background: l.color }}
                    />
                    <span className="flex-1">{l.label}</span>
                    <span className="font-semibold">{l.pct}</span>
                    <span className="w-7 text-right text-ev-muted">{l.n}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[13px]">
              {d3.map((l) => (
                <li
                  key={l.label}
                  className="flex items-center justify-between rounded-[8px] bg-ev-bg px-3 py-2"
                >
                  <span>{l.label}</span>
                  <span className="font-semibold">
                    {l.n} ({l.pct})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </EvCard>

        {/* Q4 · Oui / Non (Demi-anneau) */}
        <EvCard className="flex flex-col gap-[18px] p-4 sm:p-[22px]">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              OUI / NON
            </span>
            <h3 className="m-0 text-[15px] font-semibold">Q4 · Êtes-vous Gabonais(e) ?</h3>
            <span className="text-xs text-ev-muted">64 réponses · 100 %</span>
          </div>

          <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
            <div className="relative h-[124px] w-[220px] shrink-0">
              <svg
                width="220"
                height="124"
                viewBox="0 0 160 90"
                role="img"
                aria-label="Oui 89 %, Non 11 %"
              >
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#F1EFE9"
                  strokeWidth="22"
                  strokeDasharray={half.track}
                  transform="rotate(180 80 80)"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#0F8A64"
                  strokeWidth="22"
                  strokeDasharray={half.yes}
                  transform="rotate(180 80 80)"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#B9B5A9"
                  strokeWidth="22"
                  strokeDasharray={half.no}
                  strokeDashoffset={half.noOff}
                  transform="rotate(180 80 80)"
                />
              </svg>
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
                <span className="text-[30px] font-semibold tracking-[-0.02em]">89 %</span>
                <span className="text-[11px] text-ev-muted">répondent Oui</span>
              </div>
            </div>

            <ul className="m-0 flex w-full flex-1 list-none flex-col gap-3 p-0 text-[13px]">
              <li className="flex items-center gap-2.5">
                <span className="size-2.5 rounded-[3px] bg-[#0F8A64]" />
                <span className="flex-1">Oui</span>
                <b>89 %</b>
                <span className="w-7 text-right text-ev-muted">57</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-2.5 rounded-[3px] bg-[#B9B5A9]" />
                <span className="flex-1">Non</span>
                <b>11 %</b>
                <span className="w-7 text-right text-ev-muted">7</span>
              </li>
            </ul>
          </div>
        </EvCard>

        {/* Q6 · Échelle 1–5 */}
        <EvCard className="flex flex-col gap-[18px] p-4 sm:p-[22px]">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
              ÉCHELLE 1 – 5
            </span>
            <h3 className="m-0 text-[15px] font-semibold">
              Q6 · Niveau d&apos;envie d&apos;entreprendre
            </h3>
            <span className="text-xs text-ev-muted">64 réponses · 100 %</span>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex w-full shrink-0 flex-row items-baseline justify-between gap-2 sm:w-[150px] sm:flex-col sm:items-start sm:gap-1">
              <div>
                <span className="text-[38px] font-semibold leading-none tracking-[-0.03em] sm:text-[46px]">
                  4,1<span className="text-lg font-medium text-ev-muted"> / 5</span>
                </span>
                <span className="mt-1 block text-xs text-ev-muted">Moyenne · médiane 4</span>
              </div>
              <span className="text-[13px] sm:mt-2">
                <b>77 %</b> notent 4 ou 5
              </span>
            </div>
            <div className="flex w-full flex-1 flex-col gap-[9px]">
              {scaleRows.map((s) => (
                <div
                  key={s.label}
                  title={`Note ${s.label} : ${s.v}`}
                  className="flex items-center gap-2.5 text-xs"
                >
                  <span className="w-3 text-ev-muted">{s.label}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-[4px] bg-[#F1EFE9]">
                    <div
                      className="h-full rounded-r-[4px]"
                      style={{ width: `${s.w}%`, background: s.fill }}
                    />
                  </div>
                  <span className="w-6 text-right font-semibold">{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </EvCard>

        {/* Q7 · Choix unique ordonné (Tranche d'âge) */}
        <EvCard className="flex flex-col gap-4 p-4 sm:p-[22px]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
                CHOIX UNIQUE · ORDONNÉ
              </span>
              <h3 className="m-0 text-[15px] font-semibold">Q7 · Tranche d&apos;âge</h3>
              <span className="text-xs text-ev-muted">
                64 réponses · 53 % ont entre 22 et 30 ans
              </span>
            </div>
            <ChartSwitch
              options={["hist", "pie", "table"]}
              value={q7View}
              onChange={(v) => setQ7View(v as "hist" | "pie" | "table")}
            />
          </div>

          {q7View === "hist" ? (
            <>
              <div className="flex h-[150px] items-end gap-1.5 border-b border-[#D9D6CC] px-1 sm:gap-2.5">
                {ages.map((a) => (
                  <div
                    key={a.label}
                    title={`${a.label} : ${a.v}`}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                  >
                    <span className="text-xs font-semibold">{a.v}</span>
                    <div
                      className="w-full max-w-[44px] rounded-t-[4px]"
                      style={{ height: `${a.h}%`, background: a.fill }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 px-1 text-[10px] text-ev-muted sm:gap-2.5 sm:text-[11px]">
                {ages.map((a) => (
                  <span key={a.label} className="flex-1 text-center">
                    {a.label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-ev-line text-left text-xs text-ev-muted">
                  <th className="py-2 font-medium">Tranche d&apos;âge</th>
                  <th className="py-2 text-right font-medium">Réponses</th>
                  <th className="py-2 text-right font-medium">Part</th>
                </tr>
              </thead>
              <tbody>
                {ages.map((a) => (
                  <tr key={a.label} className="border-b border-ev-line last:border-b-0">
                    <td className="py-2">{a.label}</td>
                    <td className="py-2 text-right text-ev-muted">{a.v}</td>
                    <td className="py-2 text-right font-semibold">
                      {Math.round((a.v / 64) * 100)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </EvCard>

        {/* Q5 · Texte long (2 colonnes) */}
        <EvCard className="flex flex-col gap-[18px] p-4 sm:p-[22px] lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="self-start rounded-[6px] bg-ev-line px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-ink2">
                TEXTE LONG
              </span>
              <h3 className="m-0 text-[15px] font-semibold">Q5 · Décrivez-vous</h3>
              <span className="text-xs text-ev-muted">
                64 réponses · thèmes détectés automatiquement
              </span>
            </div>
            <label className="flex h-9 w-full items-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-ev-muted sm:w-[260px]">
              <Search className="size-4 shrink-0" />
              <input
                type="search"
                value={q5Search}
                onChange={(e) => setQ5Search(e.target.value)}
                placeholder="Rechercher dans les réponses"
                aria-label="Rechercher dans les réponses"
                className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-ev-ink outline-none placeholder:text-ev-muted"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              {themes.map((t) => (
                <div key={t.label} className="flex items-center gap-3 text-[13px]">
                  <span className="w-[140px] truncate sm:w-[170px]">{t.label}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-[4px] bg-[#F1EFE9]">
                    <div
                      className="h-full rounded-r-[4px] bg-[#0F8A64]"
                      style={{ width: `${t.w}%` }}
                    />
                  </div>
                  <b className="w-6 text-right">{t.n}</b>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-ev-muted">EXTRAITS RÉCENTS</span>
              {filteredExcerpts.length > 0 ? (
                filteredExcerpts.map((txt, idx) => (
                  <blockquote
                    key={idx}
                    className="m-0 rounded-[10px] bg-ev-bg px-3.5 py-3 text-[13px] leading-[1.55] text-ev-ink2"
                  >
                    « {txt} »
                  </blockquote>
                ))
              ) : (
                <p className="m-0 text-xs text-ev-muted">
                  Aucun extrait ne contient « {q5Search} ».
                </p>
              )}
              <button
                type="button"
                onClick={() => setIndividualOpen(true)}
                className="self-start border-0 bg-transparent p-0 text-[13px] font-semibold text-ev-link hover:underline"
              >
                Voir les 64 réponses
              </button>
            </div>
          </div>
        </EvCard>

        {/* Croisement Q1 × formule de pass */}
        {crossWith !== "NONE" && (
          <EvCard className="flex flex-col gap-[18px] p-4 sm:p-[22px] lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="self-start rounded-[6px] bg-ev-mint px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-ev-primary dark:text-ev-link">
                  CROISEMENT
                </span>
                <h3 className="m-0 text-[15px] font-semibold">
                  Canal d&apos;acquisition ×{" "}
                  {crossWith === "FORMULA" ? "formule de pass" : "présence"}
                </h3>
                <span className="text-xs text-ev-muted">
                  Q1 croisée avec{" "}
                  {crossWith === "FORMULA" ? "la formule achetée" : "l'entrée scannée"} · 100 % par
                  canal
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-[13px]">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-[3px] bg-[#0F8A64]" />
                  {crossWith === "FORMULA" ? "Standard" : "Entrés"}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-[3px] bg-[#E39A1F]" />
                  {crossWith === "FORMULA" ? "VIP · Carré Or" : "Non scannés"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {crossRows.map((x) => (
                <div
                  key={x.label}
                  className="flex flex-col gap-1.5 text-[13px] sm:flex-row sm:items-center sm:gap-3.5"
                >
                  <div className="flex items-center justify-between sm:w-[230px]">
                    <span className="truncate">{x.label}</span>
                    <span className="text-xs text-ev-muted sm:hidden">{x.n} rép.</span>
                  </div>
                  <div
                    title={`Standard ${x.a} · VIP ${x.b}`}
                    className="flex h-[22px] w-full flex-1 gap-0.5 overflow-hidden rounded-[4px]"
                  >
                    <div
                      style={{ width: `${x.wa}%` }}
                      className="flex items-center bg-[#0F8A64] pl-2 text-[11px] font-semibold text-white"
                    >
                      {x.pa}
                    </div>
                    <div
                      style={{ width: `${x.wb}%` }}
                      className="flex items-center bg-[#E39A1F] pl-2 text-[11px] font-semibold text-[#16211C]"
                    >
                      {x.pb}
                    </div>
                  </div>
                  <span className="hidden w-10 text-right text-ev-muted sm:inline">{x.n}</span>
                </div>
              ))}
            </div>
          </EvCard>
        )}
      </div>

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

      {/* Modale Réponses individuelles */}
      <Dialog open={individualOpen} onOpenChange={setIndividualOpen}>
        <DialogContent className={`${EV_PORTAL} sm:max-w-[640px]`}>
          <DialogHeader>
            <DialogTitle>Réponses individuelles</DialogTitle>
            <DialogDescription>
              Extraits des réponses enregistrées au questionnaire d&apos;inscription.
            </DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[380px] flex-col gap-2.5 overflow-y-auto pr-1">
            {allExcerpts.map((txt, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-1 rounded-[12px] border border-ev-border bg-ev-bg p-3.5"
              >
                <div className="flex items-center justify-between text-xs text-ev-muted">
                  <span className="font-semibold text-ev-ink">Répondant #{idx + 1}</span>
                  <span>Pass {idx % 2 === 0 ? "Standard" : "VIP · Carré Or"}</span>
                </div>
                <p className="m-0 text-[13px] leading-[1.55] text-ev-ink2">« {txt} »</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <EvButton onClick={() => setIndividualOpen(false)}>Fermer</EvButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function ChartSwitch({
  options,
  value,
  onChange,
}: {
  options: ("hist" | "pie" | "bars" | "table" | "list")[];
  value: string;
  onChange: (v: string) => void;
}) {
  const icons: Record<string, { label: string; d: string }> = {
    hist: { label: "Histogramme", d: "M5 20V10M10 20V4M15 20v-8M20 20v-4" },
    pie: { label: "Secteurs", d: "M21 12A9 9 0 1 1 12 3v9z" },
    bars: { label: "Barres", d: "M4 6h12M4 12h16M4 18h8" },
    table: { label: "Tableau", d: "M3 10h18M9 10v10M3 5h18v15H3z" },
    list: { label: "Liste des réponses", d: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
  };
  return (
    <div
      role="group"
      aria-label="Type de graphique"
      className="flex shrink-0 rounded-[9px] bg-ev-line p-[3px]"
    >
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
            className={cn(
              "flex h-7 w-8 items-center justify-center rounded-[7px] border-0 transition-colors",
              active ? "bg-ev-surface text-ev-ink" : "bg-transparent text-ev-muted hover:text-ev-ink"
            )}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={meta.d} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
