"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { EvButton, EvCard, EvPill, EvSegmented, EvSelect } from "@/components/events/ev-ui";
import { PLAN_LABELS, payoutsOf } from "@/components/events/settings/settings-sections";
import { useAdminTenantInfo, usePayoutSummary, type PaymentRules, type PayoutChannel, type PayoutRow } from "@/hooks/useAdmin";
import { fetchStatementExport, usePayoutDetail, useRevenueByEvent, useStatement, useWithdrawContributions, type EventRevenue, type MoneyState, type StatementLine } from "@/hooks/useRevenue";
import { apiErrorMessage } from "@/lib/events";
import { feePercent } from "@/lib/service-fee";
import { CHANNELS, CHANNEL_DESTINATION, CHANNEL_LABEL, ChannelIcon, missingLabel } from "@/components/events/revenue/channel-badge";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

// Module « Revenus » (propriétaire) : ce que les ventes ont rapporté, ce que
// GiyaX a retenu et ce qui a été reversé. Onglet et événement dans l'URL
// (?onglet=releve&evenement=<id>) pour pouvoir y renvoyer depuis la page
// d'un événement. Montants en francs CFA entiers.

type Tab = "reversements" | "evenements" | "releve" | "offre";
const TABS: { value: Tab; label: string }[] = [
  { value: "reversements", label: "Reversements" },
  { value: "evenements", label: "Par événement" },
  { value: "releve", label: "Relevé" },
  { value: "offre", label: "Mon offre" },
];

export const francs = (n: number) => `${n.toLocaleString("fr-FR")} F`;
const day = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Libreville" });
const dayTime = (d: string) => new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Libreville" });
const operatorName = (o: string) => (o === "MOOV" ? "Moov Money" : o === "CARD" ? "Virement bancaire" : "Airtel Money");

const PAYOUT_STATUS: Record<PayoutRow["status"], { label: string; tone: "ok" | "neutral" | "warn" }> = {
  PENDING_APPROVAL: { label: "En préparation", tone: "neutral" },
  PROCESSING: { label: "En cours d'envoi", tone: "neutral" },
  FAILED: { label: "En cours de traitement", tone: "warn" },
  REVIEW: { label: "En cours de traitement", tone: "warn" },
  PAID: { label: "Versé", tone: "ok" },
  REJECTED: { label: "Non effectué", tone: "neutral" },
  CANCELLED: { label: "Annulé", tone: "neutral" },
};

const MONEY_STATE: Record<MoneyState, { label: string; tone: "ok" | "neutral" | "warn" }> = {
  PAID: { label: "Versé", tone: "ok" },
  IN_PROGRESS: { label: "Versement en cours", tone: "warn" },
  UPCOMING: { label: "À venir", tone: "neutral" },
};

function Figure({ label, value, hint, strong }: { label: string; value: string; hint?: string; strong?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[13px] text-ev-muted">{label}</span>
      <span className={cn("truncate font-semibold tracking-[-0.01em]", strong ? "text-[26px]" : "text-[17px]")}>{value}</span>
      {hint && <span className="text-xs text-ev-muted">{hint}</span>}
    </div>
  );
}

