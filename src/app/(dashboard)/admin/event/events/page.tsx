"use client";

import { useState } from "react";
import {
  Plus,
  Calendar,
  MapPin,
  Ticket,
  Users,
  Edit3,
  Eye,
  MoreHorizontal,
  Sparkles,
  Award,
  ExternalLink,
  Search,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { EventForm } from "@/components/events/event-form";
import type { Event, EventType } from "@/types/api";
import Link from "next/link";

const INITIAL_EVENTS: Event[] = [
  {
    id: "evt-1",
    title: "Festival Urban Afro Libreville 2026",
    description: "Le plus grand festival de musiques urbaines et afro-fusion d'Afrique Centrale.",
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    eventType: "CONCERT",
    hasCertificate: false,
    ticketTemplate: "FESTIVAL_WRISTBAND",
    startDate: "2026-09-05T19:00:00Z",
    endDate: "2026-09-06T04:00:00Z",
    venueName: "Palais des Sports & de la Culture",
    location: "Libreville, Gabon",
    capacity: 500,
    status: "PUBLISHED",
    soldTicketsCount: 218,
    totalRevenue: 435000000, // in centimes (4 350 000 FCFA)
    checkedInCount: 156,
    createdAt: "2026-08-15T10:00:00Z",
  },
  {
    id: "evt-2",
    title: "Soirée Blanche & Champagne VIP",
    description: "Soirée rooftop privée avec DJ guest international et dégustation.",
    imageUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop",
    eventType: "NIGHTLIFE",
    hasCertificate: false,
    ticketTemplate: "GOLD_VIP",
    startDate: "2026-09-20T21:00:00Z",
    endDate: "2026-09-21T05:00:00Z",
    venueName: "Rooftop Sky Lounge Sablière",
    location: "Libreville, Gabon",
    capacity: 150,
    status: "DRAFT",
    soldTicketsCount: 45,
    totalRevenue: 112500000, // 1 125 000 FCFA
    checkedInCount: 0,
    createdAt: "2026-08-20T12:00:00Z",
  },
  {
    id: "evt-3",
    title: "Masterclass Executive : IA & Croissance Digitale",
    description: "Formation certifiante pour dirigeants et managers avec attestation officielle.",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop",
    eventType: "CONFERENCE",
    hasCertificate: true,
    certificateTemplate: "ACADEMIC_GOLD",
    ticketTemplate: "CONFERENCE_BADGE",
    startDate: "2026-10-10T09:00:00Z",
    endDate: "2026-10-10T17:00:00Z",
    venueName: "Hôtel Radisson Blu Okoume Palace",
    location: "Libreville, Gabon",
    capacity: 80,
    status: "PUBLISHED",
    soldTicketsCount: 62,
    totalRevenue: 310000000, // 3 100 000 FCFA
    checkedInCount: 0,
    createdAt: "2026-08-25T14:00:00Z",
  },
];

const TYPE_LABELS: Record<EventType, { label: string; color: string }> = {
  CONCERT: { label: "Concert / Festival", color: "bg-amber-500/15 text-amber-500 border-amber-500/20" },
  CONFERENCE: { label: "Formation / Conférence", color: "bg-blue-500/15 text-blue-500 border-blue-500/20" },
  NIGHTLIFE: { label: "Soirée VIP", color: "bg-purple-500/15 text-purple-500 border-purple-500/20" },
  EXHIBITION: { label: "Salon / Expo", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20" },
  SPORTS: { label: "Sport & Tournoi", color: "bg-orange-500/15 text-orange-500 border-orange-500/20" },
  SHOW: { label: "Spectacle", color: "bg-pink-500/15 text-pink-500 border-pink-500/20" },
};

export default function EventsListPage() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

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
        imageUrl: created.imageUrl ?? INITIAL_EVENTS[0].imageUrl,
        eventType: created.eventType ?? "CONCERT",
        hasCertificate: created.hasCertificate ?? false,
        certificateTemplate: created.certificateTemplate,
        ticketTemplate: created.ticketTemplate ?? "GOLD_VIP",
        startDate: created.startDate ?? new Date().toISOString(),
        endDate: created.endDate ?? null,
        venueName: created.venueName ?? "Lieu à confirmer",
        location: created.location ?? "Libreville",
        capacity: created.capacity ?? 200,
        ticketTypes: created.ticketTypes,
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

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "ALL" || e.eventType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Mes Événements
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gérez vos affiches, billetteries, modèles de pass et attestations certifiées.
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

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-2.5 shadow-xs">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher par nom d'événement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-8 text-xs rounded-xl bg-muted/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              filterType === "ALL"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tous ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("CONCERT")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              filterType === "CONCERT"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Concerts
          </button>
          <button
            type="button"
            onClick={() => setFilterType("CONFERENCE")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              filterType === "CONFERENCE"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Formations & Certifs
          </button>
          <button
            type="button"
            onClick={() => setFilterType("NIGHTLIFE")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              filterType === "NIGHTLIFE"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Soirées VIP
          </button>
        </div>
      </div>

      {/* Compact & Visual Events Grid (3 columns on Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((evt) => {
          const startDateFormatted = new Date(evt.startDate).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          const typeMeta = evt.eventType
            ? TYPE_LABELS[evt.eventType]
            : { label: "Événement", color: "bg-muted text-muted-foreground" };

          const progressPercent = Math.min(
            100,
            Math.round(((evt.soldTicketsCount ?? 0) / (evt.capacity || 1)) * 100)
          );

          return (
            <div
              key={evt.id}
              className="group rounded-3xl border border-border bg-card overflow-hidden shadow-xs transition-all hover:border-primary/50 hover:shadow-md flex flex-col justify-between"
            >
              {/* Cover Image Banner with Overlaid Badges */}
              <div className="relative h-40 w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    evt.imageUrl ??
                    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop"
                  }
                  alt={evt.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${typeMeta.color}`}
                  >
                    {typeMeta.label}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-md ${
                      evt.status === "PUBLISHED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-black/50 text-zinc-300 border border-white/20"
                    }`}
                  >
                    {evt.status === "PUBLISHED" ? "En Vente" : "Brouillon"}
                  </span>
                </div>

                {/* Certificate tag badge */}
                {evt.hasCertificate && (
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 rounded-md bg-amber-500/90 text-black px-2 py-0.5 text-[10px] font-extrabold shadow-sm">
                    <Award className="size-3" />
                    <span>Attestation Certifiée Giya</span>
                  </div>
                )}
              </div>

              {/* Card Body Content */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-display text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                    {evt.description}
                  </p>
                </div>

                {/* Date & Venue meta */}
                <div className="space-y-1 text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{startDateFormatted}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{evt.venueName}</span>
                  </div>
                </div>

                {/* Sales Progress & Capacity */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-muted-foreground">Billetterie</span>
                    <span className="font-bold text-foreground">
                      {evt.soldTicketsCount ?? 0} / {evt.capacity ?? 0} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Recettes</span>
                  <span className="font-display text-sm font-extrabold text-emerald-500">
                    {(((evt.totalRevenue ?? 0) / 100)).toLocaleString("fr-FR")} F
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    asChild
                    size="sm"
                    className="h-8 rounded-xl text-xs px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs gap-1"
                  >
                    <Link href={`/admin/event/events/${evt.id}`}>
                      Gérer
                      <ExternalLink className="size-3 ml-0.5" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-xl text-xs px-2 text-muted-foreground hover:text-foreground"
                    title="Voir vitrine publique"
                  >
                    <Link href="/demo-event-tenant/event" target="_blank">
                      <Eye className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over Drawer / Sheet Modal */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-[850px] overflow-y-auto p-6 sm:p-8 bg-card border-l border-border shadow-2xl space-y-6"
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
              Configurez le type d&apos;événement, le modèle de pass et les attestations certifiées.
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
    </div>
  );
}
