"use client";

import { use } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, MapPin } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { usePublicEvent } from "@/hooks/usePublicEvents";
import { TicketPurchase } from "@/components/vitrine/ticket-purchase";

export default function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tenant = useTenant();
  const { data: event, isLoading, isError } = usePublicEvent(tenant.slug, id);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      <Link
        href={`/${tenant.slug}/events`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Tous les événements
      </Link>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {(isError || (!isLoading && !event)) && (
        <p className="rounded-2xl border border-border p-6 text-sm text-muted-foreground">
          Cet événement n&apos;est pas (ou plus) en vente.
        </p>
      )}

      {event && (
        <article className="mobile-readable space-y-6">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{tenant.name}</p>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {event.title}
            </h1>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              {new Date(event.startDate).toLocaleString("fr-FR", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
            {(event.venueName || event.location) && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                {[event.venueName, event.location].filter(Boolean).join(" · ")}
              </p>
            )}
          </header>

          {event.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {event.description}
            </p>
          )}

          <section className="rounded-3xl border border-border bg-card p-4 sm:p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Billetterie</h2>
            <TicketPurchase event={event} />
          </section>
        </article>
      )}
    </main>
  );
}