export function RevenuePage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const role = useAuthStore((s) => s.user?.role);
  const raw = params.get("onglet") as Tab | null;
  const tab: Tab = raw && TABS.some((t) => t.value === raw) ? raw : "reversements";
  const eventId = params.get("evenement") ?? "";

  const { data: summary, isLoading, isError } = usePayoutSummary();
  const { data: events } = useRevenueByEvent(undefined, role === "OWNER");

  function go(next: { tab?: Tab; eventId?: string }) {
    const t = next.tab ?? tab;
    const e = next.eventId ?? eventId;
    const q = [t !== "reversements" ? `onglet=${t}` : "", e ? `evenement=${e}` : ""].filter(Boolean).join("&");
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  if (role && role !== "OWNER") {
    return <p className="rounded-[16px] border border-ev-border bg-ev-surface p-6 text-sm text-ev-muted">Les revenus sont réservés au propriétaire du compte.</p>;
  }
  if (isLoading) return <div className="h-64 animate-pulse rounded-[16px] bg-ev-line" />;
  if (isError || !summary) return <p className="text-sm text-ev-danger">Impossible de charger vos revenus. Rechargez la page.</p>;

  const { balance, rules } = summary;
  const rate = String(summary.commissionBps / 100).replace(".", ",");
  const hold = rules?.payoutHoldDays ?? 2;
  // Commission retirée à l'organisateur : affichée seulement si elle existe.
  const charged = summary.commissionBps > 0 || balance.commission > 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="m-0 text-2xl font-semibold tracking-[-0.01em]">Revenus</h1>
        <p className="m-0 text-sm text-ev-muted">
          Ce que vos ventes ont rapporté et ce qui vous a été reversé.{" "}
          {summary.earlyPayout ? "Versement anticipé activé : vos recettes sont versées sans attendre la fin de l'événement." : `Les recettes d'un événement sont versées ${hold} jour${hold > 1 ? "s" : ""} après sa fin.`}
        </p>
      </header>

      {(summary.missing ?? []).length > 0 && summary.channels && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-ev-gold/40 bg-ev-warn-bg px-4 py-3 text-[13px] text-ev-gold-text">
          <span>
            <strong className="font-semibold">
              {francs((summary.missing ?? []).reduce((sum, c) => sum + (summary.channels?.[c].upcoming ?? 0), 0))} vous attendent.
            </strong>{" "}
            Ajoutez {(summary.missing ?? []).map(missingLabel).join(" et ")} pour les recevoir.
          </span>
          <Link href="/admin/event/settings?rubrique=paiements" className="font-semibold underline underline-offset-2">
            Compléter mes comptes
          </Link>
        </div>
      )}

      {summary.test && (
        <p className="m-0 rounded-[12px] bg-ev-warn-bg px-4 py-3 text-[13px] text-ev-gold-text">Mode test : ces montants viennent de paiements d&apos;essai et ne seront pas versés.</p>
      )}

      <EvCard className="flex flex-col">
        <div className="grid gap-6 p-5 sm:grid-cols-3 sm:p-6">
          <Figure strong label="À venir" value={francs(balance.upcoming)} hint={summary.earlyPayout ? "Versement anticipé activé" : `Versé ${hold} jour${hold > 1 ? "s" : ""} après la fin de chaque événement`} />
          <Figure strong label="Versement en cours" value={francs(balance.inProgress)} hint="En préparation ou en cours d'envoi" />
          <Figure strong label="Déjà reversé" value={francs(balance.paidOut)} hint="Reçu sur votre Mobile Money" />
        </div>
        <div className="grid grid-cols-2 gap-6 border-t border-ev-line p-5 sm:grid-cols-3 sm:p-6">
          <Figure label="Ventes encaissées" value={francs(balance.sold)} />
          {charged ? (
            <Figure label={`Commission GiyaX (${rate} %)`} value={francs(balance.commission)} />
          ) : (
            <Figure label="Retenue sur vos ventes" value="0 F" hint="Les frais de service sont payés par vos acheteurs" />
          )}
          <Figure label="Remboursements" value={francs(balance.refunds)} />
        </div>
      </EvCard>

      {summary.channels && <ChannelsCard channels={summary.channels} missing={summary.missing ?? []} />}

      <EvSegmented<Tab> ariaLabel="Rubriques des revenus" value={tab} onChange={(t) => go({ tab: t })} items={TABS} className="self-start" />

      {tab === "reversements" && <Payouts payouts={summary.payouts} onEvent={(id) => go({ tab: "releve", eventId: id })} />}
      {tab === "evenements" && (
        <>
          <Contributions events={events ?? []} />
          <ByEvent events={events} onOpen={(id) => go({ tab: "releve", eventId: id })} />
        </>
      )}
      {tab === "releve" && <StatementTab key={eventId} eventId={eventId} events={events ?? []} onEvent={(id) => go({ eventId: id })} />}
      {tab === "offre" && <Offer rate={rate} rules={rules} charged={charged} />}
    </div>
  );
}

