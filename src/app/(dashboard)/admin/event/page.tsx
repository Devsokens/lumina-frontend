"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Info,
  ChevronDown,
  Calendar,
  Ticket,
  Wallet,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function EventDashboardPage() {
  const [revenuePeriod, setRevenuePeriod] = useState<"Annuel" | "Mensuel" | "Hebdo">("Annuel");
  const [salesPeriod, setSalesPeriod] = useState<"Mensuel" | "Annuel">("Mensuel");
  const [historyPeriod, setHistoryPeriod] = useState<"24h" | "7j" | "30j">("24h");
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(7); // Default August

  const monthsData = [
    { label: "Jan", value: 31000, y: 155 },
    { label: "Fév", value: 20000, y: 195 },
    { label: "Mar", value: 30000, y: 160 },
    { label: "Avr", value: 20000, y: 195 },
    { label: "Mai", value: 12000, y: 225 },
    { label: "Juin", value: 22000, y: 188 },
    { label: "Juil", value: 32000, y: 150 },
    { label: "Août", value: 41500, y: 115 },
    { label: "Sep", value: 30000, y: 160 },
    { label: "Oct", value: 18000, y: 202 },
    { label: "Nov", value: 28000, y: 168 },
    { label: "Déc", value: 40000, y: 122 },
  ];

  const transactions = [
    {
      id: "TXN000000005416",
      date: "20 Juin 2026",
      method: "Airtel Money",
      status: "SUCCESS",
      amount: "15 200 FCFA",
    },
    {
      id: "TXN000000005415",
      date: "20 Juin 2026",
      method: "Moov Money",
      status: "SUCCESS",
      amount: "26 500 FCFA",
    },
    {
      id: "TXN000000005414",
      date: "20 Juin 2026",
      method: "Carte Visa",
      status: "PENDING",
      amount: "14 000 FCFA",
    },
    {
      id: "TXN000000005413",
      date: "19 Juin 2026",
      method: "Airtel Money",
      status: "FAILED",
      amount: "65 000 FCFA",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Events */}
        <Card className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground">Total Événements</p>
          <p className="font-display text-3xl font-extrabold text-foreground mt-2">550</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px]">
              <ArrowUpRight className="size-3" />
              10.23%
            </span>
            <span className="text-[11px] text-muted-foreground font-normal">vs mois dernier</span>
          </div>
        </Card>

        {/* Card 2: Total Tickets */}
        <Card className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground">Total Billets</p>
          <p className="font-display text-3xl font-extrabold text-foreground mt-2">35 000</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px]">
              <ArrowUpRight className="size-3" />
              20.50%
            </span>
            <span className="text-[11px] text-muted-foreground font-normal">vs mois dernier</span>
          </div>
        </Card>

        {/* Card 3: Total Revenue */}
        <Card className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground">Revenus Totaux</p>
          <p className="font-display text-3xl font-extrabold text-foreground mt-2">14 000 000 F</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px]">
              <ArrowUpRight className="size-3" />
              30.33%
            </span>
            <span className="text-[11px] text-muted-foreground font-normal">vs mois dernier</span>
          </div>
        </Card>

        {/* Card 4: Upcoming Events */}
        <Card className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground">Événements à Venir</p>
          <p className="font-display text-3xl font-extrabold text-foreground mt-2">150</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-500/15 px-1.5 py-0.5 text-[11px]">
              <ArrowDownRight className="size-3" />
              05.15%
            </span>
            <span className="text-[11px] text-muted-foreground font-normal">vs mois dernier</span>
          </div>
        </Card>
      </div>

      {/* 2. Middle Row: Revenue Statistics Curve (Left 8 cols) + Sales Donut (Right 4 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Revenue Statistics Chart */}
        <Card className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
            <h3 className="font-display text-lg font-bold text-foreground">
              Statistiques des Revenus
            </h3>

            <div className="relative">
              <select
                aria-label="Période des statistiques des revenus"
                value={revenuePeriod}
                onChange={(e) => setRevenuePeriod(e.target.value as any)}
                className="appearance-none rounded-xl border border-border bg-muted/40 px-3 py-1.5 pr-8 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Annuel">Annuel</option>
                <option value="Mensuel">Mensuel</option>
                <option value="Hebdo">Hebdomadaire</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* SVG Smooth Area & Spline Wave Chart */}
          <div className="relative h-64 w-full pt-2">
            {/* Background Grid Lines & Y-Axis Labels */}
            <div className="absolute inset-0 flex flex-col justify-between text-[11px] font-mono text-muted-foreground pointer-events-none">
              <div className="flex items-center justify-between border-b border-dashed border-border/50 pb-1">
                <span>50k</span>
              </div>
              <div className="flex items-center justify-between border-b border-dashed border-border/50 pb-1">
                <span>40k</span>
              </div>
              <div className="flex items-center justify-between border-b border-dashed border-border/50 pb-1">
                <span>30k</span>
              </div>
              <div className="flex items-center justify-between border-b border-dashed border-border/50 pb-1">
                <span>20k</span>
              </div>
              <div className="flex items-center justify-between border-b border-dashed border-border/50 pb-1">
                <span>10k</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-1">
                <span>0k</span>
              </div>
            </div>

            {/* SVG Wavy Path */}
            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 600 240"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Fill */}
              <path
                d="M 20,155 Q 60,195 100,160 T 180,195 T 260,188 T 340,150 T 420,115 T 480,160 T 540,168 T 580,122 L 580,240 L 20,240 Z"
                fill="url(#revenueGrad)"
              />

              {/* Smooth Stroke Line */}
              <path
                d="M 20,155 Q 60,195 100,160 T 180,195 T 260,188 T 340,150 T 420,115 T 480,160 T 540,168 T 580,122"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* August Active Marker Guide Line & Dot */}
              <line
                x1="400"
                y1="115"
                x2="400"
                y2="240"
                stroke="#0ea5e9"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle cx="400" cy="115" r="5" fill="#0ea5e9" stroke="#ffffff" strokeWidth="2.5" />
            </svg>

            {/* Floating August Tooltip exactly like Mockup */}
            <div className="absolute left-[64%] top-[14%] -translate-x-1/2 rounded-xl bg-black/90 dark:bg-black/95 px-3 py-2 text-center text-white shadow-xl pointer-events-none z-10 border border-white/10 backdrop-blur-md">
              <p className="text-[10px] text-white/70 font-medium">Août 2026</p>
              <p className="font-mono text-xs font-bold text-white">41 500 000 F</p>
            </div>
          </div>

          {/* X-Axis Months */}
          <div className="mt-4 flex justify-between px-2 text-[11px] font-medium text-muted-foreground">
            {monthsData.map((m, idx) => (
              <span
                key={m.label}
                className={idx === 7 ? "font-bold text-sky-500" : ""}
              >
                {m.label}
              </span>
            ))}
          </div>
        </Card>

        {/* Right: Sales Statistics Donut Chart */}
        <Card className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs lg:col-span-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-2">
            <h3 className="font-display text-lg font-bold text-foreground">
              Statistiques des Ventes
            </h3>

            <div className="relative">
              <select
                aria-label="Période des statistiques des ventes"
                value={salesPeriod}
                onChange={(e) => setSalesPeriod(e.target.value as any)}
                className="appearance-none rounded-xl border border-border bg-muted/40 px-3 py-1.5 pr-8 text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
              >
                <option value="Mensuel">Mensuel</option>
                <option value="Annuel">Annuel</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Donut Chart Display */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="size-48 -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="14"
                className="text-muted/30"
              />

              {/* Segment 1: Sold Tickets (60% - Mint Green #6ee7b7 / Emerald) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#6ee7b7"
                strokeWidth="14"
                strokeDasharray="143.2 238.7"
                strokeDashoffset="0"
                className="transition-all duration-1000 ease-out"
              />

              {/* Segment 2: Left Tickets (40% - Soft Orange/Peach #fdba74) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#fdba74"
                strokeWidth="14"
                strokeDasharray="95.5 238.7"
                strokeDashoffset="-143.2"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-muted-foreground font-medium">Total Billets</span>
              <span className="font-display text-lg font-bold text-foreground">20k</span>
              <span className="text-[10px] text-muted-foreground font-mono">(100%)</span>
            </div>

            {/* Callout pointers on the Donut */}
            <div className="absolute right-0 top-3 text-right text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              12k <span className="font-normal text-muted-foreground text-[10px]">(60%)</span>
            </div>
            <div className="absolute left-0 bottom-6 text-left text-[11px] font-bold text-orange-500">
              8k <span className="font-normal text-muted-foreground text-[10px]">(40%)</span>
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="flex items-center justify-center gap-6 pt-3 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#6ee7b7]" />
              <span className="font-medium text-foreground">Billets Vendus</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#fdba74]" />
              <span className="font-medium text-foreground">Billets Restants</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Bottom Row: Transaction History (Left 8 cols) + Visitors & Demographics (Right 4 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Transaction History Table */}
        <Card className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs lg:col-span-8">
          <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
            <h3 className="font-display text-lg font-bold text-foreground">
              Historique des Transactions
            </h3>

            <div className="relative">
              <select
                aria-label="Filtre temporel de l'historique des transactions"
                value={historyPeriod}
                onChange={(e) => setHistoryPeriod(e.target.value as any)}
                className="appearance-none rounded-xl border border-border bg-muted/40 px-3 py-1.5 pr-8 text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
              >
                <option value="24h">Dernières 24 Heures</option>
                <option value="7j">7 Derniers Jours</option>
                <option value="30j">30 Derniers Jours</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 text-[11px] text-muted-foreground font-semibold">
                <tr>
                  <th className="pb-3 font-semibold">ID Transaction</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Moyen</th>
                  <th className="pb-3 font-semibold">Statut</th>
                  <th className="pb-3 font-semibold text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 font-mono font-medium text-foreground">
                      {t.id}
                    </td>
                    <td className="py-3.5 text-muted-foreground font-medium">
                      {t.date}
                    </td>
                    <td className="py-3.5 font-semibold text-foreground">
                      {t.method}
                    </td>
                    <td className="py-3.5">
                      {t.status === "SUCCESS" && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-500">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          Réussi
                        </span>
                      )}
                      {t.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-amber-500">
                          <span className="size-2 rounded-full bg-amber-500" />
                          En attente
                        </span>
                      )}
                      {t.status === "FAILED" && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-rose-500">
                          <span className="size-2 rounded-full bg-rose-500" />
                          Échoué
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-foreground">
                      {t.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: Visitors & Demographics Card */}
        <Card className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs lg:col-span-4 flex flex-col justify-between">
          <div className="border-b border-border/60 pb-4 mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-foreground">
              Visiteurs & Participants
            </h3>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Plus d'informations sur les visiteurs"
            >
              <Info className="size-4" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Block 1: New Visitors */}
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mb-3">
                <span>Nouveaux Visiteurs :</span>
                <Info className="size-3.5 text-muted-foreground/60" />
              </div>

              <div className="flex items-center justify-between">
                {/* Avatar Stack */}
                <div className="flex -space-x-2 overflow-hidden">
                  <Avatar className="inline-block size-9 rounded-full ring-2 ring-card bg-amber-400 text-amber-950 font-bold text-xs">
                    <AvatarFallback className="bg-amber-500 text-white font-bold text-xs">JP</AvatarFallback>
                  </Avatar>
                  <Avatar className="inline-block size-9 rounded-full ring-2 ring-card bg-emerald-500 text-white font-bold text-xs">
                    <AvatarFallback className="bg-emerald-500 text-white font-bold text-xs">AB</AvatarFallback>
                  </Avatar>
                  <Avatar className="inline-block size-9 rounded-full ring-2 ring-card bg-blue-500 text-white font-bold text-xs">
                    <AvatarFallback className="bg-blue-500 text-white font-bold text-xs">BM</AvatarFallback>
                  </Avatar>
                  <Avatar className="inline-block size-9 rounded-full ring-2 ring-card bg-purple-500 text-white font-bold text-xs">
                    <AvatarFallback className="bg-purple-500 text-white font-bold text-xs">CM</AvatarFallback>
                  </Avatar>
                </div>

                {/* Stat value & growth */}
                <div className="text-right pl-3 border-l border-border/60">
                  <p className="font-display text-xl font-extrabold text-foreground">25 200</p>
                  <p className="text-[11px] font-semibold text-emerald-500 flex items-center justify-end gap-0.5 mt-0.5">
                    <ArrowUpRight className="size-3" />
                    +45.65%
                  </p>
                </div>
              </div>
            </div>

            {/* Block 2: Returning Visitors */}
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mb-3">
                <span>Visiteurs Récurrents :</span>
                <Info className="size-3.5 text-muted-foreground/60" />
              </div>

              <div className="flex items-center justify-between">
                {/* Avatar Stack */}
                <div className="flex -space-x-2 overflow-hidden">
                  <Avatar className="inline-block size-9 rounded-full ring-2 ring-card bg-rose-400 text-white font-bold text-xs">
                    <AvatarFallback className="bg-rose-500 text-white font-bold text-xs">SK</AvatarFallback>
                  </Avatar>
                  <Avatar className="inline-block size-9 rounded-full ring-2 ring-card bg-teal-500 text-white font-bold text-xs">
                    <AvatarFallback className="bg-teal-500 text-white font-bold text-xs">ND</AvatarFallback>
                  </Avatar>
                  <Avatar className="inline-block size-9 rounded-full ring-2 ring-card bg-indigo-500 text-white font-bold text-xs">
                    <AvatarFallback className="bg-indigo-500 text-white font-bold text-xs">MO</AvatarFallback>
                  </Avatar>
                  <Avatar className="inline-block size-9 rounded-full ring-2 ring-card bg-orange-500 text-white font-bold text-xs">
                    <AvatarFallback className="bg-orange-500 text-white font-bold text-xs">OK</AvatarFallback>
                  </Avatar>
                </div>

                {/* Stat value & growth */}
                <div className="text-right pl-3 border-l border-border/60">
                  <p className="font-display text-xl font-extrabold text-foreground">1 250</p>
                  <p className="text-[11px] font-semibold text-rose-500 flex items-center justify-end gap-0.5 mt-0.5">
                    <ArrowDownRight className="size-3" />
                    -11.25%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
