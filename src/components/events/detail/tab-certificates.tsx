"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, CheckCircle2, Download, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Certificate,
  CERTIFICATE_MODELS,
  certificateDataFor,
  certificateModelOf,
  ScaledCertificate,
  type CertificateModel,
  type Signatory,
} from "@/components/events/certificates";
import { AwardIcon } from "@/components/events/ev-icons";
import {
  EV_PORTAL,
  EvButton,
  EvCard,
  EvInput,
  EvLabel,
  EvStepBadge,
  EvTextarea,
} from "@/components/events/ev-ui";
import {
  useEventCertificates,
  usePatchEventSettings,
  useSendCertificatesBatch,
  useSendTestCertificate,
} from "@/hooks/useEvents";
import { apiErrorMessage } from "@/lib/events";
import { formatLongDate } from "@/lib/event-meta";
import { cn } from "@/lib/utils";
import type { ApiEvent, ApiTicket } from "@/types/events";

type Props = {
  event: ApiEvent;
  tickets: ApiTicket[];
  orgName: string;
  onEdit: (step?: 1 | 2 | 3 | 4) => void;
};

type ChannelKey = "email" | "whatsapp" | "portal";

const KIND_FOR_MENTION: Record<string, string> = {
  CONFERENCE: "la conférence-formation",
  CONCERT: "le concert",
  NIGHTLIFE: "la soirée",
  EXHIBITION: "le salon",
  SPORTS: "la compétition",
  SHOW: "le spectacle",
  WEDDING: "la célébration",
};

