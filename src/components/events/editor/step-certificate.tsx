"use client";

import { useState } from "react";
import { Award, CheckCircle2, PenLine } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EV_PORTAL, EvButton, EvCheckbox, EvHr, EvInput, EvLabel } from "@/components/events/ev-ui";
import { CERTIFICATE_MODELS, ScaledCertificate, certificateDataFor } from "@/components/events/certificates";
import { amount, formatEventDay, typeOption } from "@/lib/event-meta";
import { cn } from "@/lib/utils";
import type { CertificateRecipientsMode, CertificateSendMode, CertificateSignatory } from "@/types/events";
import { capacityOf, potentialOf, type EditorForm } from "./editor-model";
import { BigSwitch } from "./step-questionnaire";

type Props = {
  form: EditorForm;
  set: (patch: Partial<EditorForm>) => void;
  soldCount: number;
  goTo: (step: 1 | 2 | 3 | 4) => void;
};

export type RecapRow = { label: string; value: string; ok: boolean; action: string; step?: 1 | 2 | 3 | 4; onAction?: () => void };

export function recapOf(form: EditorForm, set: (p: Partial<EditorForm>) => void): RecapRow[] {
  const required = form.questions.filter((q) => q.isRequired).length;
  const rows: RecapRow[] = [
    {
      label: "Informations",
      value: form.title.trim() && form.venueName.trim()
        ? [typeOption(form.eventType).label.split(" & ")[0], form.startDay ? `${formatEventDay(`${form.startDay}T${form.startTime || "00:00"}`).toLowerCase()}, ${form.startTime}` : null, form.city || form.venueName].filter(Boolean).join(" · ")
        : "Titre ou lieu manquant",
      ok: !!form.title.trim() && !!form.venueName.trim() && !!form.startDay,
      action: "Modifier",
      step: 1,
    },
    {
      label: "Billets & pass",
      value: form.formulas.length ? `${form.formulas.length} formule${form.formulas.length > 1 ? "s" : ""} · ${capacityOf(form)} places · ${amount(potentialOf(form))} F potentiels` : "Aucune formule",
      ok: form.formulas.length > 0,
      action: form.formulas.length ? "Modifier" : "Compléter",
      step: 2,
    },
    {
      label: "Questionnaire",
      value: form.questionnaireEnabled ? `${form.questions.length} question${form.questions.length > 1 ? "s" : ""} · ${required} obligatoire${required > 1 ? "s" : ""}` : "Désactivé",
      ok: !form.questionnaireEnabled || (form.questions.length > 0 && form.questions.every((q) => q.title.trim())),
      action: "Modifier",
      step: 3,
    },
    {
      label: "Certificat",
      value: form.hasCertificate ? `Modèle ${CERTIFICATE_MODELS.find((m) => m.id === form.certificateModel)?.letter} · ${CERTIFICATE_MODELS.find((m) => m.id === form.certificateModel)?.label}` : "Pas de certificat",
      ok: true,
      action: "Modifier",
      step: 4,
    },
    {
      label: "Visibilité",
      value: form.status === "PUBLISHED" || form.status === "ONGOING" ? "Publique · référencée sur la vitrine" : "Brouillon · non visible sur la vitrine",
      ok: true,
      action: form.status === "PUBLISHED" || form.status === "ONGOING" ? "Repasser en brouillon" : "Publier",
      onAction: () => set({ status: form.status === "PUBLISHED" || form.status === "ONGOING" ? "DRAFT" : "PUBLISHED" }),
    },
  ];
  return rows;
}

const RECIPIENT_OPTIONS: { id: CertificateRecipientsMode; title: string; sub: string }[] = [
  { id: "PRESENT_ONLY", title: "Présents uniquement", sub: "Billet scanné à l'entrée" },
  { id: "ALL_REGISTERED", title: "Tous les inscrits", sub: "Sans contrôle de présence" },
  { id: "MANUAL", title: "Sur validation", sub: "Vous choisissez qui" },
];

