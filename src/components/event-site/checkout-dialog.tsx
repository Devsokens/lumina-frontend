"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { QRCodeSVG } from "qrcode.react";
import { Check, CreditCard, Download, FileText, FlaskConical, Loader2, ShieldCheck, Star, X } from "lucide-react";
import { toast } from "sonner";
import { downloadOrderDocument, downloadTickets } from "@/lib/download";
import { apiErrorMessage, normalizePhone, ticketNumber } from "@/lib/events";
import { siteStyle } from "@/lib/event-site-theme";
import { eventSiteFontVariables } from "@/lib/event-site-fonts";
import { confirmSimulatedPayment, fetchPaymentStatus, initializePayment, purchaseTickets } from "@/hooks/usePublicEvents";
import { formatPrice } from "@/components/event-site/site-data";
import { useSiteLook } from "@/components/event-site/site-look";
import { DownloadButton } from "@/components/shared/download-button";
import type { PublicEvent, PurchasedTicket } from "@/types/events";
import type { QuestionnaireQuestion } from "@/types/api";
import { cn } from "@/lib/utils";
import { OperatorLogo } from "@/components/shared/operator-logo";
import { DataNotice } from "@/components/shared/data-notice";
import { TurnstileWidget } from "@/components/shared/turnstile-widget";

// Réservation sans quitter la page de l'événement : participants (acheteur +
// un nom par billet), questionnaire de l'organisateur s'il est activé, moyen
// de paiement (billets payants), puis billets à l'écran. Les billets et la
// facture partent aussi à l'e-mail de l'acheteur (un PDF, une page par billet).

type Ticket = PublicEvent["ticketTypes"][number];
// Une formule et son nombre de billets (plusieurs formules par commande).
export type CheckoutLine = { ticket: Ticket; quantity: number };
type AnswerValue = string | number | string[];
type Step = "people" | "questions" | "payment";
type Method = "AIRTEL" | "MOOV" | "CARD";
type Done = { tickets: PurchasedTicket[]; orderId: string | null; documentToken: string | null; paid: boolean };

const STEP_LABEL: Record<Step, string> = { people: "Participants", questions: "Questions", payment: "Paiement" };
const PHONE_FORMAT = /^\+?[0-9]{8,15}$/;
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Limites Mobile Money de PVit, en francs.
const MOMO_MIN = 150;
const MOMO_MAX = 500_000;
const POLL_MS = 3_000;
const POLL_SLOW_AFTER = 30; // ~1 min 30 : proposer de renvoyer la demande
const POLL_MAX = 100; // ~5 min

// Opérateur d'après le numéro : Airtel 07, Moov 06.
function operatorOf(phone: string): "AIRTEL" | "MOOV" | null {
  const digits = normalizePhone(phone).replace(/^\+/, "").replace(/^(00)?241/, "");
  if (/^0?7/.test(digits)) return "AIRTEL";
  if (/^0?6/.test(digits)) return "MOOV";
  return null;
}

// Carte : numéro gabonais, ou étranger avec l'indicatif (+33…, 0033…).
function cardPhoneOk(phone: string) {
  const v = normalizePhone(phone);
  const local = v.replace(/^(\+|00)?241(?=[0-9]{8,9}$)/, "");
  return /^0?[0-9]{8}$/.test(local) || /^(\+|00)[1-9][0-9]{6,14}$/.test(v);
}

const filled = (v: AnswerValue | undefined) =>
  v !== undefined && (Array.isArray(v) ? v.length > 0 : typeof v === "number" ? true : v.trim() !== "");

