"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, Coins, QrCode, Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { MANUAL_CASE_ACTIONS, useAdminEvents, useEventStats, useManualCases } from "@/hooks/useEvents";
import { formatXaf } from "@/lib/events";
import type { AuditEntry } from "@/types/events";

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
  const { data: events, isLoading } = useAdminEvents();
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
    { label: "Événements", value: String(events?.length ?? 0), icon: CalendarDays },
    { label: "Billets émis", value: totals.issued.toLocaleString("fr-FR"), icon: Ticket },
    { label: "Recettes billets (HT)", value: formatXaf(totals.revenue), icon: Coins },
    { label: "Entrées scannées", value: totals.scanned.toLocaleString("fr-FR"), icon: QrCode },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">{label}</p>
              <Icon className="size-4 text-primary" />
            </div>
            <p className="mt-2 font-display text-3xl font-extrabold text-foreground">{value}</p>
          </Card>
        ))}
      </div>

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

      <Card className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
        <h2 className="mb-4 font-display text-lg font-bold text-foreground">Ventes par événement</h2>
        {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
        {!isLoading && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucun événement.{" "}
            <Link href="/admin/event/events" className="text-primary underline">
              Créer un événement
            </Link>
          </p>
        )}
        <div className="space-y-4">
          {rows.map(({ event, stats: s }) => {
            const capacity = s?.capacity || event.capacity || 0;
            const fill = pct(s?.issued ?? 0, capacity);
            const present = pct(s?.scanned ?? 0, s?.issued ?? 0);
            return (
              <Link
                key={event.id}
                href={`/admin/event/events/${event.id}`}
                className="block rounded-2xl border border-border/60 p-4 transition-colors hover:border-primary/50"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.startDate).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
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
                  <div className="h-full rounded-full bg-primary" style={{ width: `${fill}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