export function TabCertificates({ event, tickets, orgName }: Props) {
  const patchSettings = usePatchEventSettings();
  const sendTest = useSendTestCertificate(event.id);
  const sendBatch = useSendCertificatesBatch(event.id);
  const { data: dispatches } = useEventCertificates(event.id);

  const s = event.settings ?? {};
  const initialModel = certificateModelOf(s.certificateTemplate);
  const [model, setModel] = useState<CertificateModel>(initialModel);

  const defaultDateLabel = s.certificateIssuedDate || formatLongDate(event.startDate);
  const kindLabel = KIND_FOR_MENTION[event.eventType ?? ""] ?? "la conférence-formation";
  const defaultMention = s.certificateMention || `a participé avec assiduité à ${kindLabel} « ${event.title} ».`;

  const [title, setTitle] = useState(s.certificateTitle || "Certificat de participation");
  const [issuedDate, setIssuedDate] = useState(defaultDateLabel);
  const [mention, setMention] = useState(defaultMention);
  const [signatories, setSignatories] = useState<[Signatory, Signatory]>(
    s.certificateSignatories ?? [
      { name: "", role: "Organisateur" },
      { name: "", role: "Intervenant principal" },
    ]
  );
  const [editingSigIndex, setEditingSigIndex] = useState<0 | 1 | null>(null);
  const [channels, setChannels] = useState<Record<ChannelKey, boolean>>(
    s.certificateChannels ?? {
      email: true,
      whatsapp: true,
      portal: false,
    }
  );
  const [fullScreenOpen, setFullScreenOpen] = useState(false);

  // Participants scannés à l'entrée = éligibles
  const eligibleTickets = tickets.filter((t) => t.status === "USED");
  const eligibleCount = eligibleTickets.length;
  const sentCount = dispatches?.length ?? 0;
  const planQuota = 50;

  const sampleParticipant = eligibleTickets[0]?.customerName?.trim() || "Marc Ondimba";

  const certData = certificateDataFor(event, {
    org: (s.certificateIssuer || orgName).toUpperCase(),
    participant: sampleParticipant,
    mention,
    signatories,
  });

  async function selectModel(next: CertificateModel) {
    setModel(next);
    try {
      await patchSettings.mutateAsync({
        id: event.id,
        settings: {
          ...event.settings,
          hasCertificate: true,
          certificateTemplate: next,
        },
      });
      toast.success(
        `Modèle ${CERTIFICATE_MODELS.find((m) => m.id === next)?.label ?? next} sélectionné.`
      );
    } catch (err) {
      toast.error(apiErrorMessage(err, "Impossible d'enregistrer le modèle."));
    }
  }

  function toggleChannel(key: ChannelKey) {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handlePrintCertificate() {
    setFullScreenOpen(true);
    setTimeout(() => {
      window.print();
    }, 250);
  }

  async function handleSendTest() {
    const selectedChannels = (["email", "whatsapp", "portal"] as const).filter((c) => channels[c]);
    if (selectedChannels.length === 0) {
      toast.error("Activez au moins un canal d'envoi.");
      return;
    }
    try {
      await sendTest.mutateAsync({
        model,
        title,
        issuer: s.certificateIssuer || orgName,
        issuedDate,
        mention,
        signatories,
        channels: selectedChannels,
      });
      toast.success("Aperçu de test envoyé avec succès.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Aperçu de test indisponible."));
    }
  }

  async function handleSendBatch() {
    if (eligibleCount === 0) {
      toast.info("Aucun participant scanné à l'entrée pour le moment.");
      return;
    }
    const selectedChannels = (["email", "whatsapp", "portal"] as const).filter((c) => channels[c]);
    if (selectedChannels.length === 0) {
      toast.error("Activez au moins un canal d'envoi.");
      return;
    }
    try {
      const res = await sendBatch.mutateAsync({
        model,
        title,
        issuer: s.certificateIssuer || orgName,
        issuedDate,
        mention,
        signatories,
        channels: selectedChannels,
        ticketIds: eligibleTickets.map((t) => t.id),
      });
      toast.success(`${res?.count ?? eligibleCount} attestation(s) envoyée(s) avec succès.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Impossible de lancer l'envoi groupé."));
    }
  }

  return (
    <main className="flex flex-col gap-5">
      {/* Bandeau récapitulatif */}
      <EvCard className="flex flex-wrap items-center justify-between gap-4 p-4 sm:gap-5 sm:px-6 sm:py-5">
        <div className="flex items-start gap-3 sm:items-center sm:gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-ev-warn-bg text-ev-gold-text sm:size-11">
            <AwardIcon size={22} />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="m-0 text-base font-semibold sm:text-[17px]">Attestations de participation</h2>
            <span className="text-[13px] text-ev-muted">
              Émises uniquement aux participants scannés à l&apos;entrée · nominatives, signées,
              vérifiables par QR code
            </span>
          </div>
        </div>
        <dl className="m-0 flex w-full justify-between gap-4 border-t border-ev-line pt-3 sm:w-auto sm:justify-start sm:gap-7 sm:border-t-0 sm:pt-0">
          <div>
            <dt className="text-xs text-ev-muted">Éligibles</dt>
            <dd className="m-0 mt-0.5 text-xl font-semibold">{eligibleCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-ev-muted">Envoyées</dt>
            <dd className="m-0 mt-0.5 text-xl font-semibold">{sentCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-ev-muted">Quota du plan</dt>
            <dd className="m-0 mt-0.5 text-xl font-semibold">
              {eligibleCount}{" "}
              <span className="text-[13px] font-medium text-ev-muted">/ {planQuota}</span>
            </dd>
          </div>
        </dl>
      </EvCard>

      {/* Deux colonnes : configuration à gauche, aperçu + suivi à droite */}
      <div className="flex flex-wrap items-start gap-6">
        {/* Colonne gauche */}
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
          {/* 1 · Modèle */}
          <EvCard className="flex flex-col gap-4 p-4 sm:px-6 sm:py-[22px]">
            <div className="flex items-center gap-3">
              <EvStepBadge n={1} />
              <h3 className="m-0 text-[15px] font-semibold">Modèle</h3>
            </div>

            <div
              role="radiogroup"
              aria-label="Modèle de certificat"
              className="grid gap-3 sm:grid-cols-3"
            >
              {/* A · Classique */}
              <button
                type="button"
                role="radio"
                aria-checked={model === "CLASSIC"}
                onClick={() => void selectModel("CLASSIC")}
                className={cn(
                  "flex cursor-pointer flex-col gap-2.5 rounded-[12px] bg-ev-surface p-2.5 text-left transition-colors",
                  model === "CLASSIC"
                    ? "border-2 border-ev-primary"
                    : "border border-ev-border hover:bg-ev-soft"
                )}
              >
                <span className="flex h-[110px] items-center justify-center rounded-[6px] border border-[#E9DFC7] bg-[#FBF8F1]">
                  <span
                    className="flex h-[80%] w-[82%] flex-col items-center justify-center gap-1.5 border-[1.5px] border-[#0C4A3A]"
                    style={{ outline: "1px solid #C79A3B", outlineOffset: "-5px" }}
                  >
                    <span className="h-1 w-1/2 bg-[#0C4A3A]" />
                    <span className="h-[7px] w-[64%] bg-[#16211C]" />
                    <span className="h-[3px] w-2/5 bg-[#C79A3B]" />
                  </span>
                </span>
                <span className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-ev-ink">A · Classique</span>
                  {model === "CLASSIC" && (
                    <CheckCircle2 className="size-[18px] fill-ev-primary text-white" />
                  )}
                </span>
              </button>

              {/* B · Moderne */}
              <button
                type="button"
                role="radio"
                aria-checked={model === "MODERN"}
                onClick={() => void selectModel("MODERN")}
                className={cn(
                  "flex cursor-pointer flex-col gap-2.5 rounded-[12px] bg-ev-surface p-2.5 text-left transition-colors",
                  model === "MODERN"
                    ? "border-2 border-ev-primary"
                    : "border border-ev-border hover:bg-ev-soft"
                )}
              >
                <span className="flex h-[110px] overflow-hidden rounded-[6px] border border-[#E7E5DE] bg-white">
                  <span className="w-[32%] bg-[#0C4A3A]" />
                  <span className="flex flex-1 flex-col justify-center gap-1.5 px-3">
                    <span className="h-[3px] w-2/5 bg-[#E39A1F]" />
                    <span className="h-2 w-4/5 bg-[#16211C]" />
                    <span className="h-[3px] w-3/5 bg-[#C9CEC9]" />
                  </span>
                </span>
                <span className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-ev-ink">B · Moderne</span>
                  {model === "MODERN" && (
                    <CheckCircle2 className="size-[18px] fill-ev-primary text-white" />
                  )}
                </span>
              </button>

              {/* C · Exécutif */}
              <button
                type="button"
                role="radio"
                aria-checked={model === "EXECUTIVE"}
                onClick={() => void selectModel("EXECUTIVE")}
                className={cn(
                  "flex cursor-pointer flex-col gap-2.5 rounded-[12px] bg-ev-surface p-2.5 text-left transition-colors",
                  model === "EXECUTIVE"
                    ? "border-2 border-ev-primary"
                    : "border border-ev-border hover:bg-ev-soft"
                )}
              >
                <span className="box-border flex h-[110px] flex-col justify-between rounded-[6px] border border-[#E7E5DE] bg-white p-3.5">
                  <span className="h-[3px] w-[30%] bg-[#0C4A3A]" />
                  <span className="h-2.5 w-3/4 bg-[#16211C]" />
                  <span className="flex gap-1.5">
                    <span className="h-[3px] flex-1 bg-[#C9CEC9]" />
                    <span className="h-[3px] flex-1 bg-[#C9CEC9]" />
                    <span className="h-[3px] flex-1 bg-[#C9CEC9]" />
                  </span>
                </span>
                <span className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-ev-ink">C · Exécutif</span>
                  {model === "EXECUTIVE" && (
                    <CheckCircle2 className="size-[18px] fill-ev-primary text-white" />
                  )}
                </span>
              </button>
            </div>
          </EvCard>

          {/* 2 · Contenu et signataires */}
          <EvCard className="flex flex-col gap-4 p-4 sm:px-6 sm:py-[22px]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <EvStepBadge n={2} />
                <h3 className="m-0 text-[15px] font-semibold">Contenu et signataires</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                Intitulé
                <EvInput
                  h={40}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="font-normal"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                Date de délivrance
                <EvInput
                  h={40}
                  value={issuedDate}
                  onChange={(e) => setIssuedDate(e.target.value)}
                  className="font-normal"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] font-medium sm:col-span-2">
                Mention
                <EvTextarea
                  rows={2}
                  value={mention}
                  onChange={(e) => setMention(e.target.value)}
                  className="py-2.5 font-normal"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {([0, 1] as const).map((idx) => {
                const sig = signatories[idx];
                const defaultRole = idx === 0 ? "Organisateur" : "Intervenant";
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-[12px] border border-ev-border p-3"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-ev-bg text-ev-muted">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M3 17c3-1 4-6 6-6s1 5 3 5 3-4 5-4 2 3 4 3" />
                      </svg>
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[13px] font-semibold">Signataire {idx + 1}</span>
                      <span className="truncate text-xs text-ev-muted">
                        {sig.name?.trim() ? sig.name : "[Nom]"} · {sig.role || defaultRole}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingSigIndex(idx)}
                      className="h-8 shrink-0 rounded-[8px] border border-ev-border bg-ev-surface px-2.5 text-xs font-semibold text-ev-ink hover:bg-ev-soft"
                    >
                      {sig.name?.trim() ? "Modifier" : "Ajouter"}
                    </button>
                  </div>
                );
              })}
            </div>
          </EvCard>

          {/* 3 · Envoi */}
          <EvCard className="flex flex-col gap-4 p-4 sm:px-6 sm:py-[22px]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <EvStepBadge n={3} />
                <h3 className="m-0 text-[15px] font-semibold">Envoi</h3>
              </div>
            </div>

            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-2.5 p-0 text-[13px] font-medium">Canaux d&apos;envoi</legend>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {(
                  [
                    {
                      key: "email" as const,
                      title: "E-mail",
                      sub: "PDF joint au message",
                    },
                    {
                      key: "whatsapp" as const,
                      title: "WhatsApp",
                      sub: "Lien de téléchargement",
                    },
                    {
                      key: "portal" as const,
                      title: "Espace participant",
                      sub: "Disponible au téléchargement",
                    },
                  ]
                ).map((c) => {
                  const checked = channels[c.key];
                  return (
                    <label
                      key={c.key}
                      className={cn(
                        "relative flex cursor-pointer items-start gap-3 rounded-[12px] p-3.5 transition-colors",
                        checked
                          ? "border-[1.5px] border-ev-primary bg-ev-selected"
                          : "border-[1.5px] border-ev-border bg-ev-surface hover:bg-ev-soft"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleChannel(c.key)}
                        className="absolute size-px opacity-0"
                      />
                      <span
                        aria-hidden
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-[6px]",
                          checked
                            ? "bg-ev-primary text-white"
                            : "border-[1.5px] border-ev-dash bg-ev-surface"
                        )}
                      >
                        {checked && <Check className="size-3.5 stroke-[2.6]" />}
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-semibold">{c.title}</span>
                        <span className="text-xs text-ev-muted">{c.sub}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ev-line pt-4">
              <span className="text-[13px] text-ev-muted">
                {eligibleCount} attestation{eligibleCount > 1 ? "s seront générées" : " sera générée"}
                . Un aperçu de test vous est envoyé d&apos;abord.
              </span>
              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={handleSendTest}
                  className="h-[42px] flex-1 rounded-[10px] border border-ev-border bg-ev-surface px-3.5 text-[13px] font-medium text-ev-ink hover:bg-ev-soft sm:flex-none"
                >
                  M&apos;envoyer un test
                </button>
                <button
                  type="button"
                  onClick={handleSendBatch}
                  className="inline-flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[10px] bg-ev-primary px-[18px] text-[13px] font-semibold text-white hover:bg-ev-primary-hover sm:flex-none"
                >
                  <Send className="size-4" />
                  Envoyer {eligibleCount} attestation{eligibleCount > 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </EvCard>
        </div>

        {/* Colonne droite : Aperçu + Suivi des envois */}
        <aside className="flex w-full flex-[1_1_400px] flex-col gap-4 lg:max-w-[600px]">
          <EvCard className="flex flex-col gap-3.5 p-5">
            <div className="flex items-center justify-between">
              <h3 className="m-0 text-[15px] font-semibold">Aperçu</h3>
              <span className="text-xs text-ev-muted">Exemple : {sampleParticipant}</span>
            </div>

            <div className="overflow-hidden rounded-[8px] border border-ev-border bg-[#FBF8F1]">
              <ScaledCertificate model={model} d={certData} />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFullScreenOpen(true)}
                className="h-[38px] flex-1 rounded-[10px] border border-ev-border bg-ev-surface text-[13px] font-medium text-ev-ink hover:bg-ev-soft"
              >
                Plein écran
              </button>
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="h-[38px] flex-1 rounded-[10px] border border-ev-border bg-ev-surface text-[13px] font-medium text-ev-ink hover:bg-ev-soft"
              >
                Télécharger le PDF
              </button>
            </div>
          </EvCard>

          <EvCard className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="m-0 text-[15px] font-semibold">Suivi des envois</h3>
              {sentCount > 0 && (
                <span className="text-xs font-semibold text-ev-primary dark:text-ev-mint">
                  {sentCount} envoyé{sentCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {dispatches && dispatches.length > 0 ? (
              <div className="flex max-h-[360px] flex-col divide-y divide-ev-line overflow-y-auto rounded-[10px] border border-ev-border">
                {dispatches.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-3 bg-ev-surface p-3 text-xs">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold text-ev-ink">{d.participantName}</span>
                        <span className="rounded bg-ev-soft px-1.5 py-0.5 text-[11px] text-ev-muted">{d.certificateCode}</span>
                      </div>
                      <span className="truncate text-ev-muted">
                        {[d.participantEmail, d.participantPhone].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          d.status === "VERIFIED"
                            ? "bg-ev-mint text-ev-primary dark:text-ev-link"
                            : d.status === "FAILED"
                            ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            : "bg-ev-soft text-ev-ink"
                        )}
                      >
                        {d.status === "VERIFIED" ? "Vérifié" : d.status === "OPENED" ? "Ouvert" : d.status === "FAILED" ? "Échoué" : "Envoyé"}
                      </span>
                      {d.pdfUrl && (
                        <a
                          href={d.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex size-7 items-center justify-center rounded-[6px] border border-ev-border text-ev-muted hover:bg-ev-soft hover:text-ev-ink"
                          title="Télécharger l'attestation"
                        >
                          <Download className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 rounded-[12px] border border-dashed border-[#DAD6CB] px-4 py-7 text-center dark:border-ev-dash">
                <span className="text-sm font-medium">Aucune attestation envoyée</span>
                <span className="max-w-[320px] text-[13px] leading-[1.5] text-ev-muted">
                  Chaque envoi apparaîtra ici avec son statut (envoyé, ouvert, vérifié) et son PDF.
                </span>
              </div>
            )}
          </EvCard>
        </aside>
      </div>

      {/* Modale d'édition d'un signataire */}
      <SignatoryDialog
        index={editingSigIndex}
        signatories={signatories}
        onClose={() => setEditingSigIndex(null)}
        onSave={(idx, updated) => {
          setSignatories((prev) => {
            const next: [Signatory, Signatory] = [{ ...prev[0] }, { ...prev[1] }];
            next[idx] = updated;
            return next;
          });
          setEditingSigIndex(null);
        }}
      />

      {/* Modale Plein écran / impression PDF du certificat */}
      <Dialog open={fullScreenOpen} onOpenChange={setFullScreenOpen}>
        <DialogContent className={`${EV_PORTAL} max-w-[95vw] sm:max-w-[980px]`}>
          <DialogHeader>
            <DialogTitle>
              Certificat — Modèle{" "}
              {CERTIFICATE_MODELS.find((m) => m.id === model)?.label ?? model}
            </DialogTitle>
            <DialogDescription>
              Aperçu au format A4 paysage (1123 × 794 px) pour {sampleParticipant}.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-[10px] border border-ev-border bg-[#FBF8F1]">
            <ScaledCertificate model={model} d={certData} />
          </div>
          {/* Version taille réelle dédiée à l'impression PDF */}
          <div className="hidden print:block">
            <Certificate model={model} d={certData} />
          </div>
          <DialogFooter className="gap-2">
            <EvButton onClick={() => setFullScreenOpen(false)}>Fermer</EvButton>
            <EvButton variant="primary" onClick={() => window.print()}>
              Imprimer / Enregistrer en PDF
            </EvButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function SignatoryDialog({
  index,
  signatories,
  onClose,
  onSave,
}: {
  index: 0 | 1 | null;
  signatories: [Signatory, Signatory];
  onClose: () => void;
  onSave: (idx: 0 | 1, s: Signatory) => void;
}) {
  const current = index !== null ? signatories[index] : { name: "", role: "" };
  const [name, setName] = useState(current.name ?? "");
  const [role, setRole] = useState(current.role);

  if (index === null) return null;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={`${EV_PORTAL} sm:max-w-[420px]`}>
        <DialogHeader>
          <DialogTitle>Signataire {index + 1}</DialogTitle>
          <DialogDescription>
            Ces informations apparaissent en bas du certificat et mettent à jour l&apos;aperçu.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <EvLabel>Nom et prénom</EvLabel>
            <EvInput
              h={42}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. : S.E. M. Moudjiegou Mboumba"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <EvLabel>Fonction / titre</EvLabel>
            <EvInput
              h={42}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder={index === 0 ? "Organisateur" : "Intervenant principal"}
            />
          </label>
        </div>
        <DialogFooter className="gap-2">
          <EvButton onClick={onClose}>Annuler</EvButton>
          <EvButton
            variant="primary"
            onClick={() =>
              onSave(index, {
                name: name.trim(),
                role: role.trim() || (index === 0 ? "Organisateur" : "Intervenant principal"),
              })
            }
          >
            Appliquer à l&apos;aperçu
          </EvButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