export function CheckoutDialog({
  event,
  lines,
  variant,
  preview,
  onClose,
}: {
  event: PublicEvent;
  lines: CheckoutLine[];
  variant: "nuit" | "lumiere";
  preview?: boolean;
  // done : réservation aboutie (la sélection peut être remise à zéro).
  onClose: (done: boolean) => void;
}) {
  const look = useSiteLook();
  const nuit = variant === "nuit";
  const quantity = lines.reduce((n, l) => n + l.quantity, 0);
  const total = lines.reduce((sum, l) => sum + l.ticket.price * l.quantity, 0);
  const paid = total > 0;
  // Formule de chaque billet, dans l'ordre (billet 1 = l'acheteur).
  const seats = lines.flatMap((l) => Array.from({ length: l.quantity }, () => l.ticket.name));
  const summary = lines.map((l) => `${l.quantity} × ${l.ticket.name}`).join(", ");
  const settings = event.settings;
  const questions: QuestionnaireQuestion[] = settings?.questionnaireEnabled ? (settings.questionnaire ?? []) : [];
  const steps: Step[] = ["people", ...(questions.length ? (["questions"] as const) : []), ...(paid ? (["payment"] as const) : [])];

  const [step, setStep] = useState<Step>("people");
  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "" });
  const [holders, setHolders] = useState<string[]>(() => Array.from({ length: quantity - 1 }, () => ""));
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<Method>("AIRTEL");
  const [momo, setMomo] = useState("");
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<string | null>(null);
  // Paiement parti : on attend la validation (téléphone ou onglet de la banque).
  const [waiting, setWaiting] = useState<{ reference: string; card: boolean } | null>(null);
  const [slow, setSlow] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const key = useRef<string | null>(null);
  const body = useRef<HTMLDivElement>(null);

  const index = steps.indexOf(step);

  // Nouvelle étape (ou résultat) : retour en haut de la fenêtre.
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [step, done, simulation, waiting]);

  // Attente du résultat, sans quitter la page.
  useEffect(() => {
    if (!waiting) return;
    let stopped = false;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      tries += 1;
      try {
        const status = await fetchPaymentStatus(waiting.reference);
        if (stopped) return;
        if (status.paymentStatus === "PAID") {
          setWaiting(null);
          setDone({ tickets: status.tickets, orderId: status.orderId, documentToken: status.documentToken, paid: true });
          return;
        }
        if (status.paymentStatus === "FAILED") {
          setWaiting(null);
          setFailed(true);
          return;
        }
      } catch {
        // Coupure passagère : on réessaie au tour suivant.
      }
      if (stopped) return;
      if (tries === POLL_SLOW_AFTER) setSlow(true);
      if (tries < POLL_MAX) timer = setTimeout(() => void tick(), POLL_MS);
    };
    timer = setTimeout(() => void tick(), POLL_MS);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [waiting]);

  // Une correction efface l'erreur du champ concerné.
  function clearError(name: string) {
    if (!errors[name]) return;
    setErrors((prev) => {
      const rest = { ...prev };
      delete rest[name];
      return rest;
    });
  }
  const last = index === steps.length - 1;

  function validatePeople() {
    const e: Record<string, string> = {};
    if (buyer.name.trim().length < 2) e.name = "Indiquez votre nom complet.";
    if (!EMAIL_FORMAT.test(buyer.email.trim())) e.email = "Adresse e-mail invalide : vos billets y seront envoyés.";
    if (!PHONE_FORMAT.test(normalizePhone(buyer.phone))) e.phone = "Numéro invalide : ex. 077 12 34 56, ou +33 6 12 34 56 78 depuis l'étranger.";
    holders.forEach((h, i) => {
      if (h.trim().length < 2) e[`holder-${i}`] = "Nom du participant requis.";
    });
    return e;
  }

  function validateQuestions() {
    const e: Record<string, string> = {};
    for (const q of questions) if (q.isRequired && !filled(answers[q.id])) e[`q-${q.id}`] = "Réponse requise.";
    return e;
  }

  function validatePayment() {
    const e: Record<string, string> = {};
    if (method !== "CARD") {
      const francs = total / 100;
      const operator = operatorOf(momo);
      if (!PHONE_FORMAT.test(normalizePhone(momo))) e.momo = "Numéro Mobile Money invalide.";
      else if (operator !== method) e.momo = `Ce numéro n'est pas un numéro ${method === "AIRTEL" ? "Airtel Money" : "Moov Money"}.`;
      else if (francs > MOMO_MAX) e.momo = "Mobile Money est limité à 500 000 F par paiement : réduisez le nombre de billets ou payez par carte.";
      else if (francs < MOMO_MIN) e.momo = "Mobile Money demande un paiement d'au moins 150 F.";
    } else if (!cardPhoneOk(buyer.phone)) {
      e.card = "Depuis l'étranger, indiquez l'indicatif du pays dans votre téléphone (étape précédente), par exemple +33 6 12 34 56 78.";
    }
    return e;
  }

  // L'opérateur suit le numéro saisi.
  function changeMomo(value: string) {
    clearError("momo");
    setMomo(value);
    const operator = operatorOf(value);
    if (operator) setMethod((m) => (m === "CARD" ? m : operator));
  }

  function next() {
    const e = step === "people" ? validatePeople() : step === "questions" ? validateQuestions() : validatePayment();
    setErrors(e);
    if (Object.keys(e).length) {
      // Premier champ en erreur visible.
      requestAnimationFrame(() => body.current?.querySelector("[data-error]")?.scrollIntoView({ block: "center", behavior: "smooth" }));
      return;
    }
    if (last) return void submit();
    const following = steps[index + 1];
    if (following === "payment" && !momo) changeMomo(buyer.phone);
    setStep(following);
  }

  // Crée la commande (places réservées) puis lance le paiement ; gratuit :
  // billets émis tout de suite.
  async function submit() {
    if (preview) return void toast.info("Aperçu : la réservation fonctionne sur le site publié.");
    // Ouvert dès le clic : un onglet ouvert plus tard serait bloqué.
    const cardTab = paid && method === "CARD" ? window.open("about:blank", "_blank") : null;
    setBusy(true);
    setFailed(false);
    setSlow(false);
    try {
      let id = orderId;
      if (!id) {
        key.current ??= crypto.randomUUID();
        const kept = Object.fromEntries(Object.entries(answers).filter(([, v]) => filled(v)).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));
        const order = await purchaseTickets(
          event.id,
          {
            items: lines.map((l) => ({ ticketTypeId: l.ticket.id, quantity: l.quantity })),
            customerName: buyer.name.trim(),
            customerEmail: buyer.email.trim(),
            customerPhone: normalizePhone(buyer.phone),
            attendees: [buyer.name, ...holders].map((name) => ({ name: name.trim() })),
            ...(Object.keys(kept).length ? { answers: kept } : {}),
          },
          key.current
        );
        if (order.paymentStatus === "PAID") {
          cardTab?.close();
          setDone({ tickets: order.tickets, orderId: order.id, documentToken: null, paid: false });
          return;
        }
        id = order.id;
        setOrderId(id);
      }
      const payment = await initializePayment(id, { method, phone: normalizePhone(method === "CARD" ? buyer.phone : momo) });
      if (payment.simulated) {
        cardTab?.close();
        setSimulation(payment.reference);
        return;
      }
      if (payment.flow === "REDIRECT") {
        if (cardTab) {
          cardTab.opener = null;
          cardTab.location.href = payment.authorizationUrl;
        } else {
          window.location.assign(payment.authorizationUrl);
          return;
        }
      }
      setWaiting({ reference: payment.reference, card: payment.flow === "REDIRECT" });
    } catch (err) {
      cardTab?.close();
      if (!orderId) key.current = null;
      toast.error(apiErrorMessage(err, paid ? "Réservation impossible, réessayez." : "Inscription impossible, réessayez."));
    } finally {
      setBusy(false);
    }
  }

  async function simulate(outcome: "success" | "failed") {
    if (!simulation) return;
    setBusy(true);
    try {
      const status = await confirmSimulatedPayment(simulation, outcome);
      setSimulation(null);
      if (status.paymentStatus === "PAID") {
        setDone({ tickets: status.tickets, orderId: status.orderId, documentToken: status.documentToken, paid: true });
      } else {
        setFailed(true);
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Paiement impossible, réessayez."));
    } finally {
      setBusy(false);
    }
  }

  const primary = cn(
    "flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50",
    nuit ? "bg-(--s-accent) text-(--s-accent-ink)" : "bg-(--s-dark) text-(--s-dark-ink)"
  );
  const secondary = "flex h-[52px] items-center justify-center gap-2 rounded-full border border-(--s-line3) px-5 text-[15px] font-semibold text-(--s-text) hover:bg-(--s-surface2) disabled:opacity-50";
  const finalLabel = paid ? `Payer ${formatPrice(total)}` : "S'inscrire";

  return (
    <DialogPrimitive.Root open onOpenChange={(o) => !o && !busy && onClose(!!done)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[3px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          style={siteStyle(look)}
          data-radius={look.radius}
          onInteractOutside={(e) => e.preventDefault()}
          className={cn(
            eventSiteFontVariables,
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col overflow-hidden rounded-t-[28px] bg-(--s-bg) font-(family-name:--s-font-body) text-(--s-text) antialiased shadow-[0_30px_80px_rgba(0,0,0,.35)] outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-6",
            "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90dvh] sm:w-[min(580px,calc(100%-32px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px] sm:data-[state=open]:zoom-in-95 sm:data-[state=open]:slide-in-from-bottom-0"
          )}
        >
          {/* En-tête : événement, formule, total. */}
          <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-semibold tracking-[0.14em] text-(--s-muted)">{paid ? "RÉSERVATION" : "INSCRIPTION"}</span>
              <DialogPrimitive.Title className="m-0 truncate font-(family-name:--s-font-display) text-[22px] font-extrabold leading-tight tracking-[-0.02em]">{event.title}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="m-0 text-sm text-(--s-muted)">
                {summary} · {paid ? formatPrice(total) : "Gratuit"}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              aria-label="Fermer"
              disabled={busy}
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-(--s-line2) text-(--s-soft) hover:bg-(--s-surface2) disabled:opacity-40"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          {/* Étapes. */}
          {!done && steps.length > 1 && (
            <ol className="m-0 flex list-none gap-2 px-5 pb-4 sm:px-7">
              {steps.map((s, i) => (
                <li key={s} className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className={cn("h-1 rounded-full", i <= index ? (nuit ? "bg-(--s-accent)" : "bg-(--s-dark)") : "bg-(--s-line2)")} />
                  <span className={cn("truncate text-xs font-semibold", i === index ? "text-(--s-text)" : "text-(--s-faint)")}>
                    {i + 1}. {STEP_LABEL[s]}
                  </span>
                </li>
              ))}
            </ol>
          )}

          <div ref={body} className="min-h-0 flex-1 overflow-y-auto border-t border-(--s-line) px-5 py-6 sm:px-7">
            {done ? (
              <DoneView done={done} email={buyer.email.trim()} nuit={nuit} typeName={(id) => lines.find((l) => l.ticket.id === id)?.ticket.name ?? null} />
            ) : waiting ? (
              <WaitingView card={waiting.card} method={method} phone={momo} total={total} slow={slow} />
            ) : simulation ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 rounded-[18px] border border-[#E9B949]/50 bg-[#E9B949]/12 p-4 text-sm leading-relaxed">
                  <FlaskConical className="mt-0.5 size-5 shrink-0 text-[#C99A2E]" />
                  <span>
                    <strong>Mode test : aucun paiement réel.</strong> Une fois le prestataire de paiement branché, vous validerez ici le paiement
                    {method === "CARD" ? " par carte" : ` sur votre téléphone (${method === "AIRTEL" ? "Airtel Money" : "Moov Money"})`}.
                  </span>
                </div>
                <PaymentSummary lines={lines} total={total} />
              </div>
            ) : step === "people" ? (
              <PeopleStep buyer={buyer} setBuyer={setBuyer} holders={holders} setHolders={setHolders} seats={lines.length > 1 ? seats : null} errors={errors} clearError={clearError} paid={paid} />
            ) : step === "questions" ? (
              <QuestionsStep questions={questions} answers={answers} setAnswers={setAnswers} errors={errors} clearError={clearError} nuit={nuit} />
            ) : (
              <PaymentStep method={method} setMethod={setMethod} momo={momo} setMomo={changeMomo} errors={errors} lines={lines} total={total} failed={failed} nuit={nuit} />
            )}
          </div>

          {/* Anti-robot (invisible sauf en cas de doute), pour toute la durée du parcours. */}
          {!preview && <TurnstileWidget className="px-5 pb-2 sm:px-7" />}
          {/* Actions. */}
          <div className="flex gap-2.5 border-t border-(--s-line) px-5 py-4 sm:px-7">
            {done ? (
              <button type="button" className={primary} onClick={() => onClose(true)}>
                Terminé
              </button>
            ) : waiting ? (
              slow ? (
                <>
                  <button type="button" className={secondary} disabled={busy} onClick={() => setWaiting(null)}>
                    Changer de moyen
                  </button>
                  <button type="button" className={primary} disabled={busy} onClick={() => void submit()}>
                    {busy && <Loader2 className="size-4 animate-spin" />}
                    Renvoyer la demande
                  </button>
                </>
              ) : (
                <span className="flex h-[52px] flex-1 items-center justify-center gap-2 text-sm font-semibold text-(--s-muted)">
                  <Loader2 className="size-4 animate-spin" /> En attente de votre confirmation…
                </span>
              )
            ) : simulation ? (
              <>
                <button type="button" className={secondary} disabled={busy} onClick={() => void simulate("failed")}>
                  Simuler un refus
                </button>
                <button type="button" className={primary} disabled={busy} onClick={() => void simulate("success")}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Valider le paiement
                </button>
              </>
            ) : (
              <>
                {index > 0 && !orderId && (
                  <button type="button" className={secondary} disabled={busy} onClick={() => setStep(steps[index - 1])}>
                    Retour
                  </button>
                )}
                <button type="button" className={primary} disabled={busy} onClick={next}>
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {busy ? (paid ? "Réservation…" : "Inscription…") : last ? (failed ? "Réessayer le paiement" : finalLabel) : "Continuer"}
                </button>
              </>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// ---------- Champs ----------

const inputClass = (error?: string) =>
  cn(
    "h-12 w-full rounded-[14px] border bg-transparent px-4 text-[15px] text-(--s-text) outline-none placeholder:text-(--s-faint) focus:border-(--s-accent)",
    error ? "border-[#E5484D]" : "border-(--s-line2)"
  );

function Field({ label, hint, error, required, children }: { label: string; hint?: string; error?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold">
        {label}
        {required && <span className="text-(--s-accent)"> *</span>}
        {hint && <span className="font-normal text-(--s-muted)"> · {hint}</span>}
      </span>
      {children}
      {error && (
        <span data-error className="text-xs font-medium text-[#E5484D]">
          {error}
        </span>
      )}
    </label>
  );
}

function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-(family-name:--s-font-display) text-lg font-bold">{children}</span>
      {sub && <span className="text-[13px] text-(--s-muted)">{sub}</span>}
    </div>
  );
}

function PeopleStep({
  buyer,
  setBuyer,
  holders,
  setHolders,
  seats,
  errors,
  clearError,
  paid,
}: {
  buyer: { name: string; email: string; phone: string };
  setBuyer: (b: { name: string; email: string; phone: string }) => void;
  holders: string[];
  setHolders: (h: string[]) => void;
  // Formule de chaque billet (plusieurs formules) ; null : une seule.
  seats: string[] | null;
  errors: Record<string, string>;
  clearError: (name: string) => void;
  paid: boolean;
}) {
  const edit = (field: "name" | "email" | "phone", value: string) => {
    clearError(field);
    setBuyer({ ...buyer, [field]: value });
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <SectionTitle sub={`Vos billets${paid ? " et votre facture" : ""} seront envoyés à cette adresse e-mail.`}>Vos coordonnées</SectionTitle>
        <Field label="Nom complet" required error={errors.name}>
          <input value={buyer.name} onChange={(e) => edit("name", e.target.value)} maxLength={120} autoComplete="name" className={inputClass(errors.name)} />
        </Field>
        <Field label="E-mail" required error={errors.email}>
          <input type="email" value={buyer.email} onChange={(e) => edit("email", e.target.value)} maxLength={254} autoComplete="email" placeholder="vous@exemple.com" className={inputClass(errors.email)} />
        </Field>
        <Field label="Téléphone" required hint="pour vous joindre au sujet de votre réservation" error={errors.phone}>
          <input type="tel" value={buyer.phone} onChange={(e) => edit("phone", e.target.value)} autoComplete="tel" placeholder="077 12 34 56" className={inputClass(errors.phone)} />
        </Field>
      </div>

      {holders.length > 0 && (
        <div className="flex flex-col gap-4">
          <SectionTitle sub="Chaque billet porte le nom de son participant. Tous les billets arrivent dans votre e-mail.">Noms sur les billets</SectionTitle>
          <div className="flex items-center justify-between gap-3 rounded-[14px] border border-(--s-line) bg-(--s-surface) px-4 py-3 text-sm">
            <span className="text-(--s-muted)">Billet 1{seats ? ` · ${seats[0]}` : ""}</span>
            <span className="truncate font-semibold">{buyer.name.trim() || "Vous"} <span className="font-normal text-(--s-muted)">(vous)</span></span>
          </div>
          {holders.map((h, i) => (
            <Field key={i} label={`Billet ${i + 2}${seats ? ` · ${seats[i + 1]}` : ""}`} required error={errors[`holder-${i}`]}>
              <input
                value={h}
                onChange={(e) => {
                  clearError(`holder-${i}`);
                  setHolders(holders.map((x, j) => (j === i ? e.target.value : x)));
                }}
                maxLength={120}
                placeholder="Nom complet du participant"
                className={inputClass(errors[`holder-${i}`])}
              />
            </Field>
          ))}
        </div>
      )}
      <DataNotice controller="l'organisateur de cet événement" purpose="vous envoyer vos billets, contrôler l'entrée et vous tenir informé de l'événement" />
    </div>
  );
}

function QuestionsStep({
  questions,
  answers,
  setAnswers,
  errors,
  clearError,
  nuit,
}: {
  questions: QuestionnaireQuestion[];
  answers: Record<string, AnswerValue>;
  setAnswers: (a: Record<string, AnswerValue>) => void;
  errors: Record<string, string>;
  clearError: (name: string) => void;
  nuit: boolean;
}) {
  const set = (id: string, v: AnswerValue) => {
    clearError(`q-${id}`);
    setAnswers({ ...answers, [id]: v });
  };
  const chip = (on: boolean) =>
    cn(
      "flex min-h-11 items-center gap-2.5 rounded-[14px] border px-4 py-2 text-left text-[15px] transition-colors",
      on ? (nuit ? "border-(--s-accent) bg-(--s-accent-tint)" : "border-(--s-dark) bg-(--s-surface2)") : "border-(--s-line2) hover:bg-(--s-surface2)"
    );
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle sub="L'organisateur souhaite mieux vous connaître.">Quelques questions</SectionTitle>
      {questions.map((q) => {
        const v = answers[q.id];
        const error = errors[`q-${q.id}`];
        const options = q.options ?? [];
        return (
          <fieldset key={q.id} className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2.5 p-0 text-[15px] font-semibold">
              {q.title}
              {q.isRequired && <span className="text-(--s-accent)"> *</span>}
            </legend>
            {q.description && <p className="-mt-1.5 mb-0 text-[13px] text-(--s-muted)">{q.description}</p>}
            {q.type === "PARAGRAPH" ? (
              <textarea value={(v as string) ?? ""} onChange={(e) => set(q.id, e.target.value)} maxLength={2000} rows={4} className={cn(inputClass(error), "h-auto py-3")} />
            ) : q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE" ? (
              <div className="flex flex-col gap-2">
                {options.map((o) => {
                  const multi = q.type === "MULTIPLE_CHOICE";
                  const on = multi ? Array.isArray(v) && v.includes(o) : v === o;
                  return (
                    <button
                      key={o}
                      type="button"
                      role={multi ? "checkbox" : "radio"}
                      aria-checked={on}
                      onClick={() => set(q.id, multi ? (on ? (v as string[]).filter((x) => x !== o) : [...((v as string[]) ?? []), o]) : o)}
                      className={chip(on)}
                    >
                      <span className={cn("flex size-5 shrink-0 items-center justify-center border-2", multi ? "rounded-[6px]" : "rounded-full", on ? (nuit ? "border-(--s-accent) bg-(--s-accent) text-(--s-accent-ink)" : "border-(--s-dark) bg-(--s-dark) text-(--s-dark-ink)") : "border-(--s-line3)")}>
                        {on && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      {o}
                    </button>
                  );
                })}
              </div>
            ) : q.type === "DROPDOWN" ? (
              <select value={(v as string) ?? ""} onChange={(e) => set(q.id, e.target.value)} className={cn(inputClass(error), "bg-(--s-bg)")}>
                <option value="">Choisir…</option>
                {options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : q.type === "YES_NO" ? (
              <div className="flex gap-2">
                {["Oui", "Non"].map((o) => (
                  <button key={o} type="button" role="radio" aria-checked={v === o} onClick={() => set(q.id, o)} className={cn(chip(v === o), "flex-1 justify-center font-semibold")}>
                    {o}
                  </button>
                ))}
              </div>
            ) : q.type === "RATING_SCALE" ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={v === n} onClick={() => set(q.id, n)} className={cn(chip(v === n), "size-12 justify-center px-0 font-semibold")}>
                    {n}
                  </button>
                ))}
              </div>
            ) : q.type === "STAR_RATING" ? (
              <div className="flex gap-1" role="radiogroup" aria-label={q.title}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={v === n} aria-label={`${n} sur 5`} onClick={() => set(q.id, n)} className="p-1">
                    <Star className={cn("size-8", typeof v === "number" && n <= v ? "fill-[#F5B83D] text-[#F5B83D]" : "text-(--s-line3)")} />
                  </button>
                ))}
              </div>
            ) : q.type === "NUMBER" ? (
              <input type="number" inputMode="decimal" value={(v as number | string) ?? ""} onChange={(e) => set(q.id, e.target.value === "" ? "" : Number(e.target.value))} className={cn(inputClass(error), "max-w-[220px]")} />
            ) : q.type === "DATE" ? (
              <input type="date" value={(v as string) ?? ""} onChange={(e) => set(q.id, e.target.value)} className={cn(inputClass(error), "max-w-[220px]")} />
            ) : (
              <input value={(v as string) ?? ""} onChange={(e) => set(q.id, e.target.value)} maxLength={300} className={inputClass(error)} />
            )}
            {error && (
              <span data-error className="text-xs font-medium text-[#E5484D]">
                {error}
              </span>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}

function PaymentSummary({ lines, total }: { lines: CheckoutLine[]; total: number }) {
  return (
    <div className="flex flex-col gap-2 rounded-[18px] border border-(--s-line) bg-(--s-surface) p-4 text-sm">
      {lines.map((l) => (
        <div key={l.ticket.id} className="flex justify-between gap-3">
          <span className="text-(--s-muted)">
            {l.quantity} × {l.ticket.name}
          </span>
          <span>{l.ticket.price === 0 ? "Gratuit" : formatPrice(l.ticket.price * l.quantity)}</span>
        </div>
      ))}
      <div className="flex items-baseline justify-between gap-3 border-t border-(--s-line) pt-2">
        <span className="font-semibold">Total</span>
        <span className="font-(family-name:--s-font-display) text-2xl font-extrabold tracking-[-0.02em]">{formatPrice(total)}</span>
      </div>
    </div>
  );
}

function PaymentStep({
  method,
  setMethod,
  momo,
  setMomo,
  errors,
  lines,
  total,
  failed,
  nuit,
}: {
  method: Method;
  setMethod: (m: Method) => void;
  momo: string;
  setMomo: (v: string) => void;
  errors: Record<string, string>;
  lines: CheckoutLine[];
  total: number;
  failed: boolean;
  nuit: boolean;
}) {
  const card = (on: boolean) =>
    cn(
      "flex items-center gap-3 rounded-[18px] border p-4 text-left transition-colors",
      on ? (nuit ? "border-(--s-accent) bg-(--s-accent-tint)" : "border-(--s-dark) bg-(--s-surface2)") : "border-(--s-line2) hover:bg-(--s-surface2)"
    );
  const mobile = method !== "CARD";
  return (
    <div className="flex flex-col gap-5">
      {failed && (
        <p className="m-0 rounded-[14px] border border-[#E5484D]/40 bg-[#E5484D]/10 px-4 py-3 text-sm text-[#E5484D]">
          Le paiement n&apos;a pas abouti. Aucun montant n&apos;a été prélevé : vous pouvez réessayer.
        </p>
      )}
      <SectionTitle>Moyen de paiement</SectionTitle>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <button type="button" role="radio" aria-checked={mobile} onClick={() => setMethod(mobile ? method : "AIRTEL")} className={card(mobile)}>
          <span className="flex shrink-0 gap-1">
            <OperatorLogo operator="AIRTEL" decorative />
            <OperatorLogo operator="MOOV" decorative />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-semibold">Mobile Money</span>
            <span className="text-xs text-(--s-muted)">Airtel · Moov</span>
          </span>
        </button>
        <button type="button" role="radio" aria-checked={!mobile} onClick={() => setMethod("CARD")} className={card(!mobile)}>
          <CreditCard className="size-6 shrink-0" />
          <span className="flex flex-col">
            <span className="font-semibold">Carte bancaire</span>
            <span className="text-xs text-(--s-muted)">Visa · Mastercard</span>
          </span>
        </button>
      </div>

      {mobile ? (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            {(["AIRTEL", "MOOV"] as const).map((op) => (
              <button
                key={op}
                type="button"
                role="radio"
                aria-checked={method === op}
                onClick={() => setMethod(op)}
                className={cn(
                  "flex h-[60px] min-w-0 flex-1 items-center gap-2.5 rounded-[14px] border px-2.5 text-left text-sm font-semibold transition-colors",
                  method === op ? (nuit ? "border-(--s-accent) bg-(--s-accent-tint) ring-1 ring-(--s-accent)" : "border-(--s-dark) bg-(--s-surface2) ring-1 ring-(--s-dark)") : "border-(--s-line2) hover:bg-(--s-surface2)"
                )}
              >
                <OperatorLogo operator={op} decorative className="size-10" />
                <span className="min-w-0 truncate">{op === "AIRTEL" ? "Airtel Money" : "Moov Money"}</span>
              </button>
            ))}
          </div>
          <Field label="Numéro Mobile Money" required hint="la demande de paiement y sera envoyée" error={errors.momo}>
            <input type="tel" value={momo} onChange={(e) => setMomo(e.target.value)} autoComplete="tel" placeholder="077 12 34 56" className={inputClass(errors.momo)} />
          </Field>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <p className="m-0 text-sm text-(--s-muted)">
            Vous saisirez votre carte sur la page sécurisée de notre prestataire de paiement. Le montant est débité en francs CFA : une banque étrangère le convertit dans votre devise.
          </p>
          {errors.card && <p className="m-0 text-sm text-[#E5484D]">{errors.card}</p>}
        </div>
      )}

      <PaymentSummary lines={lines} total={total} />
      <span className="flex items-center gap-2 text-xs text-(--s-muted)">
        <ShieldCheck className="size-4 shrink-0" /> Paiement sécurisé. Vos billets et votre facture arrivent par e-mail dès la confirmation.
      </span>
    </div>
  );
}

// ---------- Attente de la validation ----------

function WaitingView({ card, method, phone, total, slow }: { card: boolean; method: Method; phone: string; total: number; slow: boolean }) {
  const operator = method === "MOOV" ? "MOOV" : "AIRTEL";
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      {card ? <Loader2 className="size-10 animate-spin text-(--s-muted)" /> : <OperatorLogo operator={operator} className="size-16 rounded-[16px]" />}
      <span className="font-(family-name:--s-font-display) text-2xl font-extrabold tracking-[-0.02em]">
        {card ? "Terminez le paiement dans l'onglet ouvert" : "Validez sur votre téléphone"}
      </span>
      <p className="m-0 max-w-[420px] text-sm leading-relaxed text-(--s-body)">
        {card ? (
          <>Une fois le paiement de <strong className="text-(--s-text)">{formatPrice(total)}</strong> validé, vos billets s&apos;afficheront ici.</>
        ) : (
          <>
            Une demande de <strong className="text-(--s-text)">{formatPrice(total)}</strong> vient d&apos;être envoyée au <strong className="text-(--s-text)">{phone}</strong>. Saisissez votre code secret
            {operator === "AIRTEL" ? " Airtel Money" : " Moov Money"} pour confirmer.
          </>
        )}
      </p>
      {slow && (
        <p className="m-0 max-w-[420px] rounded-[14px] bg-(--s-surface2) px-4 py-3 text-[13px] leading-relaxed text-(--s-body)">
          {card ? "Toujours en attente de votre banque." : "Vous n'avez rien reçu ? Vérifiez que votre téléphone capte le réseau, puis renvoyez la demande."} Si le paiement a déjà abouti, vos billets arriveront par e-mail.
        </p>
      )}
    </div>
  );
}

// ---------- Billets ----------

function DoneView({ done, email, nuit, typeName }: { done: Done; email: string; nuit: boolean; typeName: (ticketTypeId: string) => string | null }) {
  const codes = done.tickets.map((t) => t.qrCode);
  const many = done.tickets.length > 1;
  const action = cn(
    "flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold",
    nuit ? "bg-(--s-accent) text-(--s-accent-ink)" : "bg-(--s-dark) text-(--s-dark-ink)"
  );
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className={cn("flex size-14 items-center justify-center rounded-full", nuit ? "bg-(--s-accent) text-(--s-accent-ink)" : "bg-(--s-dark) text-(--s-dark-ink)")}>
          <Check className="size-7" strokeWidth={3} />
        </span>
        <span className="font-(family-name:--s-font-display) text-2xl font-extrabold tracking-[-0.02em]">{done.paid ? "Paiement confirmé" : "Inscription confirmée"}</span>
        <p className="m-0 max-w-[420px] text-sm leading-relaxed text-(--s-body)">
          {many ? `Vos ${done.tickets.length} billets` : "Votre billet"}
          {done.paid ? " et votre facture" : ""} {many || done.paid ? "partent" : "part"} aussi à <strong className="text-(--s-text)">{email}</strong>. Présentez le QR code à l&apos;entrée, sur votre téléphone ou imprimé.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <DownloadButton action={() => downloadTickets(codes)} className={cn(action, "flex-1 disabled:opacity-60")}>
          <Download className="size-4" /> {many ? "Mes billets (PDF)" : "Mon billet (PDF)"}
        </DownloadButton>
        {done.paid && done.orderId && done.documentToken && (
          <DownloadButton
            action={() => downloadOrderDocument(done.orderId!, done.documentToken!, "INVOICE")}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-(--s-line3) px-5 text-sm font-semibold disabled:opacity-60"
          >
            <FileText className="size-4" /> Ma facture (PDF)
          </DownloadButton>
        )}
      </div>

      <ul className={cn("m-0 grid list-none gap-3 p-0", many && "sm:grid-cols-2")}>
        {done.tickets.map((t, i) => (
          <li key={t.id} className="flex flex-col items-center gap-2.5 rounded-[20px] bg-white p-4 text-[#0F1115]">
            <QRCodeSVG value={t.qrCode} size={150} level="M" />
            <span className="text-xs font-semibold text-[#5B6068]">
              Billet {i + 1}/{done.tickets.length}
              {typeName(t.ticketTypeId) ? ` · ${typeName(t.ticketTypeId)}` : ""} · N° {ticketNumber(t.id)}
            </span>
            <DownloadButton action={() => downloadTickets([t.qrCode])} className="flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4 disabled:opacity-60">
              Ce billet seul (PDF)
            </DownloadButton>
          </li>
        ))}
      </ul>
    </div>
  );
}
