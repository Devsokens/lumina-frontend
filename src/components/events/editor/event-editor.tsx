"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Eye, Loader2, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { EV_PORTAL, EvButton } from "@/components/events/ev-ui";
import { useAdminTenant, useSaveEvent } from "@/hooks/useEvents";
import { apiErrorMessage } from "@/lib/events";
import { publicSiteUrl } from "@/lib/tenant-url";
import { cn } from "@/lib/utils";
import type { ApiEvent } from "@/types/events";
import { formFromEvent, stepStates, toEventForm, type EditorForm } from "./editor-model";
import { StepInfos } from "./step-infos";
import { StepTickets } from "./step-tickets";
import { StepQuestionnaire } from "./step-questionnaire";
import { StepCertificate, recapOf } from "./step-certificate";
import { PosterStudio } from "./poster-studio";

// Éditeur d'événement en 4 étapes, panneau latéral de 920 px (refonte
// Claude Design 2026-11) : Informations, Billets & pass, Questionnaire,
// Certificat & publication. « Générer avec l'IA » ouvre le studio d'affiche.

type Step = 1 | 2 | 3 | 4;
const STEPS: { n: Step; label: string; next: string }[] = [
  { n: 1, label: "Informations", next: "Suivant : billets" },
  { n: 2, label: "Billets & pass", next: "Suivant : questionnaire" },
  { n: 3, label: "Questionnaire", next: "Suivant : certificat" },
  { n: 4, label: "Certificat & publication", next: "" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ApiEvent | null;
  initialStep?: Step;
  // Création : redirige vers le détail du nouvel événement.
  onCreated?: (id: string) => void;
};

export function EventEditor({ open, onOpenChange, event, initialStep = 1, onCreated }: Props) {
  const { data: tenant } = useAdminTenant();
  const save = useSaveEvent();
  const orgName = tenant?.name ?? "Votre organisation";
  const [form, setForm] = useState<EditorForm>(() => formFromEvent(event, orgName));
  const [baseline, setBaseline] = useState(() => JSON.stringify(formFromEvent(event, orgName)));
  const [step, setStep] = useState<Step>(initialStep);
  const [view, setView] = useState<"wizard" | "poster">("wizard");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Réinitialisé à chaque ouverture (événement ou étape demandée).
  const openKey = open ? `${event?.id ?? "new"}:${initialStep}` : null;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  if (openKey && openKey !== loadedKey) {
    const fresh = formFromEvent(event, orgName);
    setForm(fresh);
    setBaseline(JSON.stringify(fresh));
    setStep(initialStep);
    setView("wizard");
    setSavedAt(null);
    setLoadedKey(openKey);
  }
  if (!open && loadedKey) setLoadedKey(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step, view]);

  const set = (patch: Partial<EditorForm>) => setForm((f) => ({ ...f, ...patch }));
  const dirty = JSON.stringify(form) !== baseline;
  const states = stepStates(form);
  const soldCount = useMemo(() => (event?.ticketTypes ?? []).reduce((n, t) => n + t.sold, 0), [event]);
  const missing = recapOf(form, set).filter((r) => !r.ok).length;

  function requestClose() {
    if (dirty && !window.confirm("Quitter sans enregistrer vos modifications ?")) return;
    onOpenChange(false);
  }

  async function submit(close: boolean) {
    if (form.title.trim().length < 2) {
      setStep(1);
      return toast.error("Le titre est obligatoire (2 caractères minimum).");
    }
    if (!form.startDay) {
      setStep(1);
      return toast.error("Indiquez la date de début.");
    }
    if (!form.venueName.trim()) {
      setStep(1);
      return toast.error("Indiquez le lieu de l'événement.");
    }
    if (form.endDay && new Date(`${form.endDay}T${form.endTime || "00:00"}`) <= new Date(`${form.startDay}T${form.startTime || "00:00"}`)) {
      setStep(1);
      return toast.error("La fin doit être après le début.");
    }
    if (form.questionnaireEnabled && form.questions.some((q) => !q.title.trim())) {
      setStep(3);
      return toast.error("Chaque question doit avoir un intitulé.");
    }
    try {
      const id = await save.mutateAsync({ existing: event, form: toEventForm(form) });
      setBaseline(JSON.stringify(form));
      setSavedAt(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
      toast.success(event ? "Modifications enregistrées." : "Événement créé.");
      if (close || !event) {
        onOpenChange(false);
        if (!event && id) onCreated?.(id);
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Enregistrement impossible."));
    }
  }

  const stepIcon = (s: (typeof STEPS)[number], i: number) => {
    const active = step === s.n;
    const state = states[i];
    if (active) return <span className="flex size-5 items-center justify-center rounded-full bg-ev-primary text-[11px] text-white">{s.n}</span>;
    if (state === "warn")
      return <span className="flex size-5 items-center justify-center rounded-full bg-ev-warn-bg text-[11px] font-bold text-ev-gold-text">!</span>;
    return (
      <span className="flex size-5 items-center justify-center rounded-full bg-ev-mint text-ev-primary dark:text-ev-link">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  };

  const canPreview = !!event && !!tenant;

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? onOpenChange(true) : requestClose())}>
      <SheetContent side="right" showCloseButton={false} className={cn(EV_PORTAL, "w-full gap-0 border-l-0 bg-ev-surface p-0 shadow-[-24px_0_48px_rgba(12,22,18,.18)] sm:max-w-[920px]")}>
        <SheetTitle className="sr-only">{event ? "Modifier l'événement" : "Nouvel événement"}</SheetTitle>
        <SheetDescription className="sr-only">Informations, billets, questionnaire et certificat de l&apos;événement.</SheetDescription>

        {view === "poster" ? (
          <PosterStudio
            form={form}
            orgName={orgName}
            onBack={() => setView("wizard")}
            onUse={(url) => {
              set({ imageUrl: url });
              setView("wizard");
              toast.success("Affiche appliquée. Enregistrez pour la publier.");
            }}
          />
        ) : (
          <div className="flex h-full flex-col">
            <header className="sticky top-0 z-[2] border-b border-ev-border bg-ev-surface">
              <div className="flex items-center justify-between gap-3 px-4 pb-3.5 pt-4 sm:gap-4 sm:px-8 sm:pt-[18px]">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-xs text-ev-muted">{event ? "Modifier l'événement" : "Nouvel événement"}</span>
                  <h1 className="m-0 truncate text-[17px] font-semibold tracking-[-0.01em] sm:text-[19px]">{form.title || "Sans titre"}</h1>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
                  <span className="hidden items-center gap-1.5 text-xs text-ev-muted sm:flex">
                    {dirty ? (
                      <>
                        <span className="size-1.5 rounded-full bg-ev-amber" />
                        Modifications non enregistrées
                      </>
                    ) : event ? (
                      <>
                        <Check className="size-3.5 text-ev-ok" />
                        {savedAt ? `Enregistré à ${savedAt}` : "Enregistré"}
                      </>
                    ) : null}
                  </span>
                  <EvButton
                    size="sm"
                    disabled={!canPreview}
                    title={canPreview ? "Voir la page publique" : "Disponible après l'enregistrement"}
                    onClick={() => event && tenant && window.open(publicSiteUrl(tenant.slug, `/events/${event.id}`), "_blank", "noopener")}
                  >
                    <Eye />
                    <span className="hidden xs:inline sm:inline">Aperçu</span>
                  </EvButton>
                  <button type="button" aria-label="Fermer" onClick={requestClose} className="flex size-9 items-center justify-center rounded-[10px] bg-[#F1EFE9] text-ev-ink2 hover:bg-ev-line dark:bg-ev-line">
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <nav aria-label="Étapes">
                <ol className="m-0 grid list-none grid-cols-4 gap-2 px-4 pb-3 sm:gap-2.5 sm:px-8 sm:pb-3.5">
                  {STEPS.map((s, i) => {
                    const active = step === s.n;
                    const bar = active ? "bg-ev-primary" : states[i] === "warn" ? "bg-ev-border" : "bg-[#8FC7AE]";
                    return (
                      <li key={s.n}>
                        <button type="button" aria-current={active ? "step" : undefined} onClick={() => setStep(s.n)} className={cn("flex w-full flex-col gap-2 text-left", active ? "text-ev-ink" : "text-ev-ink2")}>
                          <span className={cn("h-[3px] rounded-full", bar)} />
                          <span className={cn("flex items-center gap-2 text-[13px]", active ? "font-semibold" : "font-medium")}>
                            {stepIcon(s, i)}
                            <span className="hidden truncate sm:inline">{s.label}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </header>

            <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-5 sm:px-8 sm:pt-6">
              {step === 1 && <StepInfos form={form} set={set} soldCount={soldCount} orgName={orgName} onOpenPosterStudio={() => setView("poster")} />}
              {step === 2 && <StepTickets form={form} set={set} eventId={event?.id ?? null} />}
              {step === 3 && <StepQuestionnaire form={form} set={set} />}
              {step === 4 && <StepCertificate form={form} set={set} soldCount={soldCount} goTo={setStep} />}
            </div>

            <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 border-t border-ev-border bg-ev-surface px-4 py-3 sm:gap-3 sm:px-8 sm:py-3.5">
              {step === 1 ? (
                <EvButton size="lg" className="h-[40px] px-3.5 text-[13px] sm:h-[42px] sm:px-4 sm:text-sm" onClick={requestClose}>
                  Annuler
                </EvButton>
              ) : (
                <EvButton size="lg" className="h-[40px] px-3 text-[13px] sm:h-[42px] sm:px-4 sm:text-sm" onClick={() => setStep((step - 1) as Step)}>
                  <ChevronLeft />
                  Précédent
                </EvButton>
              )}
              <div className="flex items-center gap-2 sm:gap-3">
                {step < 4 ? (
                  <>
                    <button type="button" disabled={save.isPending} onClick={() => void submit(true)} className="hidden h-[42px] px-4 text-sm font-semibold text-ev-link hover:underline disabled:opacity-50 sm:block">
                      Enregistrer et fermer
                    </button>
                    <EvButton variant="primary" size="lg" className="h-[40px] px-3.5 text-[13px] sm:h-[42px] sm:px-[18px] sm:text-sm" onClick={() => setStep((step + 1) as Step)}>
                      {STEPS[step - 1].next}
                      <ChevronRight />
                    </EvButton>
                  </>
                ) : (
                  <>
                    {missing > 0 && (
                      <span className="hidden text-xs text-ev-gold-text sm:inline">
                        {missing} élément{missing > 1 ? "s" : ""} à compléter
                      </span>
                    )}
                    <EvButton variant="primary" size="lg" className="h-[40px] px-3.5 text-[13px] sm:h-[42px] sm:px-[18px] sm:text-sm" disabled={save.isPending} onClick={() => void submit(true)}>
                      {save.isPending ? <Loader2 className="animate-spin" /> : <Check />}
                      {event ? "Enregistrer les modifications" : "Créer l'événement"}
                    </EvButton>
                  </>
                )}
              </div>
            </footer>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
