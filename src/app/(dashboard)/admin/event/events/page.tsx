"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, ChevronDown, LayoutGrid, List, MapPin, MoreHorizontal, Plus, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EvButton, EvCard, EvIconButton, EvPill, EvProgress, EvSegmented, EV_PORTAL } from "@/components/events/ev-ui";
import { AwardIcon, TypeIcon } from "@/components/events/ev-icons";
import { EventEditor } from "@/components/events/editor/event-editor";
import { useAdminEvents, useAdminTenant, useDeleteEvent, useEventStats, useSetEventStatus } from "@/hooks/useEvents";
import { apiErrorMessage } from "@/lib/events";
import { publicSiteUrl } from "@/lib/tenant-url";
import { amount, daysUntilLabel, EVENT_TYPE_OPTIONS, formatEventDay, pct, STATUS_META, typeOption } from "@/lib/event-meta";
import { cn } from "@/lib/utils";
import type { ApiEvent, EventStats } from "@/types/events";

// « Mes événements » (refonte Claude Design 2026-11, écran 1).
type StatusTab = "ALL" | "ON_SALE" | "DRAFT" | "DONE";

const onSale = (e: ApiEvent) => e.status === "PUBLISHED" || e.status === "ONGOING";
const done = (e: ApiEvent) => e.status === "COMPLETED" || e.status === "CANCELLED";

function capacityOf(e: ApiEvent) {
  return e.capacity ?? e.ticketTypes.reduce((n, t) => n + t.quantity, 0);
}
function potentialOf(e: ApiEvent) {
  return e.ticketTypes.reduce((n, t) => n + t.price * t.quantity, 0);
}

