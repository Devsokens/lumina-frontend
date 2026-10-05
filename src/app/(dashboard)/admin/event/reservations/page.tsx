"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAdminEvents, useEventOrders, useRefundOrder } from "@/hooks/useEvents";
import { apiErrorMessage, formatXaf } from "@/lib/events";
import type { EventOrder, PaymentStatus } from "@/types/events";

// Commandes de billets d'un événement (GET /admin/events/:id/orders) et
// remboursement (POST /admin/orders/:id/refund, OWNER/MANAGER). Le paiement
// est confirmé automatiquement par Paystack : il n'y a rien à « valider ».
const PAGE_SIZE = 20;

const PAYMENT_LABELS: Record<PaymentStatus, { label: string; className: string }> = {
  PAID: { label: "Payée", className: "bg-emerald-500/15 text-emerald-600" },
  PENDING: { label: "Paiement en attente", className: "bg-amber-500/15 text-amber-600" },
  FAILED: { label: "Échec paiement", className: "bg-destructive/15 text-destructive" },
  REFUNDED: { label: "Remboursée", className: "bg-muted text-muted-foreground" },
};

const TICKET_LABELS: Record<string, string> = {
  VALID: "valide",
  USED: "entré",
  PENDING: "réservé",
  CANCELLED: "expiré",
  REFUNDED: "remboursé",
};

type Filter = "ALL" | PaymentStatus;

export default function EventReservationsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canRefund = role === "OWNER" || role === "MANAGER";
  const { data: events } = useAdminEvents();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");
  const [refunding, setRefunding] = useState<EventOrder | null>(null);
  const [releaseSeats, setReleaseSeats] = useState(true);

  const [pickedEventId, setEventId] = useState<string | null>(null);
  // Événement le plus récent sélectionné par défaut.
  const latestEventId = useMemo(
    () =>
      [...(events ?? [])].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )[0]?.id ?? null,
    [events]
  );
  const eventId = pickedEventId ?? latestEventId;

  const { data, isLoading, isError } = useEventOrders(eventId, page, PAGE_SIZE);
  const refund = useRefundOrder(eventId ?? "");

  const orders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.data ?? []).filter((o) => {
      if (filter !== "ALL" && o.paymentStatus !== filter) return false;
      if (!q) return true;
      return [o.orderNumber, o.customerName, o.customerPhone, o.customerEmail]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q));
    });
  }, [data, filter, query]);

  const totalPages = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1;

  async function confirmRefund() {
    if (!refunding) return;
    try {
      const res = await refund.mutateAsync({ orderId: refunding.id, releaseSeats });
      toast.success(
        `Commande ${refunding.orderNumber} remboursée (${formatXaf(res.amount)}) : ${res.refundedTickets} billet(s) invalidé(s)` +
          (res.releasedSeats ? `, ${res.releasedSeats} place(s) remise(s) en vente.` : ".")
      );
      setRefunding(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Remboursement impossible."));
    }
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="border-b border-border pb-4">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Réservations & Remboursements
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Commandes de billets par événement. Le paiement est confirmé automatiquement par Paystack.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center">
        <select
          aria-label="Événement"
          value={eventId ?? ""}
          onChange={(e) => {
            setEventId(e.target.value || null);
            setPage(1);
          }}
          className="h-9 rounded-xl border border-border bg-muted/30 px-3 text-sm"
        >
          {(events ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="N° de commande, nom, téléphone, e-mail…"
            className="h-9 rounded-xl pl-8 text-sm"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto text-xs">
          {(["ALL", "PAID", "PENDING", "REFUNDED"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-lg px-2.5 py-1 font-semibold ${
                filter === f ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "ALL" ? "Toutes" : PAYMENT_LABELS[f].label}
            </button>
          ))}
        </div>
      </div>

      {!canRefund && (
        <p className="text-xs text-muted-foreground">
          Le détail des commandes et les remboursements sont réservés aux rôles Propriétaire et Manager.
        </p>
      )}
      {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {isError && canRefund && (
        <p className="text-sm text-destructive">Impossible de charger les commandes.</p>
      )}
      {!isLoading && !isError && orders.length === 0 && eventId && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucune commande pour ce filtre.
        </p>
      )}

      <ul className="space-y-3">
        {orders.map((o) => {
          const status = PAYMENT_LABELS[o.paymentStatus];
          const refundable = canRefund && o.paymentStatus === "PAID" && o.total > 0;
          return (
            <li key={o.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">{o.orderNumber}</p>
                  <p className="font-semibold text-foreground">{o.customerName ?? "Client"}</p>
                  <p className="text-xs text-muted-foreground">
                    {[o.customerPhone, o.customerEmail].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                  <p className="mt-1 font-display text-base font-bold text-foreground">
                    {o.total === 0 ? "Gratuit" : formatXaf(o.total)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString("fr-FR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {o.tickets.map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-muted/50 px-2 py-0.5 text-[11px]"
                    >
                      <Ticket className="size-3" />
                      {t.ticketType.name} · {TICKET_LABELS[t.status] ?? t.status}
                    </span>
                  ))}
                </div>
                {refundable && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs"
                    onClick={() => {
                      setReleaseSeats(true);
                      setRefunding(o);
                    }}
                  >
                    <RotateCcw className="size-3.5" />
                    Rembourser
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Précédent
          </Button>
          <span className="text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Suivant
          </Button>
        </div>
      )}

      <Dialog open={refunding !== null} onOpenChange={(open) => !open && setRefunding(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rembourser la commande {refunding?.orderNumber}</DialogTitle>
            <DialogDescription>
              {refunding && formatXaf(refunding.total)} seront remboursés via Paystack. Les billets
              non encore scannés seront invalidés immédiatement (refusés au scan). Action
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={releaseSeats}
              onChange={(e) => setReleaseSeats(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Remettre les places en vente
              <span className="block text-xs text-muted-foreground">
                Décochez pour garder ces places bloquées.
              </span>
            </span>
          </label>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRefunding(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => void confirmRefund()} disabled={refund.isPending}>
              {refund.isPending ? "Remboursement…" : "Confirmer le remboursement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
