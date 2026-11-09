"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Download,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EV_PORTAL,
  EvButton,
  EvCard,
  EvCheckbox,
  EvInput,
  EvLabel,
  EvSegmented,
  EvSelect,
  initialsOf,
} from "@/components/events/ev-ui";
import { useCheckIn, useRefundOrder } from "@/hooks/useEvents";
import { api } from "@/lib/api";
import { downloadTickets } from "@/lib/download";
import { apiErrorMessage, normalizePhone } from "@/lib/events";
import { amount, formulaColor, pct } from "@/lib/event-meta";
import type { ApiEvent, ApiTicket, EventStats } from "@/types/events";

type EntryFilter = "ALL" | "ENTERED" | "WAITING" | "REFUNDED";

type Props = {
  event: ApiEvent;
  stats?: EventStats;
  tickets: ApiTicket[];
  onRefresh?: () => void;
};

const PAGE_SIZE = 20;

export function TabParticipants({ event, stats, tickets }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EntryFilter>("ALL");
  const [formulaFilter, setFormulaFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);

  const checkIn = useCheckIn(event.id);
  const refundOrder = useRefundOrder(event.id);

  // Billets affichés comme participants : VALID, USED, REFUNDED
  const participantTickets = useMemo(
    () =>
      tickets.filter(
        (t) => t.status === "VALID" || t.status === "USED" || t.status === "REFUNDED"
      ),
    [tickets]
  );

  // Couleur associée à chaque formule
  const colorByFormulaName = useMemo(() => {
    const map = new Map<string, string>();
    event.ticketTypes.forEach((t, idx) => {
      map.set(t.name, formulaColor(idx));
    });
    return map;
  }, [event.ticketTypes]);

  const counts = useMemo(() => {
    let entered = 0;
    let waiting = 0;
    let refunded = 0;
    for (const t of participantTickets) {
      if (t.status === "USED") entered += 1;
      else if (t.status === "VALID") waiting += 1;
      else if (t.status === "REFUNDED") refunded += 1;
    }
    return {
      all: participantTickets.length,
      entered,
      waiting,
      refunded,
    };
  }, [participantTickets]);

  const issuedCount =
    stats?.issued ?? participantTickets.filter((t) => t.status !== "REFUNDED").length;
  const totalCapacity =
    event.capacity ?? event.ticketTypes.reduce((sum, t) => sum + (t.quantity || 0), 0);
  const enteredCount = stats?.scanned ?? counts.entered;
  const waitingCount = Math.max(0, issuedCount - enteredCount);
  const enteredPct = pct(enteredCount, issuedCount);
  const revenue =
    stats?.revenue ??
    participantTickets
      .filter((t) => t.status !== "REFUNDED")
      .reduce((sum, t) => sum + (t.ticketType?.price ?? 0), 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return participantTickets.filter((t) => {
      if (statusFilter === "ENTERED" && t.status !== "USED") return false;
      if (statusFilter === "WAITING" && t.status !== "VALID") return false;
      if (statusFilter === "REFUNDED" && t.status !== "REFUNDED") return false;
      if (formulaFilter !== "ALL" && t.ticketType.name !== formulaFilter) return false;
      if (!q) return true;
      const code = t.id.slice(0, 8).toLowerCase();
      return (
        (t.customerName ?? "").toLowerCase().includes(q) ||
        (t.customerEmail ?? "").toLowerCase().includes(q) ||
        (t.customerPhone ?? "").toLowerCase().includes(q) ||
        code.includes(q)
      );
    });
  }, [participantTickets, query, statusFilter, formulaFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Nombre d'acheteurs distincts
  const uniqueBuyers = useMemo(() => {
    const keys = new Set<string>();
    for (const t of filtered) {
      const k = (t.orderId || t.customerEmail || t.customerPhone || t.customerName || t.id)
        .trim()
        .toLowerCase();
      keys.add(k);
    }
    return keys.size;
  }, [filtered]);

  const allOnPageSelected =
    paged.length > 0 && paged.every((t) => selectedIds.has(t.id));

  function toggleAllOnPage(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const t of paged) {
        if (checked) next.add(t.id);
        else next.delete(t.id);
      }
      return next;
    });
  }

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleExportCsv() {
    if (filtered.length === 0) {
      toast.error("Aucun participant à exporter.");
      return;
    }
    const header = [
      "Participant",
      "E-mail",
      "Téléphone",
      "Billet",
      "Formule",
      "Montant (FCFA)",
      "Entrée",
      "Attestation",
    ];
    const rows = filtered.map((t) => {
      const code = t.id.slice(0, 8).toUpperCase();
      const entry =
        t.status === "USED"
          ? "Entré"
          : t.status === "REFUNDED"
            ? "Remboursé"
            : "En attente";
      const cert = t.status === "USED" ? "Éligible" : "En attente de scan";
      return [
        t.customerName ?? "—",
        t.customerEmail ?? "",
        t.customerPhone ?? "",
        code,
        t.ticketType.name,
        String(Math.round(t.ticketType.price / 100)),
        entry,
        cert,
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(";");
    });
    const blob = new Blob(["\uFEFF" + [header.join(";"), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `participants-${event.id.slice(0, 8)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} participant(s) exporté(s).`);
  }

  async function handleManualCheckIn(t: ApiTicket) {
    if (!t.qrCode) {
      toast.error("Code QR indisponible pour ce billet.");
      return;
    }
    try {
      const res = await checkIn.mutateAsync(t.qrCode);
      if (res.status === "valid") {
        toast.success(`Entrée validée pour ${t.customerName || "ce participant"}.`);
      } else if (res.status === "used") {
        toast.info("Ce billet a déjà été scanné.");
      } else {
        toast.error(res.detail || "Billet non valide.");
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Validation impossible."));
    }
  }

  async function handleRefund(t: ApiTicket) {
    if (!t.orderId) {
      toast.error("Ce billet n'est rattaché à aucune commande remboursable.");
      return;
    }
    if (
      !window.confirm(
        `Rembourser la commande de ${t.customerName || "ce participant"} et remettre la place en vente ?`
      )
    ) {
      return;
    }
    try {
      await refundOrder.mutateAsync({ orderId: t.orderId, releaseSeats: true });
      toast.success("Commande remboursée et place remise en vente.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Remboursement impossible."));
    }
  }

  return (
    <main className="flex flex-col gap-5">
      {/* Indicateurs en 4 colonnes */}
      <EvCard
        aria-label="Indicateurs"
        className="grid grid-cols-2 overflow-hidden lg:grid-cols-4"
      >
        <div className="flex flex-col gap-1.5 border-b border-r border-ev-line px-4 py-3.5 sm:px-[22px] sm:py-[18px] lg:border-b-0">
          <span className="text-xs text-ev-muted sm:text-[13px]">Billets émis</span>
          <span className="text-xl font-semibold sm:text-2xl">
            {issuedCount}{" "}
            <span className="text-xs font-medium text-ev-muted sm:text-sm">
              / {totalCapacity || "—"}
            </span>
          </span>
        </div>
        <div className="flex flex-col gap-1.5 border-b border-ev-line px-4 py-3.5 sm:px-[22px] sm:py-[18px] lg:border-b-0 lg:border-r">
          <span className="text-xs text-ev-muted sm:text-[13px]">Entrés</span>
          <span className="text-xl font-semibold sm:text-2xl">
            {enteredCount}{" "}
            <span className="text-xs font-medium text-ev-ok sm:text-sm">{enteredPct} %</span>
          </span>
        </div>
        <div className="flex flex-col gap-1.5 border-r border-ev-line px-4 py-3.5 sm:px-[22px] sm:py-[18px]">
          <span className="text-xs text-ev-muted sm:text-[13px]">En attente d&apos;entrée</span>
          <span className="text-xl font-semibold sm:text-2xl">{waitingCount}</span>
        </div>
        <div className="flex flex-col gap-1.5 px-4 py-3.5 sm:px-[22px] sm:py-[18px]">
          <span className="text-xs text-ev-muted sm:text-[13px]">Recettes encaissées</span>
          <span className="text-xl font-semibold sm:text-2xl">
            {amount(revenue)}{" "}
            <span className="text-xs font-medium text-ev-muted sm:text-sm">FCFA</span>
          </span>
        </div>
      </EvCard>

      {/* Tableau des participants */}
      <EvCard className="overflow-hidden">
        {/* Barre de filtres et d'actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ev-line px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex w-full flex-wrap items-center gap-2.5 lg:w-auto">
            <label className="flex h-[38px] w-full items-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-ev-muted sm:w-80">
              <Search className="size-4 shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Nom, e-mail, téléphone ou n° de billet"
                aria-label="Rechercher un participant"
                className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-ev-ink outline-none placeholder:text-ev-muted"
              />
            </label>

            <EvSegmented<EntryFilter>
              size="sm"
              ariaLabel="Statut d'entrée"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              items={[
                { value: "ALL", label: "Tous", count: counts.all },
                { value: "ENTERED", label: "Entrés", count: counts.entered },
                { value: "WAITING", label: "En attente", count: counts.waiting },
                { value: "REFUNDED", label: "Remboursés", count: counts.refunded },
              ]}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-[38px] items-center gap-1.5 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] text-ev-ink hover:bg-ev-soft"
                >
                  Formule : {formulaFilter === "ALL" ? "Toutes" : formulaFilter}
                  <ChevronDown className="size-3.5 text-ev-muted" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className={`${EV_PORTAL} w-52 rounded-xl`}>
                <DropdownMenuItem
                  onClick={() => {
                    setFormulaFilter("ALL");
                    setPage(1);
                  }}
                >
                  Toutes les formules
                </DropdownMenuItem>
                {event.ticketTypes.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => {
                      setFormulaFilter(t.name);
                      setPage(1);
                    }}
                  >
                    {t.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex h-[38px] flex-1 items-center justify-center gap-2 rounded-[10px] border border-ev-border bg-ev-surface px-3 text-[13px] font-medium text-ev-ink hover:bg-ev-soft sm:flex-none"
            >
              <Download className="size-4" />
              Exporter
            </button>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex h-[38px] flex-1 items-center justify-center gap-2 rounded-[10px] bg-ev-primary px-3.5 text-[13px] font-semibold text-white hover:bg-ev-primary-hover sm:flex-none"
            >
              <Plus className="size-4" />
              Ajouter / inviter
            </button>
          </div>
        </div>

        {/* Liste mobile en cartes (< md) */}
        <div className="divide-y divide-ev-line md:hidden">
          {paged.length > 0 ? (
            paged.map((t) => {
              const name = t.customerName?.trim() || "Participant";
              const contact = [t.customerEmail, t.customerPhone].filter(Boolean).join(" · ");
              const shortCode = t.id.slice(0, 8).toUpperCase();
              const dotColor = colorByFormulaName.get(t.ticketType.name) ?? formulaColor(0);
              const isUsed = t.status === "USED";
              const isRefunded = t.status === "REFUNDED";

              return (
                <div key={t.id} className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <EvCheckbox
                        size={16}
                        checked={selectedIds.has(t.id)}
                        onChange={(v) => toggleOne(t.id, v)}
                        ariaLabel={`Sélectionner ${name}`}
                      />
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ev-mint text-xs font-semibold text-ev-primary dark:text-ev-link">
                        {initialsOf(name)}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold text-ev-ink">{name}</span>
                        <span className="truncate text-xs text-ev-muted">
                          {contact || "Coordonnées non renseignées"}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label="Actions : renvoyer le billet, rembourser"
                          className="flex size-8 shrink-0 items-center justify-center rounded-[8px] border-0 bg-transparent text-ev-ink2 hover:bg-ev-line"
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className={`${EV_PORTAL} w-56 rounded-xl`}>
                        {t.qrCode && !isRefunded && (
                          <DropdownMenuItem onClick={() => void downloadTickets([t.qrCode!]).catch(() => toast.error("Téléchargement impossible, réessayez."))}>
                            Télécharger le billet (PDF)
                          </DropdownMenuItem>
                        )}
                        {t.status === "VALID" && (
                          <DropdownMenuItem onClick={() => void handleManualCheckIn(t)}>
                            Valider l&apos;entrée maintenant
                          </DropdownMenuItem>
                        )}
                        {t.orderId && !isRefunded && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-ev-danger focus:text-ev-danger"
                              onClick={() => void handleRefund(t)}
                            >
                              Rembourser la commande
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-ev-bg px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-ev-mono text-ev-ink2">#{shortCode}</span>
                      <span aria-hidden className="text-ev-muted">·</span>
                      <span className="inline-flex items-center gap-1.5 font-medium text-ev-ink">
                        <span
                          className="size-2 shrink-0 rounded-[2px]"
                          style={{ background: dotColor }}
                        />
                        {t.ticketType.name}
                      </span>
                    </div>
                    <span className="font-semibold text-ev-ink">
                      {t.ticketType.price === 0 ? "Gratuit" : `${amount(t.ticketType.price)} F`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      {isUsed ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-ev-ok">
                          <Check className="size-3.5 stroke-[2.5]" />
                          Entré
                        </span>
                      ) : isRefunded ? (
                        <span className="text-ev-danger">Remboursé</span>
                      ) : (
                        <span className="text-ev-muted">En attente d&apos;entrée</span>
                      )}
                    </div>
                    <span className="text-ev-muted">
                      Attestation : {isUsed ? "Éligible" : isRefunded ? "—" : "Après scan"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="px-4 py-10 text-center text-sm text-ev-muted">
              Aucun participant ne correspond aux filtres sélectionnés.
            </p>
          )}
        </div>

        {/* Table desktop (>= md) */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="bg-ev-soft text-left text-xs text-ev-muted">
                <th className="w-5 px-5 py-3 font-medium">
                  <EvCheckbox
                    size={16}
                    checked={allOnPageSelected}
                    onChange={toggleAllOnPage}
                    ariaLabel="Tout sélectionner"
                  />
                </th>
                <th className="px-2 py-3 font-medium">Participant</th>
                <th className="px-2 py-3 font-medium">Billet</th>
                <th className="px-2 py-3 font-medium">Formule</th>
                <th className="px-2 py-3 text-right font-medium">Montant</th>
                <th className="py-3 pl-8 pr-2 font-medium">Entrée</th>
                <th className="px-2 py-3 font-medium">Attestation</th>
                <th className="w-10 px-5 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.length > 0 ? (
                paged.map((t) => {
                  const name = t.customerName?.trim() || "Participant";
                  const contact = [t.customerEmail, t.customerPhone]
                    .filter(Boolean)
                    .join(" · ");
                  const shortCode = t.id.slice(0, 8).toUpperCase();
                  const dotColor =
                    colorByFormulaName.get(t.ticketType.name) ?? formulaColor(0);
                  const isUsed = t.status === "USED";
                  const isRefunded = t.status === "REFUNDED";

                  return (
                    <tr key={t.id} className="border-t border-ev-line">
                      <td className="px-5 py-3.5">
                        <EvCheckbox
                          size={16}
                          checked={selectedIds.has(t.id)}
                          onChange={(v) => toggleOne(t.id, v)}
                          ariaLabel={`Sélectionner ${name}`}
                        />
                      </td>
                      <td className="px-2 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-ev-mint text-xs font-semibold text-ev-primary dark:text-ev-link">
                            {initialsOf(name)}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-ev-ink">{name}</span>
                            <span className="text-xs text-ev-muted">
                              {contact || "Coordonnées non renseignées"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3.5 font-ev-mono text-[13px] text-ev-ink2">
                        {shortCode}
                      </td>
                      <td className="px-2 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[13px]">
                          <span
                            className="size-2 shrink-0 rounded-[2px]"
                            style={{ background: dotColor }}
                          />
                          {t.ticketType.name}
                        </span>
                      </td>
                      <td className="px-2 py-3.5 text-right font-medium">
                        {t.ticketType.price === 0
                          ? "Gratuit"
                          : `${amount(t.ticketType.price)} F`}
                      </td>
                      <td className="py-3.5 pl-8 pr-2">
                        {isUsed ? (
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ev-ok">
                            <Check className="size-3.5 stroke-[2.5]" />
                            Entré
                          </span>
                        ) : isRefunded ? (
                          <span className="text-[13px] text-ev-danger">Remboursé</span>
                        ) : (
                          <span className="text-[13px] text-ev-muted">En attente</span>
                        )}
                      </td>
                      <td className="px-2 py-3.5 text-[13px] text-ev-muted">
                        {isUsed ? "Éligible" : isRefunded ? "—" : "Après scan"}
                      </td>
                      <td className="px-5 py-3.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label="Actions : renvoyer le billet, rembourser"
                              className="flex size-8 items-center justify-center rounded-[8px] border-0 bg-transparent text-ev-ink2 hover:bg-ev-line"
                            >
                              <MoreHorizontal className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className={`${EV_PORTAL} w-56 rounded-xl`}
                          >
                            {t.qrCode && !isRefunded && (
                              <DropdownMenuItem onClick={() => void downloadTickets([t.qrCode!]).catch(() => toast.error("Téléchargement impossible, réessayez."))}>
                                Télécharger le billet (PDF)
                              </DropdownMenuItem>
                            )}
                            {t.status === "VALID" && (
                              <DropdownMenuItem onClick={() => void handleManualCheckIn(t)}>
                                Valider l&apos;entrée maintenant
                              </DropdownMenuItem>
                            )}
                            {t.orderId && !isRefunded && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-ev-danger focus:text-ev-danger"
                                  onClick={() => void handleRefund(t)}
                                >
                                  Rembourser la commande
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-ev-muted">
                    Aucun participant ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pied de tableau */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ev-line px-5 py-3.5 text-[13px] text-ev-muted">
          <span>
            {filtered.length} participant{filtered.length > 1 ? "s" : ""} · {uniqueBuyers}{" "}
            acheteur{uniqueBuyers > 1 ? "s" : ""}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-[8px] border border-ev-border bg-ev-surface px-3 text-[13px] text-ev-ink hover:bg-ev-soft disabled:cursor-not-allowed disabled:text-[#A8A497]"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 rounded-[8px] border border-ev-border bg-ev-surface px-3 text-[13px] text-ev-ink hover:bg-ev-soft disabled:cursor-not-allowed disabled:text-[#A8A497]"
            >
              Suivant
            </button>
          </div>
        </div>
      </EvCard>

      {/* Modale Ajouter / inviter un participant */}
      <InviteParticipantDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        event={event}
      />
    </main>
  );
}

function InviteParticipantDialog({
  open,
  onOpenChange,
  event,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  event: ApiEvent;
}) {
  const [ticketTypeId, setTicketTypeId] = useState(event.ticketTypes[0]?.id ?? "");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedFormula =
    event.ticketTypes.find((t) => t.id === ticketTypeId) ?? event.ticketTypes[0];
  const isPublished = event.status === "PUBLISHED" || event.status === "ONGOING";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFormula) {
      toast.error("Ajoutez d'abord une formule de pass à l'événement.");
      return;
    }
    const phone = normalizePhone(customerPhone.trim());
    if (!phone) {
      toast.error("Le numéro de téléphone est obligatoire.");
      return;
    }
    setSubmitting(true);
    try {
      const idempotencyKey = `inv-${event.id}-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;
      const { data } = await api.post(
        `/admin/events/${event.id}/invitations`,
        {
          ticketTypeId: selectedFormula.id,
          quantity: 1,
          customerPhone: phone,
          ...(customerName.trim() ? { customerName: customerName.trim() } : {}),
          ...(customerEmail.trim() ? { customerEmail: customerEmail.trim() } : {}),
        },
        { headers: { "X-Idempotency-Key": idempotencyKey } }
      );
      if (selectedFormula.price === 0) {
        toast.success("Invitation émise : le billet a été envoyé par e-mail.");
      } else {
        const orderNumber = data?.data?.orderNumber ?? "";
        toast.success(
          `Place réservée (${orderNumber}). Pour une invitation gratuite, créez une formule à 0 F.`
        );
      }
      onOpenChange(false);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
    } catch (err) {
      toast.error(
        apiErrorMessage(
          err,
          isPublished
            ? "Impossible d'émettre ce billet."
            : "Publiez d'abord l'événement pour pouvoir émettre des billets."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${EV_PORTAL} sm:max-w-[460px]`}>
        <DialogHeader>
          <DialogTitle>Ajouter ou inviter un participant</DialogTitle>
          <DialogDescription>
            Réservez un pass au nom d&apos;un participant. Avec une formule à 0 FCFA, le billet PDF
            est émis et envoyé immédiatement par e-mail.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <EvLabel required>Formule</EvLabel>
            <EvSelect
              h={42}
              value={selectedFormula?.id ?? ""}
              onChange={(e) => setTicketTypeId(e.target.value)}
            >
              {event.ticketTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.price === 0 ? "Gratuit" : `${amount(t.price)} F`})
                </option>
              ))}
            </EvSelect>
          </label>
          <label className="flex flex-col gap-1.5">
            <EvLabel>Nom complet</EvLabel>
            <EvInput
              h={42}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ex. : Marc Ondimba"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <EvLabel required>Téléphone</EvLabel>
              <EvInput
                h={42}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+241 07 00 00 00"
                required
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <EvLabel>E-mail (pour l&apos;envoi PDF)</EvLabel>
              <EvInput
                h={42}
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="nom@domaine.com"
              />
            </label>
          </div>
          {!isPublished && (
            <p className="m-0 rounded-[10px] bg-ev-warn-bg px-3 py-2 text-xs text-ev-gold-text">
              Cet événement est encore en brouillon : publiez-le d&apos;abord pour pouvoir émettre
              des billets.
            </p>
          )}
          <DialogFooter className="mt-2 gap-2">
            <EvButton onClick={() => onOpenChange(false)}>Annuler</EvButton>
            <EvButton type="submit" variant="primary" disabled={submitting || !isPublished}>
              {submitting ? "Émission…" : "Émettre le pass"}
            </EvButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

