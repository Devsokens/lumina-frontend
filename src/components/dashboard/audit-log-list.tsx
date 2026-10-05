"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogs } from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/useAuthStore";

const FILTERS: { label: string; actions?: string }[] = [
  { label: "Tout" },
  { label: "À traiter", actions: "REFUND_FAILED,REFUND_PARTIAL_REVIEW,TICKETS_REFUND_NEEDED" },
  { label: "Paiements", actions: "PAYMENT_CONFIRMED,ORDER_REFUNDED,REFUND_FAILED" },
  { label: "Équipe", actions: "CREATE_USER,UPDATE_USER,RESET_USER_PASSWORD" },
];

// Journal d'audit (docs/API_CONTRACT.md §13), OWNER uniquement.
export function AuditLogList() {
  const isOwner = useAuthStore((s) => s.user?.role === "OWNER");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState(0);
  const { data, isLoading, isError } = useAuditLogs(page, FILTERS[filter].actions);

  if (!isOwner) {
    return <p className="text-sm text-muted-foreground">Journal d&apos;audit réservé au propriétaire.</p>;
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {FILTERS.map((f, i) => (
          <Button
            key={f.label}
            size="sm"
            variant={i === filter ? "default" : "outline"}
            onClick={() => {
              setFilter(i);
              setPage(1);
            }}
          >
            {f.label}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <Skeleton className="h-40" />
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger le journal.</p>
      ) : (data?.data ?? []).length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Aucune entrée.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border text-sm">
          {(data?.data ?? []).map((log) => (
            <li key={log.id} className="flex flex-wrap justify-between gap-2 p-3">
              <span>
                <span className="font-mono text-xs">{log.action}</span>{" "}
                <span className="text-muted-foreground">
                  {log.entityType}
                  {log.entityId ? ` ${log.entityId.slice(0, 8)}` : ""}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                {log.user?.fullName ?? "Système"} ·{" "}
                {new Date(log.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </span>
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Précédent
          </Button>
          <span className="text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
