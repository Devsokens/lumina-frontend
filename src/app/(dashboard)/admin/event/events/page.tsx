"use client";

import { useState } from "react";
import { Plus, Calendar, MapPin, Ticket, Users, Edit3, Eye, MoreHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { EventForm } from "@/components/events/event-form";
import type { Event } from "@/types/api";

const INITIAL_EVENTS: Event[] = [
  {
    id: "evt-1",
    title: "Festival Urban Afro Libreville 2026",
    description: "Le plus grand festival de musiques urbaines et afro-fusion d'Afrique Centrale.",
    imageUrl: null,
    startDate: "2026-09-05T19:00:00Z",
    endDate: "2026-09-06T04:00:00Z",
    venueName: "Palais des Sports & de la Culture",
    location: "Libreville, Gabon",
    capacity: 500,
    status: "PUBLISHED",
    soldTicketsCount: 218,
    totalRevenue: 435000000, // in centimes
    checkedInCount: 156,
    createdAt: "2026-08-15T10:00:00Z",
  },
  {
    id: "evt-2",
    title: "Soirée Blanche & Champagne VIP",
    description: "Soirée rooftop privée avec DJ guest international et dégustation.",
    imageUrl: null,
    startDate: "2026-09-20T21:00:00Z",
    endDate: "2026-09-21T05:00:00Z",
    venueName: "Rooftop Sky Lounge Sablière",
    location: "Libreville, Gabon",
    capacity: 150,
    status: "DRAFT",
    soldTicketsCount: 45,
    totalRevenue: 112500000,
    checkedInCount: 0,
    createdAt: "2026-08-20T12:00:00Z",
  },
];

export default function EventsListPage() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  function handleOpenCreate() {
    setEditingEvent(null);
    setIsDrawerOpen(true);
  }

  function handleOpenEdit(evt: Event) {
    setEditingEvent(evt);
    setIsDrawerOpen(true);
  }

  function handleCreateSuccess(created: Partial<Event>) {
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? ({ ...e, ...created } as Event) : e))
      );
    } else {
      const newEvent: Event = {
        id: `evt-${Date.now()}`,
        title: created.title ?? "Nouvel événement",
        description: created.description ?? null,
        imageUrl: created.imageUrl ?? null,
        startDate: created.startDate ?? new Date().toISOString(),
        endDate: created.endDate ?? null,
        venueName: created.venueName ?? "Lieu à confirmer",
        location: created.location ?? "Libreville",
        capacity: created.capacity ?? 200,
        status: "PUBLISHED",
        soldTicketsCount: 0,
        totalRevenue: 0,
        checkedInCount: 0,
        createdAt: new Date().toISOString(),
      };
      setEvents((prev) => [newEvent, ...prev]);
    }
    setIsDrawerOpen(false);
    setEditingEvent(null);
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Mes Événements
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gérez vos dates, visuels, tarifs et suivez les ventes de billets en temps réel.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-xl bg-primary text-white font-semibold shadow-md shadow-primary/20 gap-2"
        >
          <Plus className="size-4" />
          <span>Créer un événement</span>
        </Button>
      </div>

      {/* Large Slide-over Drawer / Sheet Modal (Right to Left) */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-[620px] overflow-y-auto p-6 sm:p-8 bg-card border-l border-border shadow-2xl space-y-6"
        >
          <SheetHeader className="p-0 border-b border-border pb-4 text-left">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <SheetTitle className="font-display text-xl font-bold">
                {editingEvent ? "Modifier l'événement" : "Créer un nouvel événement"}
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Renseignez les informations de votre événement pour activer la billetterie et la vitrine publique.
            </SheetDescription>
          </SheetHeader>

          <EventForm
            initialData={editingEvent ?? undefined}
            onSuccess={handleCreateSuccess}
            onCancel={() => {
              setIsDrawerOpen(false);
              setEditingEvent(null);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Events Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {events.map((evt) => {
          const startDateFormatted = new Date(evt.startDate).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          return (
            <div
              key={evt.id}
              className="rounded-3xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                      evt.status === "PUBLISHED"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {evt.status === "PUBLISHED" ? "En Vente & Actif" : "Brouillon"}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">ID: #{evt.id}</span>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">{evt.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{evt.description}</p>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground border-y border-border/60 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-primary shrink-0" />
                    <span className="capitalize font-medium text-foreground">{startDateFormatted}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary shrink-0" />
                    <span>{evt.venueName} • {evt.location}</span>
                  </div>
                </div>

                {/* Sales & Capacity Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Billets vendus</span>
                    <span className="text-foreground font-mono">
                      {evt.soldTicketsCount ?? 0} / {evt.capacity ?? 0}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${Math.min(100, (((evt.soldTicketsCount ?? 0) / (evt.capacity || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Recettes Mobile Money</span>
                  <span className="font-display text-lg font-bold text-emerald-500">
                    {(((evt.totalRevenue ?? 0) / 100)).toLocaleString("fr-FR")} FCFA
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs"
                    onClick={() => handleOpenEdit(evt)}
                  >
                    <Edit3 className="size-3.5 mr-1" />
                    Modifier
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
