"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Download, FileText, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiError } from "@/lib/api";
import { formatXAF } from "@/lib/format";
import { downloadInvoice, useInvoices, type InvoiceRow } from "@/hooks/useInvoices";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<InvoiceRow["type"], string> = {
  DINE_IN: "Sur place",
  TAKEAWAY: "À emporter",
  DELIVERY: "Livraison",
  EVENT: "Billetterie",
  STAY: "Séjour RBNB",
};

const METHOD_LABELS: Record<InvoiceRow["paymentMethod"], string> = {
  MOBILE_MONEY: "Mobile Money",
  CARD: "Carte",
  CASH: "Espèces",
  PAY_ON_DELIVERY: "À la livraison",
};

// Filtres par secteur : un restaurant n'a ni billets ni séjours.
const SECTOR_TYPES: Record<string, InvoiceRow["type"][]> = {
  restaurant: ["DINE_IN", "TAKEAWAY", "DELIVERY"],
  shop: ["TAKEAWAY", "DELIVERY"],
  event: [],
  accommodation: [],
};

export default function InvoicesPage() {
  const { sector } = useParams<{ sector: string }>();
  const [page, setPage] = useState(1);
  const [type, setType] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const { data, isLoading, isFetching } = useInvoices({ page, type, search });
  const types = SECTOR_TYPES[sector] ?? [];
  const pages = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1;

  async function download(row: InvoiceRow) {
    setBusy(row.id);
    try {
      await downloadInvoice(row);
    } catch (err) {
      toast.error(apiError(err, "Téléchargement impossible."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold sm:text-2xl">Factures</h1>
          <p className="text-sm text-muted-foreground">Tous les paiements encaissés, facture PDF en un clic.</p>
        </div>
        {data && (
          <div className="rounded-2xl border border-border bg-card px-5 py-3 text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total encaissé</p>
            <p className="font-display text-xl font-bold">{formatXAF(data.meta.amount)}</p>
            <p className="text-xs text-muted-foreground">{data.meta.total} facture(s)</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form
          className="relative min-w-56 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(query.trim());
          }}
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            maxLength={60}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="N° de commande, client, téléphone…"
            className="rounded-xl pl-9"
          />
        </form>
        {types.length > 1 &&
          [undefined, ...types].map((t) => (
            <button
              key={t ?? "all"}
              type="button"
              onClick={() => {
                setType(t);
                setPage(1);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm",
                type === t ? "border-primary bg-primary text-primary-foreground" : "border-border"
              )}
            >
              {t ? TYPE_LABELS[t] : "Tout"}
            </button>
          ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-80 rounded-2xl" />
      ) : !data?.data.length ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
          <FileText className="size-10 text-muted-foreground" />
          <p className="font-semibold">Aucune facture{search ? " pour cette recherche" : " pour l'instant"}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Chaque paiement confirmé (en ligne, ou sur place une fois la commande servie) apparaît ici.
          </p>
        </div>
      ) : (
        <div className={cn("overflow-hidden rounded-2xl border border-border bg-card", isFetching && "opacity-70")}>
          <ul className="divide-y divide-border">
            {data.data.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {row.orderNumber}
                    {row.paymentStatus === "REFUNDED" && (
                      <span className="ml-2 rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning">Remboursée</span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {new Date(row.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                    {row.customerName || row.customerPhone || "Client"} · {TYPE_LABELS[row.type]} · {METHOD_LABELS[row.paymentMethod]}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">{formatXAF(row.total)}</p>
                <Button variant="outline" size="sm" className="rounded-xl" disabled={busy === row.id} onClick={() => download(row)}>
                  {busy === row.id ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                  PDF
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <Button variant="outline" size="icon" aria-label="Page précédente" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          Page {page} / {pages}
          <Button variant="outline" size="icon" aria-label="Page suivante" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