export default function EventsListPage() {
  const router = useRouter();
  const { data: events, isLoading, isError } = useAdminEvents();
  const { data: statsList } = useEventStats();
  const { data: tenant } = useAdminTenant();
  const setStatus = useSetEventStatus();
  const deleteEvent = useDeleteEvent();

  const [tab, setTab] = useState<StatusTab>("ALL");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("ALL");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [editor, setEditor] = useState<{ open: boolean; event: ApiEvent | null }>({ open: false, event: null });

  const statsOf = useMemo(() => {
    const map = new Map((statsList ?? []).map((s) => [s.eventId, s]));
    return (id: string) => map.get(id);
  }, [statsList]);

  const all = events ?? [];
  const counts = {
    ALL: all.length,
    ON_SALE: all.filter(onSale).length,
    DRAFT: all.filter((e) => e.status === "DRAFT").length,
    DONE: all.filter(done).length,
  };

  const shown = all
    .filter((e) => (tab === "ALL" ? true : tab === "ON_SALE" ? onSale(e) : tab === "DRAFT" ? e.status === "DRAFT" : done(e)))
    .filter((e) => type === "ALL" || (type === "OTHER" ? !e.eventType : e.eventType === type))
    .filter((e) => e.title.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  // Indicateurs (tous les événements du compte).
  const sold = all.reduce((n, e) => n + (statsOf(e.id)?.issued ?? 0), 0);
  const capacity = all.reduce((n, e) => n + capacityOf(e), 0);
  const revenue = all.reduce((n, e) => n + (statsOf(e.id)?.revenue ?? 0), 0);
  const potential = all.reduce((n, e) => n + potentialOf(e), 0);
  const [nowMs] = useState(() => Date.now());
  const next = all
    .filter((e) => new Date(e.endDate ?? e.startDate).getTime() >= nowMs && e.status !== "CANCELLED")
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  const typeLabel = type === "ALL" ? "Tous" : EVENT_TYPE_OPTIONS.find((o) => o.key === type)?.label ?? "Tous";

  async function toggleSale(e: ApiEvent) {
    try {
      await setStatus.mutateAsync({ id: e.id, status: onSale(e) ? "DRAFT" : "PUBLISHED" });
      toast.success(onSale(e) ? "Vente mise en pause (brouillon)." : "Billetterie ouverte au public.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Changement de statut impossible."));
    }
  }

  async function remove(e: ApiEvent) {
    if (!window.confirm(`Supprimer « ${e.title} » ? Cette action est définitive.`)) return;
    try {
      await deleteEvent.mutateAsync(e.id);
      toast.success("Événement supprimé.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Suppression impossible : des billets ont été émis. Archivez-le plutôt (Annuler)."));
    }
  }

  const actions = (e: ApiEvent) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EvIconButton size={38} aria-label="Plus d'actions">
          <MoreHorizontal />
        </EvIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`${EV_PORTAL} w-52 rounded-xl`}>
        {tenant && (
          <DropdownMenuItem asChild>
            <a href={publicSiteUrl(tenant.slug, `/events/${e.id}`)} target="_blank" rel="noreferrer">
              Voir la vitrine
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => setEditor({ open: true, event: e })}>Modifier</DropdownMenuItem>
        {(e.status === "DRAFT" || onSale(e)) && (
          <DropdownMenuItem onClick={() => void toggleSale(e)}>{onSale(e) ? "Mettre la vente en pause" : "Ouvrir la vente"}</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-ev-danger focus:text-ev-danger" onClick={() => void remove(e)}>
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="mx-auto flex max-w-[1320px] flex-col gap-7 px-4 pb-16 pt-6 sm:px-8 sm:pt-9">
      <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[24px] font-semibold tracking-[-0.02em] sm:text-[30px]">Mes événements</h1>
          <p className="m-0 text-sm text-ev-muted sm:text-[15px]">Billetterie, pass, contrôle d&apos;accès et attestations certifiées.</p>
        </div>
        <EvButton variant="primary" size="lg" className="w-full sm:w-auto" onClick={() => setEditor({ open: true, event: null })}>
          <Plus strokeWidth={2.2} />
          Créer un événement
        </EvButton>
      </div>

      <section aria-label="Résumé" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi label="Événements en vente" value={counts.ON_SALE} sub={`${counts.DRAFT} brouillon${counts.DRAFT > 1 ? "s" : ""} · ${all.filter((e) => e.status === "COMPLETED").length} terminé`} />
        <Kpi label="Billets vendus" value={sold} unit={`/ ${capacity}`} sub={`${pct(sold, capacity)} % de la capacité totale`} />
        <Kpi label="Recettes encaissées" value={amount(revenue)} unit="FCFA" sub={`sur ${amount(potential)} FCFA potentiels`} />
        <Kpi label="Prochain événement" value={next ? daysUntilLabel(next.startDate) : "—"} sub={next ? formatEventDay(next.startDate) : "Aucun à venir"} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <EvSegmented<StatusTab>
          ariaLabel="Statut"
          value={tab}
          onChange={setTab}
          items={[
            { value: "ALL", label: "Tous", count: counts.ALL },
            { value: "ON_SALE", label: "En vente", count: counts.ON_SALE },
            { value: "DRAFT", label: "Brouillons", count: counts.DRAFT },
            { value: "DONE", label: "Terminés", count: counts.DONE },
          ]}
        />
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-ev-muted sm:w-[280px] sm:flex-none">
            <Search className="size-4 shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un événement"
              aria-label="Rechercher un événement"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ev-ink outline-none placeholder:text-ev-muted"
            />
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex h-10 items-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] text-ev-ink">
                Type : {typeLabel}
                <ChevronDown className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`${EV_PORTAL} w-56 rounded-xl`}>
              <DropdownMenuItem onClick={() => setType("ALL")}>Tous</DropdownMenuItem>
              {EVENT_TYPE_OPTIONS.map((o) => (
                <DropdownMenuItem key={o.key} onClick={() => setType(o.key)} className="gap-2">
                  <TypeIcon icon={o.icon} size={14} />
                  {o.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex overflow-hidden rounded-[10px] border border-ev-border bg-ev-surface">
            {(
              [
                ["grid", "Vue grille", LayoutGrid],
                ["list", "Vue liste", List],
              ] as const
            ).map(([v, label, Icon]) => (
              <button
                key={v}
                type="button"
                aria-label={label}
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={cn("flex h-[38px] w-10 items-center justify-center", view === v ? "bg-ev-line text-ev-ink" : "text-ev-muted")}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && <p className="text-sm text-ev-muted">Chargement des événements…</p>}
      {isError && <p className="text-sm text-ev-danger">Impossible de charger les événements. Réessayez.</p>}

      {!isLoading && !isError && view === "grid" && (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((e) => (
            <EventCard key={e.id} event={e} stats={statsOf(e.id)} actions={actions(e)} onOpen={() => router.push(`/admin/event/events/${e.id}`)} />
          ))}
          <button
            type="button"
            onClick={() => setEditor({ open: true, event: null })}
            className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[16px] border-[1.5px] border-dashed border-ev-dash bg-transparent px-6 text-ev-ink2 transition-colors hover:bg-ev-surface md:min-h-[420px]"
          >
            <span className="flex size-12 items-center justify-center rounded-[12px] bg-ev-mint text-ev-primary dark:text-ev-link">
              <Plus className="size-[22px]" />
            </span>
            <span className="text-[15px] font-semibold text-ev-ink">Nouvel événement</span>
            <span className="max-w-[240px] text-center text-[13px] leading-normal text-ev-muted">
              Concert, formation, soirée… Billetterie et pass prêts en quelques minutes.
            </span>
          </button>
        </section>
      )}

      {!isLoading && !isError && view === "list" && (
        <EvCard className="overflow-hidden">
          {shown.length === 0 ? (
            <p className="p-8 text-center text-sm text-ev-muted">Aucun événement pour ces filtres.</p>
          ) : (
            <ul className="divide-y divide-ev-line">
              {shown.map((e) => {
                const s = statsOf(e.id);
                const cap = capacityOf(e);
                return (
                  <li key={e.id} className="flex flex-wrap items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">
                    <div className="size-12 shrink-0 overflow-hidden rounded-[10px] bg-[#0B1B1C] sm:size-14">
                      {e.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={e.imageUrl} alt="" className="size-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-[180px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/admin/event/events/${e.id}`} className="truncate text-[15px] font-semibold text-ev-ink hover:underline">
                          {e.title}
                        </Link>
                        <EvPill tone={STATUS_META[e.status].tone}>{STATUS_META[e.status].label}</EvPill>
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-ev-muted">
                        {formatEventDay(e.startDate)} · {e.venueName || e.location || "Lieu à préciser"}
                      </p>
                    </div>
                    <div className="w-full sm:w-40">
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-ev-muted">Billets</span>
                        <span className="font-semibold">
                          {s?.issued ?? 0} / {cap}
                        </span>
                      </div>
                      <EvProgress value={pct(s?.issued ?? 0, cap)} />
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-2 sm:w-auto sm:flex-none sm:justify-end sm:gap-4">
                      <div className="sm:w-32 sm:text-right">
                        <p className="text-xs text-ev-muted">Recettes</p>
                        <p className="text-sm font-semibold">{amount(s?.revenue ?? 0)} FCFA</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Link href={`/admin/event/events/${e.id}`} className="flex h-[38px] items-center rounded-[10px] bg-ev-primary px-4 text-[13px] font-semibold text-white hover:bg-ev-primary-hover">
                          Gérer
                        </Link>
                        {actions(e)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </EvCard>
      )}

      <EventEditor open={editor.open} event={editor.event} onOpenChange={(open) => setEditor((s) => ({ ...s, open }))} onCreated={(id) => router.push(`/admin/event/events/${id}`)} />
    </div>
  );
}

function Kpi({ label, value, unit, sub }: { label: string; value: string | number; unit?: string; sub: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-[14px] border border-ev-border bg-ev-surface px-4 py-4 sm:px-5">
      <span className="text-[13px] text-ev-muted">{label}</span>
      <span className="text-[22px] font-semibold tracking-[-0.02em] sm:text-[26px]">
        {value} {unit && <span className="text-[15px] font-medium text-ev-muted">{unit}</span>}
      </span>
      <span className="text-xs text-ev-muted">{sub}</span>
    </div>
  );
}

function EventCard({ event: e, stats, actions, onOpen }: { event: ApiEvent; stats?: EventStats; actions: React.ReactNode; onOpen: () => void }) {
  const meta = STATUS_META[e.status];
  const type = typeOption(e.eventType);
  const cap = capacityOf(e);
  const issued = stats?.issued ?? 0;
  return (
    <article className="flex flex-col overflow-hidden rounded-[16px] border border-ev-border bg-ev-surface">
      <button type="button" onClick={onOpen} className="relative h-[180px] bg-[#0B1B1C] text-left" aria-label={`Ouvrir ${e.title}`}>
        {e.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.imageUrl} alt="Affiche de l'événement" className="block size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-white/40">
            <TypeIcon icon={type.icon} size={40} />
          </span>
        )}
        <span className="absolute left-3 top-3">
          <EvPill tone={meta.tone} onImage={meta.tone === "ok"}>
            {meta.label}
          </EvPill>
        </span>
      </button>
      <div className="flex flex-1 flex-col gap-3.5 px-5 pb-5 pt-[18px]">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ev-muted">
            <span>{type.card}</span>
            {e.settings?.hasCertificate && (
              <>
                <span aria-hidden>·</span>
                <span className="flex items-center gap-1 font-medium text-ev-gold-text">
                  <AwardIcon />
                  Certifiant
                </span>
              </>
            )}
          </div>
          <h2 className="m-0 text-lg font-semibold tracking-[-0.01em]">{e.title}</h2>
        </div>
        <div className="flex flex-col gap-1.5 text-[13px] text-ev-ink2">
          <span className="flex items-center gap-2">
            <Calendar className="size-[15px] shrink-0 text-ev-muted" />
            {formatEventDay(e.startDate)}
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <MapPin className="size-[15px] shrink-0 text-ev-muted" />
            <span className="truncate">{e.venueName || e.location || "Lieu à préciser"}</span>
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-ev-muted">Billets vendus</span>
            <span className="font-semibold">
              {issued} / {cap}
            </span>
          </div>
          <EvProgress value={pct(issued, cap)} />
        </div>
        <div className="mt-auto flex items-center justify-between gap-2.5 border-t border-ev-line pt-3.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-ev-muted">Recettes</span>
            <span className="text-base font-semibold">{amount(stats?.revenue ?? 0)} FCFA</span>
          </div>
          <div className="flex gap-1.5">
            <Link href={`/admin/event/events/${e.id}`} className="flex h-[38px] items-center rounded-[10px] bg-ev-primary px-4 text-[13px] font-semibold text-white hover:bg-ev-primary-hover">
              Gérer
            </Link>
            {actions}
          </div>
        </div>
      </div>
    </article>
  );
}