export function StepCertificate({ form, set, soldCount, goTo }: Props) {
  const [editingSigIndex, setEditingSigIndex] = useState<0 | 1 | null>(null);

  const sample = certificateDataFor(
    {
      title: form.title || "Votre événement",
      startDate: `${form.startDay || new Date().toISOString().slice(0, 10)}T${form.startTime || "09:00"}`,
      venueName: form.venueName,
      location: form.city,
      eventType: form.eventType,
    },
    {
      org: form.certificateIssuer || "Votre organisation",
      participant: "Marc Ondimba",
      signatories: form.certificateSignatories,
    }
  );
  const recap = recapOf(form, set);

  return (
    <div className="flex flex-col gap-[26px]">
      <section className="flex items-center justify-between gap-4 rounded-[12px] border border-ev-border bg-ev-soft px-[18px] py-4">
        <div className="flex items-center gap-3.5">
          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-ev-warn-bg text-ev-gold-text">
            <Award className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="m-0 text-[15px] font-semibold">Délivrer un certificat de participation</h2>
            <span className="text-[13px] text-ev-muted">Nominatif, signé et vérifiable par QR code.</span>
          </div>
        </div>
        <BigSwitch checked={form.hasCertificate} onChange={(v) => set({ hasCertificate: v })} label="Délivrer un certificat" />
      </section>

      <div className={cn("flex flex-col gap-[26px]", !form.hasCertificate && "pointer-events-none opacity-50")} aria-disabled={!form.hasCertificate}>
        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-base font-semibold">Modèle</h2>
          <div role="radiogroup" aria-label="Modèle de certificat" className="grid gap-3 sm:grid-cols-3">
            {CERTIFICATE_MODELS.map((m) => {
              const sel = form.certificateModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  onClick={() => set({ certificateModel: m.id })}
                  className={cn("flex flex-col gap-2.5 rounded-[12px] p-2 text-left", sel ? "border-2 border-ev-primary bg-ev-selected" : "border border-ev-border bg-ev-surface hover:bg-ev-soft")}
                >
                  <ScaledCertificate model={m.id} d={sample} className="rounded-[6px] shadow-[0_0_0_1px_var(--ev-border)]" />
                  <span className="flex items-center justify-between px-1 pb-1">
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-semibold">
                        {m.letter} · {m.label}
                      </span>
                      <span className="text-xs text-ev-muted">{m.hint}</span>
                    </span>
                    {sel && <CheckCircle2 className="size-[18px] fill-ev-primary text-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3.5">
          <h2 className="m-0 flex items-center gap-2 text-base font-semibold">Contenu</h2>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[13px] font-medium">
              Intitulé
              <EvInput
                h={42}
                value={form.certificateTitle}
                onChange={(e) => set({ certificateTitle: e.target.value })}
                placeholder="Ex. : Attestation de participation et de réussite"
                className="font-normal"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-medium">
              Organisme émetteur
              <EvInput
                h={42}
                value={form.certificateIssuer}
                onChange={(e) => set({ certificateIssuer: e.target.value })}
                placeholder="Ex. : Gabon Tech Hub"
                className="font-normal"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {([0, 1] as const).map((idx) => {
              const sig = form.certificateSignatories[idx] || { name: "", role: "" };
              const isFirst = idx === 0;
              const hasName = Boolean(sig.name?.trim());
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 rounded-[12px] p-3 transition-colors",
                    isFirst && !hasName
                      ? "border-[1.5px] border-dashed border-[#E9C98C] bg-[#FFFBF3] dark:border-[#5c4a22] dark:bg-ev-warn-bg"
                      : "border border-ev-border bg-ev-surface"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-[8px]",
                      isFirst && !hasName
                        ? "bg-ev-warn-bg text-ev-gold-text dark:bg-ev-soft"
                        : "bg-ev-bg text-ev-muted"
                    )}
                  >
                    <PenLine className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[13px] font-semibold">
                      Signataire {idx + 1} {isFirst ? "· requis" : "· facultatif"}
                    </span>
                    <span className="truncate text-xs text-ev-muted">
                      {hasName ? `${sig.name} · ${sig.role}` : isFirst ? "Nom, fonction et signature" : "Facultatif"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingSigIndex(idx)}
                    className={cn(
                      "h-8 shrink-0 rounded-[8px] px-3 text-xs font-semibold",
                      isFirst && !hasName
                        ? "bg-ev-primary text-white hover:bg-ev-primary-hover"
                        : "border border-ev-border bg-ev-surface text-ev-ink hover:bg-ev-soft"
                    )}
                  >
                    {hasName ? "Modifier" : "Ajouter"}
                  </button>
                </div>
              );
            })}
          </div>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-2.5 p-0 text-[13px] font-medium">Qui reçoit le certificat ?</legend>
            <div role="radiogroup" className="grid gap-2.5 sm:grid-cols-3">
              {RECIPIENT_OPTIONS.map((opt) => {
                const checked = form.certificateRecipients === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => set({ certificateRecipients: opt.id })}
                    className={cn(
                      "relative flex cursor-pointer gap-2.5 rounded-[12px] px-3.5 py-3 transition-colors",
                      checked ? "border-[1.5px] border-ev-primary bg-ev-selected" : "border border-ev-border hover:bg-ev-soft"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-px size-[18px] shrink-0 rounded-full bg-ev-surface transition-all",
                        checked ? "border-[5px] border-ev-primary" : "border-[1.5px] border-ev-dash"
                      )}
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-semibold">{opt.title}</span>
                      <span className="text-xs text-ev-muted">{opt.sub}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className="flex flex-col justify-between gap-2 text-[13px] font-medium sm:flex-row sm:items-center sm:gap-3">
            Envoi
            <select
              value={form.certificateSendMode}
              onChange={(e) => set({ certificateSendMode: e.target.value as CertificateSendMode })}
              className="h-[42px] w-full rounded-[10px] border border-ev-border bg-ev-surface px-3 font-normal sm:w-[420px]"
            >
              <option value="AUTO_NEXT_DAY">Automatique, le lendemain de l&apos;événement à 10:00</option>
              <option value="MANUAL">Manuel, depuis l&apos;onglet Certifications</option>
            </select>
          </label>
        </section>
      </div>

      <EvHr />

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-base font-semibold">Vérification avant enregistrement</h2>
        <ul className="m-0 list-none overflow-hidden rounded-[12px] border border-ev-border p-0">
          {recap.map((r) => (
            <li key={r.label} className={cn("flex flex-wrap items-center gap-x-3.5 gap-y-1.5 border-b border-ev-line px-4 py-3.5 last:border-b-0 sm:flex-nowrap", !r.ok && "bg-ev-warn-bg/60")}>
              <span className={cn("flex size-[22px] shrink-0 items-center justify-center rounded-full text-xs font-bold", r.ok ? "bg-ev-mint text-ev-primary dark:text-ev-link" : "bg-ev-warn-bg text-ev-gold-text")}>{r.ok ? "✓" : "!"}</span>
              <span className="flex-1 text-[13px] font-semibold sm:w-[150px] sm:flex-none">{r.label}</span>
              <button type="button" onClick={() => (r.onAction ? r.onAction() : r.step && goTo(r.step))} className="text-[13px] font-semibold text-ev-link hover:underline sm:order-last">
                {r.action}
              </button>
              <span className={cn("w-full pl-9 text-[13px] sm:w-auto sm:min-w-0 sm:flex-1 sm:pl-0", r.ok ? "text-ev-ink2" : "text-ev-gold-text")}>{r.value}</span>
            </li>
          ))}
        </ul>
        {soldCount > 0 && (
          <div className="rounded-[12px] bg-ev-soft px-4 py-3.5">
            <EvCheckbox
              checked={form.notifyParticipants}
              onChange={(v) => set({ notifyParticipants: v })}
              size={20}
              className="items-start"
              label={
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-[13px] font-semibold">
                    Prévenir les {soldCount} participants des changements importants
                  </span>
                  <span className="text-xs text-ev-muted">Un message est envoyé seulement si la date, l&apos;heure ou le lieu a changé.</span>
                </span>
              }
            />
          </div>
        )}
      </section>

      {/* Modal d'édition d'un signataire */}
      {editingSigIndex !== null && (
        <SignatoryModal
          index={editingSigIndex}
          signatory={form.certificateSignatories[editingSigIndex]}
          onClose={() => setEditingSigIndex(null)}
          onSave={(idx, updated) => {
            const nextSigs: [CertificateSignatory, CertificateSignatory] = [
              { ...form.certificateSignatories[0] },
              { ...form.certificateSignatories[1] },
            ];
            nextSigs[idx] = updated;
            set({ certificateSignatories: nextSigs });
            setEditingSigIndex(null);
          }}
        />
      )}
    </div>
  );
}

function SignatoryModal({
  index,
  signatory,
  onClose,
  onSave,
}: {
  index: 0 | 1;
  signatory: CertificateSignatory | null;
  onClose: () => void;
  onSave: (index: 0 | 1, s: CertificateSignatory) => void;
}) {
  const [name, setName] = useState(signatory?.name ?? "");
  const [role, setRole] = useState(signatory?.role ?? (index === 0 ? "Organisateur" : "Intervenant principal"));

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={`${EV_PORTAL} sm:max-w-[420px]`}>
        <DialogHeader>
          <DialogTitle>Signataire {index + 1} {index === 0 ? "(Requis)" : "(Facultatif)"}</DialogTitle>
          <DialogDescription>
            Ces informations apparaîtront au bas du certificat et sur l&apos;aperçu.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3.5 py-1">
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
            <EvLabel>Fonction ou titre</EvLabel>
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
            onClick={() => {
              onSave(index, {
                name: name.trim(),
                role: role.trim() || (index === 0 ? "Organisateur" : "Intervenant principal"),
              });
            }}
          >
            Appliquer
          </EvButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
