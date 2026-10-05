"use client";

import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { usePublicEvents } from "@/hooks/usePublicEvents";
import { formatXaf } from "@/lib/events";

export default function PublicEventsPage() {
  const tenant = useTenant();
  const { data: events, isLoading, isError } = usePublicEvents(tenant.slug);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
        Événements — {tenant.name}
      </h1>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Chargement…</p>}
      {isError && (
        <p className="mt-6 text-sm text-destructive">Impossible de charger les événements.</p>
      )}
      {!isLoading && !isError && (events ?? []).length === 0 && (
        <p className="mt-6 rounded-2xl border border-border p-6 text-sm text-muted-foreground">
          Aucun événement en vente pour le moment.
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {(events ?? []).map((e) => {
          const prices = e.ticketTypes.map((t) => t.price);
          const soldOut = e.ticketTypes.every((t) => t.remaining === 0);
          const from = prices.length ? Math.min(...prices) : 0;
          return (
            <li key={e.id}>
              <Link
                href={`/${tenant.slug}/events/${e.id}`}
                className="block rounded-3xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <p className="font-semibold text-foreground">{e.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  {new Date(e.startDate).toLocaleString("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                {(e.venueName || e.location) && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {[e.venueName, e.location].filter(Boolean).join(" · ")}
                  </p>
                )}
                <p className="mt-2 text-sm font-semibold text-primary">
                  {soldOut ? "Complet" : from === 0 ? "Gratuit" : `Dès ${formatXaf(from)}`}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
