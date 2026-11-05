"use client";

import { use, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, MoreHorizontal, Pencil, ScanLine } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EV_PORTAL, EvButton, EvIconButton, EvPill } from "@/components/events/ev-ui";
import { EventEditor } from "@/components/events/editor/event-editor";
import { TabOverview } from "@/components/events/detail/tab-overview";
import { TabParticipants } from "@/components/events/detail/tab-participants";
import { TabCertificates } from "@/components/events/detail/tab-certificates";
import { TabStats } from "@/components/events/detail/tab-stats";
import { useAdminEvent, useAdminTenant, useDeleteEvent, useEventStats, useEventTickets, useSaveEvent, useSetEventStatus } from "@/hooks/useEvents";
import { apiErrorMessage, toAttendees, toUiEvent } from "@/lib/events";
import { formatEventDay, formatTime, STATUS_META, typeOption } from "@/lib/event-meta";
import { publicSiteUrl } from "@/lib/tenant-url";
import { cn } from "@/lib/utils";

// Détail d'un événement (refonte Claude Design 2026-11, écrans 2 à 5) :
// Aperçu, Participants, Certifications, Statistiques. Onglet dans l'URL (?tab=).
type Tab = "apercu" | "participants" | "certifications" | "statistiques";
const TABS: { id: Tab; label: string }[] = [
  { id: "apercu", label: "Aperçu" },
  { id: "participants", label: "Participants" },
  { id: "certifications", label: "Certifications" },
  { id: "statistiques", label: "Statistiques" },
];

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const tab = (TABS.find((t) => t.id === search.get("tab"))?.id ?? "apercu") as Tab;

  const { data: event, isLoading, isError } = useAdminEvent(id);
  const { data: statsList } = useEventStats(id);
  const { data: tickets } = useEventTickets(id);
  const { data: tenant } = useAdminTenant();
  const setStatus = useSetEventStatus();
  const deleteEvent = useDeleteEvent();
  const saveEvent = useSaveEvent();
  const [editor, setEditor] = useState<{ open: boolean; step: 1 | 2 | 3 | 4 }>({ open: false, step: 1 });

  const stats = statsList?.find((s) => s.eventId === id) ?? statsList?.[0];
  const participants = toAttendees(tickets ?? []);
  const openEditor = (step: 1 | 2 | 3 | 4 = 1) => setEditor({ open: true, step });
  const goTab = (t: Tab) => router.replace(`${pathname}${t === "apercu" ? "" : `?tab=${t}`}`, { scroll: false });

  if (isLoading) return <p className="px-8 py-10 text-sm text-ev-muted">Chargement de l&apos;événement…</p>;
  if (isError || !event) {
    return (
      <div className="space-y-3 px-8 py-10">
        <p className="text-sm text-ev-danger">Événement introuvable.</p>
        <Link href="/admin/event/events" className="text-sm font-semibold text-ev-link underline">
          Retour à mes événements
        </Link>
      </div>
    );
  }

  const meta = STATUS_META[event.status];
  const onSale = event.status === "PUBLISHED" || event.status === "ONGOING";
  const publicUrl = tenant ? publicSiteUrl(tenant.slug, `/events/${event.id}`) : null;

  async function changeStatus(status: "DRAFT" | "PUBLISHED" | "CANCELLED", message: string) {
    try {
      await setStatus.mutateAsync({ id, status });
      toast.success(message);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Changement de statut impossible."));
    }
  }

  async function duplicate() {
    if (!event) return;
    const ui = toUiEvent(event);
    try {
      const newId = await saveEvent.mutateAsync({
        existing: null,
        form: { ...ui, title: `${event.title} (copie)`, status: "DRAFT", ticketTypes: (ui.ticketTypes ?? []).map((t) => ({ ...t, sold: 0 })) },
      });
      toast.success("Événement dupliqué en brouillon.");
      router.push(`/admin/event/events/${newId}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Duplication impossible."));
    }
  }

  async function remove() {
    if (!window.confirm(`Supprimer « ${event?.title} » ? Cette action est définitive.`)) return;
    try {
      await deleteEvent.mutateAsync(id);
      toast.success("Événement supprimé.");
      router.push("/admin/event/events");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Suppression impossible : des billets ont été émis. Annulez plutôt l'événement."));
    }
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-ev-border bg-ev-surface">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-[18px] px-4 pt-5 sm:px-8">
          <nav aria-label="Fil d'Ariane" className="flex min-w-0 items-center gap-2 text-[13px] text-ev-muted">
            <Link href="/admin/event/events" className="shrink-0 hover:text-ev-ink">
              Mes événements
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate text-ev-ink">{event.title}</span>
          </nav>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="m-0 text-[24px] font-semibold tracking-[-0.02em] sm:text-[28px]">{event.title}</h1>
                <EvPill tone={meta.tone}>{meta.label}</EvPill>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ev-muted">
                <span>
                  {formatEventDay(event.startDate)} · {formatTime(event.startDate)}
                </span>
                {(event.venueName || event.location) && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{event.venueName || event.location}</span>
                  </>
                )}
                <span aria-hidden>·</span>
                <span>{typeOption(event.eventType).card}</span>
              </div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              {publicUrl && (
                <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] font-medium text-ev-ink hover:bg-ev-soft sm:px-3.5 [&_svg]:size-4">
                  <Eye />
                  <span className="hidden xs:inline sm:inline">Voir la vitrine</span>
                  <span className="xs:hidden sm:hidden">Vitrine</span>
                </a>
              )}
              <EvButton onClick={() => openEditor(1)} className="px-3 sm:px-3.5">
                <Pencil />
                Modifier
              </EvButton>
              <Link href="/scan" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[10px] bg-ev-primary px-3.5 text-[13px] font-semibold text-white hover:bg-ev-primary-hover sm:flex-none sm:px-4 [&_svg]:size-4">
                <ScanLine />
                Scanner les pass
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <EvIconButton aria-label="Plus d'actions (mettre en pause, dupliquer, archiver)">
                    <MoreHorizontal />
                  </EvIconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`${EV_PORTAL} w-56 rounded-xl`}>
                  {(onSale || event.status === "DRAFT") && (
                    <DropdownMenuItem onClick={() => void changeStatus(onSale ? "DRAFT" : "PUBLISHED", onSale ? "Vente mise en pause (brouillon)." : "Billetterie ouverte au public.")}>
                      {onSale ? "Mettre la vente en pause" : "Ouvrir la vente"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => void duplicate()}>Dupliquer</DropdownMenuItem>
                  {event.status !== "CANCELLED" && (
                    <DropdownMenuItem
                      onClick={() => {
                        if (window.confirm("Annuler l'événement ? Il ne sera plus en vente (archivé).")) void changeStatus("CANCELLED", "Événement annulé et archivé.");
                      }}
                    >
                      Annuler et archiver
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-ev-danger focus:text-ev-danger" onClick={() => void remove()}>
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <nav aria-label="Sections de l'événement" className="-mb-px flex gap-7 overflow-x-auto text-sm [scrollbar-width:none]">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => goTab(t.id)}
                  className={cn(
                    "whitespace-nowrap border-b-2 pb-3 pt-2.5",
                    active ? "border-ev-primary font-semibold text-ev-ink dark:border-ev-link" : "border-transparent font-medium text-ev-muted hover:text-ev-ink"
                  )}
                >
                  {t.label}
                  {t.id === "participants" && <span className="ml-1 rounded-full bg-ev-line px-[7px] py-px text-xs text-ev-ink2">{participants.length}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1320px] px-4 pb-16 pt-7 sm:px-8">
        {tab === "apercu" && <TabOverview event={event} stats={stats} tenant={tenant} onEdit={openEditor} onTab={goTab} />}
        {tab === "participants" && <TabParticipants event={event} stats={stats} tickets={tickets ?? []} />}
        {tab === "certifications" && <TabCertificates event={event} tickets={tickets ?? []} orgName={tenant?.name ?? "Votre organisation"} onEdit={openEditor} />}
        {tab === "statistiques" && <TabStats event={event} stats={stats} tickets={tickets ?? []} />}
      </div>

      <EventEditor open={editor.open} event={event} initialStep={editor.step} onOpenChange={(open) => setEditor((s) => ({ ...s, open }))} />
    </div>
  );
}