// ---------- Par moyen de paiement ----------

// Chaque moyen de paiement a son propre circuit de versement : on montre ce
// qui attend, ce qui est en cours et ce qui est versé, circuit par circuit.
function ChannelsCard({ channels, missing }: { channels: Record<PayoutChannel, { upcoming: number; inProgress: number; paidOut: number }>; missing: PayoutChannel[] }) {
  const shown = CHANNELS.filter((c) => channels[c].upcoming + channels[c].inProgress + channels[c].paidOut !== 0);
  if (shown.length === 0) return null;
  return (
    <EvCard className="overflow-hidden">
      <div className="flex flex-col gap-0.5 border-b border-ev-line px-5 py-4 sm:px-6">
        <span className="text-[15px] font-semibold">Par moyen de paiement</span>
        <span className="text-[13px] text-ev-muted">Vos acheteurs paient par Airtel Money, Moov Money ou carte : chaque montant vous est versé par le même moyen.</span>
      </div>
      <div className={cn("grid divide-y divide-ev-line sm:divide-x sm:divide-y-0", shown.length === 3 ? "sm:grid-cols-3" : shown.length === 2 ? "sm:grid-cols-2" : "")}>
        {shown.map((c) => {
          const v = channels[c];
          const lacking = missing.includes(c);
          return (
            <div key={c} className="flex flex-col gap-3 px-5 py-4 sm:px-6">
              <span className="flex items-center gap-2.5 text-sm font-semibold">
                <ChannelIcon channel={c} className="size-8" />
                {CHANNEL_LABEL[c]}
              </span>
              <dl className="m-0 flex flex-col gap-1.5 text-[13px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-ev-muted">À venir</dt>
                  <dd className="m-0 font-semibold">{francs(v.upcoming)}</dd>
                </div>
                {v.inProgress > 0 && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ev-muted">En cours</dt>
                    <dd className="m-0">{francs(v.inProgress)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="text-ev-muted">Déjà reversé</dt>
                  <dd className="m-0">{francs(v.paidOut)}</dd>
                </div>
              </dl>
              {lacking ? (
                <Link href="/admin/event/settings?rubrique=paiements" className="text-xs font-semibold text-ev-gold-text underline underline-offset-2">
                  Ajoutez {missingLabel(c)} pour recevoir ce montant
                </Link>
              ) : (
                <span className="text-xs text-ev-muted">Versé {CHANNEL_DESTINATION[c]}</span>
              )}
            </div>
          );
        })}
      </div>
    </EvCard>
  );
}

// ---------- Reversements ----------

function Payouts({ payouts, onEvent }: { payouts: PayoutRow[]; onEvent: (eventId: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  if (payouts.length === 0) {
    return (
      <EvCard className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        <span className="text-[15px] font-semibold">Aucun versement pour le moment</span>
        <span className="max-w-[460px] text-[13px] leading-relaxed text-ev-muted">Les recettes d&apos;un événement sont reversées sur votre compte Mobile Money quelques jours après sa fin. Chaque versement apparaîtra ici.</span>
      </EvCard>
    );
  }
  return (
    <EvCard className="overflow-hidden">
      <ul className="m-0 list-none p-0">
        {payouts.map((p) => {
          const status = PAYOUT_STATUS[p.status];
          const expanded = open === p.id;
          return (
            <li key={p.id} className="border-b border-ev-line last:border-b-0">
              <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : p.id)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-ev-soft sm:px-6">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">
                    {francs(p.amount)}
                    {p.kind === "CONTRIBUTION" && <span className="ml-2 text-xs font-medium text-ev-muted">Cotisations</span>}
                  </span>
                  <span className="truncate text-[13px] text-ev-muted">
                    {p.paidAt ? `Versé le ${day(p.paidAt)}` : `Préparé le ${day(p.createdAt)}`} · {operatorName(p.operator)} {p.phone}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <EvPill tone={status.tone}>{status.label}</EvPill>
                  <ChevronDown className={cn("size-4 text-ev-muted transition-transform", expanded && "rotate-180")} />
                </span>
              </button>
              {expanded && <PayoutBreakdown payout={p} onEvent={onEvent} />}
            </li>
          );
        })}
      </ul>
    </EvCard>
  );
}

function PayoutBreakdown({ payout, onEvent }: { payout: PayoutRow; onEvent: (eventId: string) => void }) {
  const { data, isLoading, isError } = usePayoutDetail(payout.id);
  return (
    <div className="flex flex-col gap-4 border-t border-ev-line bg-ev-soft px-5 py-4 sm:px-6">
      <div className="grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
        <Figure label="Ventes" value={francs(payout.gross)} />
        <Figure label="Commission" value={payout.commission ? `− ${francs(payout.commission)}` : "0 F"} />
        <Figure label="Remboursements" value={`− ${francs(payout.refunds)}`} />
        <Figure label="Net versé" value={francs(payout.amount)} />
      </div>
      {isLoading && <span className="text-[13px] text-ev-muted">Chargement du détail…</span>}
      {isError && <span className="text-[13px] text-ev-danger">Détail indisponible pour le moment.</span>}
      {data && data.events.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.06em] text-ev-muted">Répartition par événement</span>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {data.events.map((e) => (
              <li key={e.eventId ?? "none"} className="flex items-center justify-between gap-3 text-sm">
                {e.eventId ? (
                  <button type="button" onClick={() => onEvent(e.eventId!)} className="min-w-0 truncate text-left text-ev-link hover:underline">
                    {e.title}
                  </button>
                ) : (
                  <span className="min-w-0 truncate">{e.title}</span>
                )}
                <span className="shrink-0 font-medium">
                  {francs(e.net)} <span className="font-normal text-ev-muted">· {e.lines} ligne{e.lines > 1 ? "s" : ""}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------- Cotisations à retirer ----------

// Une cotisation finance l'événement : elle se retire avant son début, dans
// une fenêtre fixée par GiyaX. Passé ce délai, elle est versée après
// l'événement comme les billets.
function Contributions({ events }: { events: EventRevenue[] }) {
  const withdraw = useWithdrawContributions();
  const list = events.filter((e) => e.eventId && e.contribution && e.contribution.phase !== "AFTER");
  if (list.length === 0) return null;

  function run(eventId: string) {
    withdraw.mutate(eventId, {
      onSuccess: (r) => {
        const sent = r.payouts.every((p) => p.status === "PAID");
        toast.success(sent ? `${francs(r.amount)} envoyés.` : `Retrait de ${francs(r.amount)} enregistré : il est en cours de traitement.`);
        if (r.missing.length) toast.info(`Une partie attend : ajoutez ${r.missing.map(missingLabel).join(" et ")} dans Paramètres › Paiements.`);
      },
      onError: (err) => toast.error(apiErrorMessage(err, "Retrait impossible pour le moment.")),
    });
  }

  return (
    <EvCard className="overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-ev-line px-5 py-4 sm:px-6">
        <span className="text-[15px] font-semibold">Cotisations à retirer</span>
        <span className="text-[13px] leading-relaxed text-ev-muted">Les cotisations servent à préparer l&apos;événement : vous pouvez les retirer juste avant son début. Sans retrait, elles sont versées après l&apos;événement.</span>
      </div>
      <ul className="m-0 list-none p-0">
        {list.map((e) => {
          const c = e.contribution!;
          const early = c.phase === "BEFORE";
          const low = c.available < c.min;
          return (
            <li key={e.eventId} className="flex flex-wrap items-center justify-between gap-3 border-b border-ev-line px-5 py-4 last:border-b-0 sm:px-6">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{e.title}</span>
                <span className="text-[13px] text-ev-muted">
                  {francs(c.available)} de cotisations ·{" "}
                  {early ? `retrait ouvert le ${dayTime(c.opensAt)}` : `retrait possible jusqu'au ${dayTime(c.closesAt)}`}
                  {low ? ` · minimum ${francs(c.min)}` : ""}
                </span>
              </span>
              <EvButton size="sm" disabled={!c.open || withdraw.isPending} onClick={() => run(e.eventId!)}>
                Retirer {francs(c.available)}
              </EvButton>
            </li>
          );
        })}
      </ul>
    </EvCard>
  );
}

// ---------- Par événement ----------

function ByEvent({ events, onOpen }: { events: EventRevenue[] | undefined; onOpen: (eventId: string) => void }) {
  // Heure figée au premier affichage (pas d'appel à l'horloge pendant le rendu).
  const [now] = useState(() => Date.now());
  if (!events) return <div className="h-40 animate-pulse rounded-[16px] bg-ev-line" />;
  if (events.length === 0) {
    return <EvCard className="px-6 py-12 text-center text-[13px] text-ev-muted">Aucune vente payante enregistrée pour le moment.</EvCard>;
  }
  return (
    <EvCard className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ev-line text-left text-xs font-semibold uppercase tracking-[0.06em] text-ev-muted">
            <th className="px-5 py-3 sm:px-6">Événement</th>
            <th className="px-3 py-3 text-right">Vendu</th>
            <th className="px-3 py-3 text-right">Commission</th>
            <th className="px-3 py-3 text-right">Remboursé</th>
            <th className="px-3 py-3 text-right">Net</th>
            <th className="px-3 py-3 text-right">Reversé</th>
            <th className="px-5 py-3 text-right sm:px-6">Reste à recevoir</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.eventId ?? "none"} className="border-b border-ev-line last:border-b-0">
              <td className="px-5 py-3.5 sm:px-6">
                {e.eventId ? (
                  <button type="button" onClick={() => onOpen(e.eventId!)} className="max-w-[260px] truncate text-left font-medium text-ev-link hover:underline">
                    {e.title}
                  </button>
                ) : (
                  <span className="font-medium">{e.title}</span>
                )}
                <span className="block text-xs text-ev-muted">
                  {e.sales} vente{e.sales > 1 ? "s" : ""}
                  {e.startDate ? ` · ${day(e.startDate)}` : ""}
                </span>
                {e.channels && (
                  <span className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1 text-xs text-ev-muted">
                    {CHANNELS.filter((c) => (e.channels?.[c] ?? 0) !== 0).map((c) => (
                      <span key={c} className="flex items-center gap-1">
                        <ChannelIcon channel={c} className="size-3.5" />
                        {francs(e.channels?.[c] ?? 0)}
                      </span>
                    ))}
                  </span>
                )}
              </td>
              <td className="px-3 py-3.5 text-right">{francs(e.sold)}</td>
              <td className="px-3 py-3.5 text-right text-ev-muted">− {francs(e.commission)}</td>
              <td className="px-3 py-3.5 text-right text-ev-muted">{e.refunds ? `− ${francs(e.refunds)}` : "—"}</td>
              <td className="px-3 py-3.5 text-right font-semibold">{francs(e.net)}</td>
              <td className="px-3 py-3.5 text-right">{francs(e.paidOut)}</td>
              <td className="px-5 py-3.5 text-right font-semibold sm:px-6">
                {francs(e.upcoming + e.inProgress)}
                {e.upcoming > 0 && e.payableAt !== undefined && (
                  <span className="block text-xs font-normal text-ev-muted">{e.payableAt === null ? "Versement anticipé" : new Date(e.payableAt).getTime() > now ? `À partir du ${day(e.payableAt)}` : "Versement imminent"}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </EvCard>
  );
}

// ---------- Relevé ----------

const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

function toCsv(rows: StatementLine[]) {
  const head = ["Date", "Type", "Événement", "Commande", "Client", "Montant brut (F)", "Commission (F)", "Net (F)", "État", "Versé le"];
  const lines = rows.map((r) =>
    [
      dayTime(r.date),
      r.type === "SALE" ? "Vente" : "Remboursement",
      r.eventTitle ?? "",
      r.orderNumber,
      r.customerName ?? "",
      r.gross,
      r.commission,
      r.net,
      MONEY_STATE[r.state].label,
      r.paidAt ? day(r.paidAt) : "",
    ]
      .map(cell)
      .join(";")
  );
  // BOM : accents lisibles à l'ouverture dans Excel.
  return `﻿${[head.map(cell).join(";"), ...lines].join("\r\n")}`;
}

function StatementTab({ eventId, events, onEvent }: { eventId: string; events: EventRevenue[]; onEvent: (eventId: string) => void }) {
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const { data, isLoading, isError, isFetching } = useStatement(page, eventId || undefined);
  const selected = events.find((e) => e.eventId === eventId);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  async function exportCsv() {
    setExporting(true);
    try {
      const { rows, truncated } = await fetchStatementExport(eventId || undefined);
      if (rows.length === 0) return void toast.message("Aucune ligne à exporter.");
      const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `giyax-releve-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      if (truncated) toast.message("Export limité aux 5 000 lignes les plus récentes.");
    } catch {
      toast.error("Export impossible pour le moment.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2.5 text-[13px] font-medium">
          Événement
          <EvSelect h={40} value={eventId} onChange={(e) => onEvent(e.target.value)} className="min-w-[220px] max-w-[320px] font-normal">
            <option value="">Tous les événements</option>
            {events
              .filter((e) => e.eventId)
              .map((e) => (
                <option key={e.eventId} value={e.eventId!}>
                  {e.title}
                </option>
              ))}
          </EvSelect>
        </label>
        <EvButton disabled={exporting} onClick={() => void exportCsv()}>
          <Download className="size-4" />
          {exporting ? "Préparation…" : "Exporter (CSV)"}
        </EvButton>
      </div>

      {selected && (
        <EvCard as="div" className="grid grid-cols-2 gap-5 p-5 sm:grid-cols-4">
          <Figure label="Vendu" value={francs(selected.sold)} />
          <Figure label="Commission" value={`− ${francs(selected.commission)}`} />
          <Figure label="Reversé" value={francs(selected.paidOut)} />
          <Figure label="Reste à recevoir" value={francs(selected.upcoming + selected.inProgress)} />
        </EvCard>
      )}

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-[16px] bg-ev-line" />
      ) : isError || !data ? (
        <p className="text-sm text-ev-danger">Relevé indisponible pour le moment.</p>
      ) : data.rows.length === 0 ? (
        <EvCard className="px-6 py-12 text-center text-[13px] text-ev-muted">Aucune vente payante {eventId ? "pour cet événement" : "enregistrée"} pour le moment.</EvCard>
      ) : (
        <>
          <EvCard className={cn("overflow-x-auto transition-opacity", isFetching && "opacity-60")}>
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ev-line text-left text-xs font-semibold uppercase tracking-[0.06em] text-ev-muted">
                  <th className="px-5 py-3 sm:px-6">Date</th>
                  <th className="px-3 py-3">Opération</th>
                  <th className="px-3 py-3 text-right">Brut</th>
                  <th className="px-3 py-3 text-right">Commission</th>
                  <th className="px-3 py-3 text-right">Net</th>
                  <th className="px-5 py-3 text-right sm:px-6">État</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => {
                  const state = MONEY_STATE[r.state];
                  return (
                    <tr key={r.id} className="border-b border-ev-line last:border-b-0">
                      <td className="whitespace-nowrap px-5 py-3.5 text-ev-muted sm:px-6">{dayTime(r.date)}</td>
                      <td className="px-3 py-3.5">
                        <span className="block max-w-[280px] truncate font-medium">
                          {r.type === "SALE" ? "Vente" : "Remboursement"} · {r.orderNumber}
                        </span>
                        <span className="block max-w-[280px] truncate text-xs text-ev-muted">{[r.eventTitle, r.customerName].filter(Boolean).join(" · ") || "—"}</span>
                      </td>
                      <td className="px-3 py-3.5 text-right">{francs(r.gross)}</td>
                      <td className="px-3 py-3.5 text-right text-ev-muted">{r.commission ? `− ${francs(r.commission)}` : "—"}</td>
                      <td className={cn("px-3 py-3.5 text-right font-semibold", r.net < 0 && "text-ev-danger")}>{r.net < 0 ? `− ${francs(-r.net)}` : francs(r.net)}</td>
                      <td className="px-5 py-3.5 text-right sm:px-6">
                        <EvPill tone={state.tone}>{state.label}</EvPill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </EvCard>
          {pages > 1 && (
            <div className="flex items-center justify-between gap-3 text-[13px] text-ev-muted">
              <span>
                Page {page} sur {pages} · {data.total} ligne{data.total > 1 ? "s" : ""}
              </span>
              <span className="flex gap-2">
                <EvButton size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="size-4" /> Précédent
                </EvButton>
                <EvButton size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                  Suivant <ChevronRight className="size-4" />
                </EvButton>
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------- Mon offre ----------

function Offer({ rate, rules, charged }: { rate: string; rules?: PaymentRules; charged: boolean }) {
  const { data: tenant } = useAdminTenantInfo();
  if (!tenant) return <div className="h-40 animate-pulse rounded-[16px] bg-ev-line" />;
  const payouts = payoutsOf(tenant);
  const plan = PLAN_LABELS[tenant.plan] ?? PLAN_LABELS.FREE;
  const rows: { title: string; value: string; detail: string; href: string; action: string }[] = [
    { title: "Formule", value: plan.label, detail: plan.detail, href: "/admin/event/settings?rubrique=abonnement", action: "Voir les formules" },
    {
      title: "Frais de service",
      value: rules ? `${feePercent(rules.buyerFeeBps)}, payés par l'acheteur` : "Payés par l'acheteur",
      detail: "Ajoutés au prix du billet et affichés à l'acheteur avant le paiement. Vous recevez le prix de vos billets en entier. Les billets gratuits ne coûtent rien.",
      href: "/admin/event/settings?rubrique=paiements",
      action: "En savoir plus",
    },
    ...(charged
      ? [
          {
            title: "Commission sur les billets",
            value: `${rate} %`,
            detail: "Retenue sur chaque billet payant. Le taux appliqué à une vente est celui du jour de la vente.",
            href: "/admin/event/settings?rubrique=abonnement",
            action: "En savoir plus",
          },
        ]
      : []),
    {
      title: "Reversement",
      value: `${rules?.payoutHoldDays ?? 2} jours après la fin de l'événement`,
      detail: payouts.accounts.length
        ? `Sur ${payouts.accounts.map((a) => `${operatorName(a.operator)} ${a.phone}`).join(", ")}.`
        : "Aucun compte de versement enregistré : ajoutez-en un pour recevoir vos recettes.",
      href: "/admin/event/settings?rubrique=paiements",
      action: payouts.accounts.length ? "Modifier" : "Ajouter un compte",
    },
  ];
  return (
    <EvCard className="overflow-hidden">
      {rows.map((r, i) => (
        <div key={r.title} className={cn("flex flex-wrap items-center justify-between gap-4 px-5 py-[18px] sm:px-6", i < rows.length - 1 && "border-b border-ev-line")}>
          <div className="flex min-w-[220px] flex-1 flex-col gap-1">
            <span className="text-[13px] text-ev-muted">{r.title}</span>
            <span className="text-[17px] font-semibold">{r.value}</span>
            <span className="max-w-[560px] text-[13px] leading-relaxed text-ev-muted">{r.detail}</span>
          </div>
          <Link href={r.href} className="text-[13px] font-semibold text-ev-link hover:underline">
            {r.action}
          </Link>
        </div>
      ))}
    </EvCard>
  );
}
