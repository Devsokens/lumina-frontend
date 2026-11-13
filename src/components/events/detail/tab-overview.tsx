"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle2, Circle, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EV_PORTAL, EvButton, EvCard, EvProgress } from "@/components/events/ev-ui";
import { EventRevenueCard } from "@/components/events/revenue/event-revenue-card";
import { amount, daysUntilLabel, formulaColor, pct, questionSummary } from "@/lib/event-meta";
import { publicSiteLabel, publicSiteUrl } from "@/lib/tenant-url";
import type { Tenant } from "@/types/api";
import type { ApiEvent, EventStats } from "@/types/events";

type TabId = "apercu" | "participants" | "certifications" | "statistiques";

type Props = {
  event: ApiEvent;
  stats?: EventStats;
  tenant?: Tenant;
  onEdit: (step?: 1 | 2 | 3 | 4) => void;
  onTab: (tab: TabId) => void;
};

export function TabOverview({ event, stats, tenant, onEdit, onTab }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const qrCanvasWrapRef = useRef<HTMLDivElement>(null);

  const statsByType = new Map(stats?.ticketTypes.map((t) => [t.ticketTypeId, t]));
  const totalSold =
    stats?.issued ?? event.ticketTypes.reduce((sum, t) => sum + (statsByType.get(t.id)?.issued ?? t.sold), 0);
  const totalCapacity =
    event.capacity ?? event.ticketTypes.reduce((sum, t) => sum + (t.quantity || 0), 0);
  const fillPct = pct(totalSold, totalCapacity);

  const totalRevenue =
    stats?.revenue ??
    event.ticketTypes.reduce((sum, t) => {
      const issued = statsByType.get(t.id)?.issued ?? t.sold;
      return sum + issued * t.price;
    }, 0);
  const potentialRevenue = event.ticketTypes.reduce((sum, t) => sum + t.price * (t.quantity || 0), 0);
  const activeFormulas = event.ticketTypes.length;
  const countdown = daysUntilLabel(event.startDate);

  const settings = event.settings ?? {};
  const questions = settings.questionnaire ?? [];
  const questionnaireActive = (settings.questionnaireEnabled ?? false) && questions.length > 0;

  const publicUrl = tenant ? publicSiteUrl(tenant.slug, `/events/${event.id}`) : "";
  const displayUrl = tenant
    ? `${publicSiteLabel(tenant.slug)}/events/${event.id.slice(0, 8)}`
    : `[votre-domaine]/e/${event.id.slice(0, 8)}`;

  const description = (event.description ?? "").trim();
  const isLongDescription = description.length > 320;
  const shownDescription =
    !expanded && isLongDescription ? `${description.slice(0, 320).trimEnd()}…` : description;

  // Checklist de préparation (5 points du design)
  const hasPosterAndDesc = Boolean(event.imageUrl && description.length >= 10);
  const hasFormulas = activeFormulas > 0;
  const hasQuiz = questionnaireActive;
  const hasCertModel = Boolean(settings.hasCertificate && settings.certificateTemplate);
  const hasSignatories = false; // Signataires bientôt persistés côté serveur
  const prepItems = [
    {
      label: "Affiche et description publiées",
      done: hasPosterAndDesc,
      actionLabel: "Compléter",
      onAction: () => onEdit(1),
    },
    {
      label:
        activeFormulas > 0
          ? `${activeFormulas} formule${activeFormulas > 1 ? "s" : ""} de pass en vente`
          : "Formules de pass en vente",
      done: hasFormulas,
      actionLabel: "Ajouter",
      onAction: () => onEdit(2),
    },
    {
      label: "Questionnaire configuré",
      done: hasQuiz,
      actionLabel: "Configurer",
      onAction: () => onEdit(3),
    },
    {
      label: "Modèle de certificat choisi",
      done: hasCertModel,
      actionLabel: "Choisir",
      onAction: () => onEdit(4),
    },
    {
      label: "Signataires du certificat",
      done: hasSignatories,
      actionLabel: "Ajouter",
      onAction: () => onTab("certifications"),
    },
  ];
  const doneCount = prepItems.filter((i) => i.done).length;

  async function copyLink() {
    const target = publicUrl || window.location.href;
    try {
      await navigator.clipboard.writeText(target);
      toast.success("Lien de la vitrine copié.");
    } catch {
      toast.error("Impossible de copier le lien.");
    }
  }

  function shareWhatsApp() {
    const target = publicUrl || window.location.href;
    const text = `${event.title} — Réservez votre pass : ${target}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  function downloadQrPng() {
    const canvas = qrCanvasWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${event.id.slice(0, 8)}.png`;
    a.click();
    toast.success("QR code téléchargé.");
  }

  return (
    <main className="flex flex-wrap items-start gap-6">
      {/* Colonne principale */}
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
        {/* Affiche */}
        <div className="h-[200px] overflow-hidden rounded-[16px] border border-ev-border bg-[#0B1B1C] sm:h-[300px]">
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imageUrl}
              alt={`Affiche : ${event.title}`}
              className="block size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-3 px-6 text-center text-white/80">
              <span className="text-sm font-medium">Aucune affiche importée pour cet événement</span>
              <button
                type="button"
                onClick={() => onEdit(1)}
                className="h-9 rounded-[10px] bg-white/15 px-3.5 text-xs font-semibold text-white hover:bg-white/25"
              >
                Ajouter une affiche
              </button>
            </div>
          )}
        </div>

        {/* À propos */}
        <EvCard className="flex flex-col gap-3.5 p-4 sm:p-6">
          <h2 className="m-0 text-base font-semibold">À propos</h2>
          {description ? (
            <>
              <p className="m-0 whitespace-pre-line text-sm leading-[1.7] text-ev-ink2">
                {shownDescription}
              </p>
              {isLongDescription && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="self-start border-0 bg-transparent p-0 text-[13px] font-semibold text-ev-link hover:underline"
                >
                  {expanded ? "Réduire" : "Lire la suite"}
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <p className="m-0 text-sm text-ev-muted">Aucune description renseignée.</p>
              <button
                type="button"
                onClick={() => onEdit(1)}
                className="border-0 bg-transparent p-0 text-[13px] font-semibold text-ev-link hover:underline"
              >
                Ajouter une description
              </button>
            </div>
          )}
        </EvCard>

        {/* Formules de pass */}
        <EvCard className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <h2 className="m-0 text-base font-semibold">Formules de pass</h2>
            <button
              type="button"
              onClick={() => onEdit(2)}
              className="border-0 bg-transparent p-0 text-[13px] font-semibold text-ev-link hover:underline"
            >
              Gérer les formules
            </button>
          </div>

          {event.ticketTypes.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {event.ticketTypes.map((t, index) => {
                const sold = statsByType.get(t.id)?.issued ?? t.sold;
                const quota = t.quantity || 0;
                const ratio = quota > 0 ? Math.max(sold > 0 ? 2 : 0, pct(sold, quota)) : 0;
                const color = formulaColor(index);
                return (
                  <div
                    key={t.id}
                    className="flex flex-col gap-2.5 rounded-[12px] border border-ev-border p-4"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold">{t.name}</span>
                      <span className="text-[15px] font-semibold">
                        {t.price === 0 ? "Gratuit" : `${amount(t.price)} F`}
                      </span>
                    </div>
                    <EvProgress value={ratio} color={color} height={6} />
                    <span className="text-xs text-ev-muted">
                      {sold} {sold > 1 ? "vendus" : "vendu"} ·{" "}
                      {quota > 0 ? `${quota} places` : "quota [à définir]"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="m-0 text-sm text-ev-muted">
              Aucune formule de pass configurée pour le moment.
            </p>
          )}
        </EvCard>

        {/* Questionnaire d'inscription */}
        <EvCard className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="m-0 text-base font-semibold">Questionnaire d&apos;inscription</h2>
              <span className="text-[13px] text-ev-muted">
                {questions.length > 0
                  ? `${questions.length} question${questions.length > 1 ? "s" : ""} · rempli à l'achat du pass`
                  : "Aucune question configurée · facultatif"}
              </span>
            </div>
            <EvButton size="sm" onClick={() => onEdit(3)}>
              Modifier
            </EvButton>
          </div>

          {questions.length > 0 && (
            <ol className="m-0 flex list-none flex-col overflow-hidden rounded-[12px] border border-ev-line p-0">
              {questions.map((q, idx) => (
                <li
                  key={q.id}
                  className="flex flex-wrap items-center gap-x-3.5 gap-y-1 border-b border-ev-line px-3.5 py-3 last:border-b-0 sm:flex-nowrap sm:px-4 sm:py-3.5"
                >
                  <span className="w-6 shrink-0 font-ev-mono text-xs text-ev-muted">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-[180px] flex-1 text-sm">{q.title}</span>
                  <div className="flex w-full items-center justify-between gap-2 pl-9 sm:w-auto sm:justify-end sm:pl-0">
                    <span className="text-xs text-ev-muted">{questionSummary(q)}</span>
                    <span
                      className={`text-right text-xs font-medium sm:w-[84px] ${
                        q.isRequired ? "text-ev-ink2" : "text-ev-muted"
                      }`}
                    >
                      {q.isRequired ? "Obligatoire" : "Facultatif"}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </EvCard>
      </div>

      {/* Colonne latérale droite */}
      <aside className="flex w-full flex-[1_1_360px] flex-col gap-4 lg:max-w-[420px]">
        {/* Ventes */}
        <EvCard className="flex flex-col gap-[18px] p-4 sm:p-[22px]">
          <h2 className="m-0 text-[15px] font-semibold">Ventes</h2>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[30px] font-semibold tracking-[-0.02em]">
                {totalSold}{" "}
                <span className="text-[15px] font-medium text-ev-muted">
                  / {totalCapacity || "—"} places
                </span>
              </span>
              <span className="text-[13px] font-semibold text-ev-ok">{fillPct} %</span>
            </div>
            <EvProgress value={fillPct} height={8} />
          </div>
          <dl className="m-0 grid grid-cols-2 gap-3">
            <div className="rounded-[10px] bg-ev-bg p-3">
              <dt className="text-xs text-ev-muted">Recettes</dt>
              <dd className="m-0 mt-1 text-base font-semibold">{amount(totalRevenue)} F</dd>
            </div>
            <div className="rounded-[10px] bg-ev-bg p-3">
              <dt className="text-xs text-ev-muted">Potentiel</dt>
              <dd className="m-0 mt-1 text-base font-semibold">{amount(potentialRevenue)} F</dd>
            </div>
            <div className="rounded-[10px] bg-ev-bg p-3">
              <dt className="text-xs text-ev-muted">Formules</dt>
              <dd className="m-0 mt-1 text-base font-semibold">
                {activeFormulas} {activeFormulas > 1 ? "actives" : "active"}
              </dd>
            </div>
            <div className="rounded-[10px] bg-ev-bg p-3">
              <dt className="text-xs text-ev-muted">Fin des ventes</dt>
              <dd className="m-0 mt-1 text-base font-semibold">{countdown}</dd>
            </div>
          </dl>
        </EvCard>

        {/* Revenus de l'événement (propriétaire) */}
        <EventRevenueCard eventId={event.id} />

        {/* Partager la vitrine */}
        <EvCard className="flex flex-col gap-3.5 p-4 sm:p-[22px]">
          <h2 className="m-0 text-[15px] font-semibold">Partager la vitrine</h2>
          <div className="flex h-[42px] items-center gap-2 rounded-[10px] border border-ev-border bg-ev-bg pl-3 pr-1.5">
            <span className="min-w-0 flex-1 truncate font-ev-mono text-xs text-ev-ink2">
              {displayUrl}
            </span>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="h-[30px] shrink-0 rounded-[8px] border border-ev-border bg-ev-surface px-2.5 text-xs font-semibold text-ev-ink hover:bg-ev-soft"
            >
              Copier
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={shareWhatsApp}
              className="h-10 rounded-[10px] border border-ev-border bg-ev-surface text-[13px] font-medium text-ev-ink hover:bg-ev-soft"
            >
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="h-10 rounded-[10px] border border-ev-border bg-ev-surface text-[13px] font-medium text-ev-ink hover:bg-ev-soft"
            >
              QR code affiche
            </button>
          </div>
        </EvCard>

        {/* Préparation */}
        <EvCard className="flex flex-col gap-3.5 p-4 sm:p-[22px]">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-[15px] font-semibold">Préparation</h2>
            <span className="text-xs text-ev-muted">
              {doneCount} / {prepItems.length}
            </span>
          </div>
          <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[13px]">
            {prepItems.map((item) => (
              <li
                key={item.label}
                className={`flex items-center gap-2.5 ${item.done ? "text-ev-ink" : "text-ev-ink2"}`}
              >
                {item.done ? (
                  <CheckCircle2 className="size-[18px] shrink-0 text-ev-bar" />
                ) : (
                  <Circle className="size-[18px] shrink-0 text-ev-dash" />
                )}
                <span className="min-w-0 flex-1">{item.label}</span>
                {!item.done && (
                  <button
                    type="button"
                    onClick={item.onAction}
                    className="border-0 bg-transparent p-0 text-[13px] font-semibold text-ev-link hover:underline"
                  >
                    {item.actionLabel}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </EvCard>
      </aside>

      {/* Modale QR code affiche */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className={`${EV_PORTAL} sm:max-w-[400px]`}>
          <DialogHeader>
            <DialogTitle>QR code de la vitrine</DialogTitle>
            <DialogDescription>
              Imprimez ou intégrez ce QR code sur votre affiche pour diriger vers la billetterie de{" "}
              <b className="text-ev-ink">{event.title}</b>.
            </DialogDescription>
          </DialogHeader>
          <div
            ref={qrCanvasWrapRef}
            className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-ev-border bg-white p-6"
          >
            <QRCodeCanvas
              value={publicUrl || (typeof window !== "undefined" ? window.location.href : event.id)}
              size={220}
              bgColor="#FFFFFF"
              fgColor="#16211C"
              level="M"
              includeMargin
            />
            <span className="font-ev-mono text-xs text-[#3F4A45]">{displayUrl}</span>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <EvButton onClick={() => setQrOpen(false)}>Fermer</EvButton>
            <EvButton variant="primary" onClick={downloadQrPng}>
              <Download />
              Télécharger en PNG
            </EvButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

