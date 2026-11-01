"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, CalendarDays, Coins, QrCode, Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { MANUAL_CASE_ACTIONS, useAdminEvents, useEventStats, useManualCases } from "@/hooks/useEvents";
import { formatXaf } from "@/lib/events";
import type { AuditEntry } from "@/types/events";
import { AreaChart, BarList, DonutChart } from "@/components/charts/charts";
import { StatCard } from "@/components/charts/stat-card";

// Tableau de bord événementiel (EF-E10) : données réelles de
// GET /admin/analytics/events, rafraîchies toutes les 15 s.
const MANUAL_CASE_LABELS: Record<(typeof MANUAL_CASE_ACTIONS)[number], { title: string; todo: string }> = {
  REFUND_FAILED: {
    title: "Remboursement Paystack échoué",
    todo: "Billets déjà invalidés : rembourser le client manuellement.",
  },
  REFUND_PARTIAL_REVIEW: {
    title: "Remboursement partiel (dashboard Paystack)",
    todo: "Aucun billet annulé : décider lesquels invalider.",
  },
  TICKETS_REFUND_NEEDED: {
    title: "Paiement reçu après expiration, plus de places",
    todo: "Rembourser le client (onglet Réservations).",
  },
};

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export default function EventDashboardPage() {
  const role = useAuthStore((s) => s.user?.role);
  const { data: events, isLoading, isError: eventsError, refetch } = useAdminEvents();
  const { data: stats, isError: statsDenied } = useEventStats();
  const { data: manualCases } = useManualCases(role === "OWNER");

  const totals = useMemo(() => {
    const all = stats ?? [];
    return {
      issued: all.reduce((n, s) => n + s.issued, 0),
      scanned: all.reduce((n, s) => n + s.scanned, 0),
      revenue: all.reduce((n, s) => n + s.revenue, 0),
      pending: all.reduce((n, s) => n + s.pending, 0),
    };
  }, [stats]);

  const [now] = useState(() => Date.now());
  const upcoming = (events ?? []).filter(
    (e) =>
      (e.status === "PUBLISHED" || e.status === "ONGOING") &&
      new Date(e.endDate ?? e.startDate).getTime() >= now
  );
  const rows = (events ?? [])
    .map((e) => ({ event: e, stats: stats?.find((s) => s.eventId === e.id) }))
    .sort((a, b) => new Date(b.event.startDate).getTime() - new Date(a.event.startDate).getTime());

  const kpis = [
    { label: "Événements", value: events?.length ?? 0, icon: CalendarDays, hint: `${upcoming.length} à venir` },
    { label: "Billets émis", value: totals.issued, icon: Ticket, hint: `${totals.pending} en attente de paiement` },
    { label: "Recettes billets (HT)", value: totals.revenue, icon: Coins, format: formatXaf },
    {
      label: "Entrées scannées",
      value: totals.scanned,
      icon: QrCode,
      hint: `${pct(totals.scanned, totals.issued)} % des billets émis`,
    },
  ];

  // Graphiques : recettes et billets par événement (ordre chronologique),
  // répartition des billets.
  const chronological = [...rows].reverse();
  const revenueSeries = chronological.map(({ event, stats: s }) => ({
    label: new Date(event.startDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    value: s?.revenue ?? 0,
  }));
  const ticketsByEvent = rows
    .map(({ event, stats: s }) => ({ label: event.title, value: s?.issued ?? 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const refunded = (stats ?? []).reduce((n, s) => n + (s.refunded ?? 0), 0);
  const ticketSplit = [
    { label: "Entrés (scannés)", value: totals.scanned, color: "var(--chart-1)" },
    { label: "Valides, pas encore entrés", value: Math.max(0, totals.issued - totals.scanned), color: "var(--chart-2)" },
    { label: "En attente de paiement", value: totals.pending, color: "var(--chart-3)" },
    { label: "Remboursés", value: refunded, color: "var(--chart-5)" },
  ];

  return (
    <div className="space-y-4 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">
            Tableau de bord
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            {upcoming.length} événement(s) en vente à venir · mise à jour automatique toutes les 15 s
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/scan">
            <QrCode className="size-4" />
            Ouvrir le scanner
          </Link>
        </Button>
      </div>

      {statsDenied && (
        <p className="rounded-2xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          Les chiffres de vente sont réservés aux rôles Propriétaire et Manager.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <StatCard key={k.label} index={i} {...k} />
        ))}
      </div>

      {!statsDenied && (
        <div className="grid gap-3 lg:grid-cols-12">
          <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs lg:col-span-5">
            <h2 className="font-display text-sm font-bold">Recettes par événement</h2>
            <p className="mb-2 text-[11px] text-muted-foreground">Billets payés, par date</p>
            <AreaChart data={revenueSeries} format={formatXaf} />
          </Card>
          <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs lg:col-span-4">
            <h2 className="mb-2 font-display text-sm font-bold">Répartition des billets</h2>
            <DonutChart
              data={ticketSplit}
              centerValue={totals.issued.toLocaleString("fr-FR")}
              centerLabel="billets émis"
            />
          </Card>
          <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs lg:col-span-3">
            <h2 className="mb-2 font-display text-sm font-bold">Les plus vendus</h2>
            <BarList data={ticketsByEvent} format={(v) => `${Math.round(v).toLocaleString("fr-FR")} billets`} />
          </Card>
        </div>
      )}

      {totals.pending > 0 && (
        <p className="text-xs text-muted-foreground">
          {totals.pending} billet(s) réservé(s) en attente de paiement (libérés automatiquement
          après 30 min sans paiement).
        </p>
      )}

      {role === "OWNER" && (manualCases?.length ?? 0) > 0 && (
        <Card className="rounded-3xl border border-warning/50 bg-card p-5 shadow-xs">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="size-4 text-warning" />
            <h2 className="font-display text-base font-bold text-foreground">
              Cas à traiter manuellement ({manualCases?.length})
            </h2>
          </div>
          <ul className="space-y-2">
            {manualCases?.map((c: AuditEntry) => {
              const meta = MANUAL_CASE_LABELS[c.action as keyof typeof MANUAL_CASE_LABELS];
              const value = (c.newValue ?? {}) as { amount?: number; reference?: string };
              return (
                <li key={c.id} className="rounded-2xl bg-muted/40 p-3 text-xs">
                  <p className="font-semibold text-foreground">{meta?.title ?? c.action}</p>
                  <p className="text-muted-foreground">{meta?.todo}</p>
                  <p className="mt-1 text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString("fr-FR")}
                    {typeof value.amount === "number" && ` · ${formatXaf(value.amount)}`}
                    {value.reference && ` · réf. ${value.reference}`}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <h2 className="mb-3 font-display text-sm font-bold text-foreground">Ventes par événement</h2>
        {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
        {eventsError && (
          <p className="text-sm text-destructive">
            Impossible de charger les événements (serveur indisponible ou en cours de mise à jour).{" "}
            <button type="button" className="underline" onClick={() => void refetch()}>
              Réessayer
            </button>
          </p>
        )}
        {!isLoading && !eventsError && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucun événement.{" "}
            <Link href="/admin/event/events" className="text-primary underline">
              Créer un événement
            </Link>
          </p>
        )}
        <div className="grid gap-2 md:grid-cols-2">
          {rows.map(({ event, stats: s }) => {
            const capacity = s?.capacity || event.capacity || 0;
            const fill = pct(s?.issued ?? 0, capacity);
            const present = pct(s?.scanned ?? 0, s?.issued ?? 0);
            return (
              <Link
                key={event.id}
                href={`/admin/event/events/${event.id}`}
                className="block rounded-xl border border-border/60 px-3 py-2.5 transition-colors hover:border-primary/50"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.startDate).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
                  </p>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] sm:grid-cols-4">
                  <span>
                    <strong className="text-foreground">{s?.issued ?? 0}</strong>
                    <span className="text-muted-foreground"> / {capacity} billets</span>
                  </span>
                  <span>
                    <strong className="text-foreground">{s?.scanned ?? 0}</strong>
                    <span className="text-muted-foreground"> entrées ({present} %)</span>
                  </span>
                  <span>
                    <strong className="text-foreground">{formatXaf(s?.revenue ?? 0)}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    {s?.refunded ? `${s.refunded} remboursé(s)` : ""}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${fill}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
