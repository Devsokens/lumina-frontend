"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { EvButton, EvInput, EvSoon, initialsOf } from "@/components/events/ev-ui";
import { ADDON_FIELD, AddonInput, Field, InfoNote, MiniSwitch, RadioCard, SettingsCard, SettingsHeading, SettingsRow, StatePill } from "@/components/events/settings/settings-ui";
import {
  useConfirmPayout,
  useConnectGmail,
  useDisconnectGmail,
  useGmailStatus,
  usePayoutCode,
  useSaveEmailSettings,
  useSavePayouts,
  useTestEmail,
  useUpdateTenant,
  type EmailSettings,
  type MessageKind,
  type MessageTemplate,
  type PayoutAccount,
  type PayoutOperator,
  type Payouts,
} from "@/hooks/useAdmin";
import { DEFAULT_MESSAGES, MESSAGE_META, MESSAGE_VARS } from "@/lib/event-messages";
import { apiError } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { OperatorLogo } from "@/components/shared/operator-logo";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/lib/features";
import type { Tenant } from "@/types/api";

// Rubriques des Paramètres (refonte 2026-11, écrans 23 à 25) : identité
// légale, comptes de versement, e-mails et messages, sécurité, profil,
// abonnement. Écriture réservée à l'organisateur (OWNER).

const str = (v: unknown) => (typeof v === "string" ? v : "");

// ---------- Identité légale (PATCH /admin/tenant) ----------

export function SettingsLegal({ tenant, canEdit }: { tenant: Tenant; canEdit: boolean }) {
  const legal = ((tenant.config ?? {}) as { legal?: Record<string, unknown> }).legal ?? {};
  const initial = { legalName: str(legal.name), nif: str(legal.nif), rccm: str(legal.rccm) };
  const [form, setForm] = useState(initial);
  const [source, setSource] = useState(tenant);
  if (source !== tenant) {
    setSource(tenant);
    setForm(initial);
  }
  const update = useUpdateTenant();
  const dirty = form.legalName !== initial.legalName || form.nif !== initial.nif || form.rccm !== initial.rccm;

  async function save() {
    try {
      await update.mutateAsync({ legalName: form.legalName.trim(), nif: form.nif.trim(), rccm: form.rccm.trim() });
      toast.success("Identité légale enregistrée");
    } catch (err) {
      toast.error(apiError(err, "Échec de l'enregistrement"));
    }
  }

  return (
    <>
      <SettingsHeading title="Identité légale" sub="Facultatif : affichée en pied de page de votre site, sur vos factures et vos attestations." />
      <SettingsCard>
        <fieldset disabled={!canEdit} className="m-0 min-w-0 border-0 p-0">
          <SettingsRow title="Entreprise" desc="Raison sociale et numéros d'immatriculation." last>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Raison sociale" className="sm:col-span-2">
                <EvInput h={42} maxLength={160} value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} placeholder="Ex. : SM Événements SARL" className="font-normal" />
              </Field>
              <Field label="NIF">
                <EvInput h={42} maxLength={60} value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} placeholder="Numéro d'identification fiscale" className="font-normal" />
              </Field>
              <Field label="RCCM">
                <EvInput h={42} maxLength={60} value={form.rccm} onChange={(e) => setForm({ ...form, rccm: e.target.value })} placeholder="GA-LBV-…" className="font-normal" />
              </Field>
            </div>
          </SettingsRow>
        </fieldset>
        {canEdit && (
          <div className="flex justify-end gap-2 border-t border-ev-line px-5 py-4 sm:px-6">
            {dirty && (
              <EvButton size="sm" className="h-[38px]" onClick={() => setForm(initial)}>
                Annuler
              </EvButton>
            )}
            <EvButton size="sm" variant="primary" className="h-[38px] px-4" disabled={!dirty || update.isPending} onClick={() => void save()}>
              {update.isPending ? "Enregistrement…" : "Enregistrer"}
            </EvButton>
          </div>
        )}
      </SettingsCard>
    </>
  );
}

// ---------- Paiements (écran 24) ----------

export function payoutsOf(tenant: Tenant): Payouts {
  const raw = ((tenant.settings ?? {}) as { payouts?: Partial<Payouts> }).payouts;
  return { frequency: raw?.frequency ?? "AFTER_EVENT", accounts: Array.isArray(raw?.accounts) ? raw.accounts : [] };
}

const OPERATORS: { key: PayoutOperator; name: string; optional?: boolean; placeholder: string }[] = [
  { key: "AIRTEL", name: "Airtel Money", placeholder: "07 00 00 00" },
  { key: "MOOV", name: "Moov Money", optional: true, placeholder: "06 00 00 00" },
];

function toPhone(raw: string) {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (trimmed.startsWith("00")) return `+${digits.slice(2)}`;
  return `+241${digits.length === 9 && digits.startsWith("0") ? digits.slice(1) : digits}`;
}
const localPart = (phone: string) => phone.replace(/^\+241/, "");

function PayoutRow({ op, payouts, canEdit, last }: { op: (typeof OPERATORS)[number]; payouts: Payouts; canEdit: boolean; last?: boolean }) {
  const saved = payouts.accounts.find((a) => a.operator === op.key) ?? null;
  const [open, setOpen] = useState(!!saved || !op.optional);
  const [phone, setPhone] = useState(saved ? localPart(saved.phone) : "");
  const [holder, setHolder] = useState(saved?.holderName ?? "");
  const [code, setCode] = useState("");
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const [source, setSource] = useState(saved);
  if (source !== saved) {
    setSource(saved);
    setPhone(saved ? localPart(saved.phone) : "");
    setHolder(saved?.holderName ?? "");
  }
  const savePayouts = useSavePayouts();
  const requestCode = usePayoutCode();
  const confirm = useConfirmPayout();
  const dirty = !saved || toPhone(phone) !== saved.phone || holder.trim() !== saved.holderName;

  async function save() {
    const number = toPhone(phone);
    if (!/^\+[0-9]{8,15}$/.test(number)) return void toast.error("Numéro invalide (ex. 77 12 34 56).");
    if (holder.trim().length < 2) return void toast.error("Indiquez le nom du titulaire du compte.");
    const others = payouts.accounts.filter((a) => a.operator !== op.key).map(({ operator, phone: p, holderName }) => ({ operator, phone: p, holderName }));
    try {
      await savePayouts.mutateAsync({ frequency: payouts.frequency, accounts: [...others, { operator: op.key, phone: number, holderName: holder.trim() }] });
      toast.success(FEATURES.sms ? `Compte ${op.name} enregistré : vérifiez-le par SMS.` : `Compte ${op.name} enregistré.`);
    } catch (err) {
      toast.error(apiError(err, "Enregistrement impossible"));
    }
  }

  async function remove() {
    if (!window.confirm(`Retirer le compte ${op.name} ?`)) return;
    try {
      await savePayouts.mutateAsync({
        frequency: payouts.frequency,
        accounts: payouts.accounts.filter((a) => a.operator !== op.key).map(({ operator, phone: p, holderName }) => ({ operator, phone: p, holderName })),
      });
      setOpen(false);
      toast.success("Compte retiré");
    } catch (err) {
      toast.error(apiError(err, "Suppression impossible"));
    }
  }

  async function sendCode() {
    try {
      setCodeSentTo(await requestCode.mutateAsync(op.key));
    } catch (err) {
      toast.error(apiError(err, "Le SMS n'a pas pu être envoyé."));
    }
  }

  async function verify() {
    try {
      await confirm.mutateAsync({ operator: op.key, code: code.trim() });
      setCodeSentTo(null);
      setCode("");
      toast.success(`Compte ${op.name} vérifié`);
    } catch (err) {
      toast.error(apiError(err, "Code invalide ou expiré."));
    }
  }

  // Sans SMS : le compte enregistré suffit (vérifié par l'équipe avant le
  // premier versement).
  const state = saved?.verifiedAt ? (
    <StatePill tone="ok" dot>
      Vérifié
    </StatePill>
  ) : saved && !FEATURES.sms ? (
    <StatePill tone="ok" dot>
      Enregistré
    </StatePill>
  ) : saved ? (
    <StatePill tone="warn" dot>
      À vérifier
    </StatePill>
  ) : op.optional ? (
    <StatePill>Facultatif</StatePill>
  ) : (
    <StatePill tone="warn" dot>
      À configurer
    </StatePill>
  );

  return (
    <div className={cn("flex flex-col gap-4 px-5 py-[22px] sm:px-6", !last && "border-b border-ev-line")}>
      <div className="flex items-center gap-3.5">
        <OperatorLogo operator={op.key} decorative className="size-10 rounded-[10px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[15px] font-semibold">{op.name}</span>
          <span className="text-[13px] text-ev-muted">Compte marchand Gabon</span>
        </div>
        {state}
      </div>
      <div className="sm:pl-[54px]">
        {!open ? (
          <button
            type="button"
            disabled={!canEdit}
            onClick={() => setOpen(true)}
            className="h-[38px] rounded-[10px] border border-dashed border-ev-dash bg-ev-surface px-3.5 text-[13px] font-medium text-ev-ink2 disabled:opacity-60"
          >
            + Ajouter un compte {op.name}
          </button>
        ) : (
          <fieldset disabled={!canEdit} className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
            <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <Field label="Numéro">
                <AddonInput prefix="+241">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder={op.placeholder} aria-label={`Numéro ${op.name}`} className={ADDON_FIELD} />
                </AddonInput>
              </Field>
              <Field label="Nom du titulaire">
                <EvInput h={42} maxLength={120} value={holder} onChange={(e) => setHolder(e.target.value)} placeholder={`Tel qu'enregistré chez ${op.name.split(" ")[0]}`} className="font-normal" />
              </Field>
              {dirty ? (
                <EvButton variant="primary" className="h-[42px] px-4" disabled={savePayouts.isPending} onClick={() => void save()}>
                  Enregistrer
                </EvButton>
              ) : saved?.verifiedAt || !FEATURES.sms ? (
                <EvButton className="h-[42px] px-4" disabled={savePayouts.isPending} onClick={() => void remove()}>
                  Retirer
                </EvButton>
              ) : (
                <EvButton variant="primary" className="h-[42px] px-4" disabled={requestCode.isPending} onClick={() => void sendCode()}>
                  {requestCode.isPending ? "Envoi…" : codeSentTo ? "Renvoyer le SMS" : "Vérifier par SMS"}
                </EvButton>
              )}
            </div>
            {codeSentTo && !dirty && (
              <div className="flex flex-wrap items-end gap-3 rounded-[10px] border border-ev-line bg-ev-soft p-3">
                <Field label={`Code reçu au ${codeSentTo}`}>
                  <EvInput h={40} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="6 chiffres" className="w-36 font-ev-mono tracking-widest" />
                </Field>
                <EvButton variant="primary" className="h-10 px-4" disabled={code.length !== 6 || confirm.isPending} onClick={() => void verify()}>
                  Confirmer
                </EvButton>
              </div>
            )}
          </fieldset>
        )}
      </div>
    </div>
  );
}

export function SettingsPayments({ tenant, canEdit }: { tenant: Tenant; canEdit: boolean }) {
  const payouts = payoutsOf(tenant);
  const savePayouts = useSavePayouts();
  const verified = payouts.accounts.filter((a) => a.verifiedAt || !FEATURES.sms).length;

  async function setFrequency(frequency: Payouts["frequency"]) {
    if (frequency === payouts.frequency) return;
    try {
      await savePayouts.mutateAsync({ frequency, accounts: payouts.accounts.map(({ operator, phone, holderName }: PayoutAccount) => ({ operator, phone, holderName })) });
      toast.success("Fréquence des versements enregistrée");
    } catch (err) {
      toast.error(apiError(err, "Enregistrement impossible"));
    }
  }

  return (
    <>
      <SettingsHeading title="Paiements" sub="Les participants paient par Mobile Money. Les fonds sont reversés sur les comptes ci-dessous." />
      <InfoNote>
        Les encaissements sont traités par notre prestataire de paiement sécurisé. Vos recettes sont reversées sur votre compte, selon la fréquence choisie.
        {!FEATURES.sms && " Notre équipe confirme le numéro de versement avec vous avant le premier virement."}
      </InfoNote>
      {!canEdit && <p className="m-0 text-[13px] text-ev-muted">Seul l&apos;organisateur peut modifier les comptes de versement.</p>}
      <SettingsCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-ev-line px-5 py-[18px] sm:px-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold">Comptes de versement</span>
            <span className="text-[13px] text-ev-muted">
              {verified} compte{verified > 1 ? "s" : ""} {FEATURES.sms ? "vérifié" : "enregistré"}
              {verified > 1 ? "s" : ""} sur {OPERATORS.length}
            </span>
          </div>
        </div>
        {OPERATORS.map((op, i) => (
          <PayoutRow key={op.key} op={op} payouts={payouts} canEdit={canEdit} last={i === OPERATORS.length - 1} />
        ))}
      </SettingsCard>
      <SettingsCard>
        <fieldset disabled={!canEdit || savePayouts.isPending} className="m-0 min-w-0 border-0 p-0">
          <SettingsRow title="Fréquence des versements" desc="Quand les recettes sont reversées.">
            <div role="radiogroup" aria-label="Fréquence" className="flex flex-col gap-2">
              <RadioCard name="freq" checked={payouts.frequency === "AFTER_EVENT"} title="Après chaque événement" desc="Sous 48 h après la fin de l'événement" onSelect={() => void setFrequency("AFTER_EVENT")} />
              <RadioCard name="freq" checked={payouts.frequency === "WEEKLY"} title="Chaque semaine" desc="Tous les lundis, ventes de la semaine précédente" onSelect={() => void setFrequency("WEEKLY")} />
            </div>
          </SettingsRow>
        </fieldset>
        <SettingsRow title="Frais" desc="Qui paie les frais de service." soon last>
          <div className="flex flex-col gap-2.5">
            <span className="flex items-center justify-between gap-3 text-sm">
              Les frais sont ajoutés au prix payé par le participant
              <MiniSwitch checked={false} disabled ariaLabel="Frais à la charge du participant" />
            </span>
            <span className="text-[13px] text-ev-muted">Pour l&apos;instant, aucun frais n&apos;est ajouté au prix de vos billets.</span>
          </div>
        </SettingsRow>
      </SettingsCard>
    </>
  );
}

// ---------- E-mails et messages (écran 25) ----------

export function emailSettingsOf(tenant: Tenant): EmailSettings {
  const raw = ((tenant.settings ?? {}) as { emails?: Partial<EmailSettings> }).emails;
  return { senderName: raw?.senderName ?? "", replyTo: raw?.replyTo ?? "", templates: raw?.templates ?? {} };
}

const KINDS: MessageKind[] = ["ticket", "certificate", "reminder", "survey"];

// Aperçu du texte : variables en pastilles, **gras**, *italique*.
function Preview({ text }: { text: string }) {
  const parts = text.split(/(\{[^}]+\}|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\n)/g).filter((p) => p !== "");
  return (
    <>
      {parts.map((p, i) =>
        p === "\n" ? (
          <br key={i} />
        ) : /^\{.+\}$/.test(p) ? (
          <span key={i} className="rounded-[4px] bg-ev-mint px-1.5 py-px text-[13px] text-ev-primary">
            {p.slice(1, -1)}
          </span>
        ) : /^\*\*.+\*\*$/.test(p) ? (
          <b key={i}>{p.slice(2, -2)}</b>
        ) : /^\*.+\*$/.test(p) ? (
          <i key={i}>{p.slice(1, -1)}</i>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        )
      )}
    </>
  );
}

// ---------- Adresse d'envoi (Gmail de l'organisateur, OAuth2) ----------

const GMAIL_RETURN: Record<string, { ok: boolean; text: string }> = {
  connected: { ok: true, text: "Gmail connecté : vos e-mails partent maintenant de votre adresse." },
  denied: { ok: false, text: "Connexion à Gmail annulée." },
  scope: { ok: false, text: "Cochez « Envoyer des e-mails en votre nom » sur l'écran Google pour connecter Gmail." },
  error: { ok: false, text: "La connexion à Gmail a échoué, réessayez." },
};

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function SendingAddress({ canEdit, senderName }: { canEdit: boolean; senderName: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = useGmailStatus(canEdit);
  const connect = useConnectGmail();
  const disconnect = useDisconnectGmail();
  const g = status.data;

  // Retour de l'écran Google : message, puis on retire ?gmail= de l'adresse.
  const back = params.get("gmail");
  useEffect(() => {
    if (!back) return;
    const r = GMAIL_RETURN[back] ?? GMAIL_RETURN.error;
    if (r.ok) toast.success(r.text);
    else toast.error(r.text);
    const next = new URLSearchParams(params.toString());
    next.delete("gmail");
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
    void status.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [back]);

  async function start() {
    try {
      const url = await connect.mutateAsync();
      if (url) window.location.assign(url);
    } catch (err) {
      toast.error(apiError(err, "Connexion à Gmail impossible pour l'instant."));
    }
  }

  async function stop() {
    if (!window.confirm("Déconnecter Gmail ? Vos e-mails partiront de l'adresse GiyaX.")) return;
    try {
      await disconnect.mutateAsync();
      toast.success("Gmail déconnecté.");
    } catch (err) {
      toast.error(apiError(err, "Échec de la déconnexion"));
    }
  }

  if (!canEdit) return null;

  const active = g?.connected && g.status === "ACTIVE";
  const broken = g?.connected && g.status === "ERROR";

  return (
    <SettingsCard>
      <SettingsRow title="Adresse d'envoi" desc="Vos e-mails peuvent partir de votre propre adresse Gmail. Sinon, ils partent de l'adresse GiyaX à votre nom." last>
        {status.isLoading ? (
          <div className="h-[58px] animate-pulse rounded-[12px] bg-ev-line" />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-ev-border px-4 py-3">
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", active ? "bg-ev-ok-bg text-ev-ok" : "bg-ev-soft text-ev-ink2")}>
                <MailIcon />
              </span>
              <span className="flex min-w-[180px] flex-1 flex-col gap-1">
                {g?.connected ? (
                  <>
                    <span className="truncate text-sm font-semibold">{g.email}</span>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ev-muted">
                      <StatePill tone={active ? "ok" : "warn"} dot>
                        {active ? "Actif" : "À reconnecter"}
                      </StatePill>
                      {active && `${g.sentToday} / ${g.dailyLimit} e-mails aujourd'hui`}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="truncate text-sm font-semibold">Adresse GiyaX</span>
                    <span className="truncate text-xs text-ev-muted">Affiché : « {senderName} via GiyaX »</span>
                  </>
                )}
              </span>
              <div className="flex w-full gap-2 sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none">
                {g?.connected && (
                  <EvButton variant="secondary" className="h-9 px-3.5 text-[13px]" disabled={disconnect.isPending} onClick={() => void stop()}>
                    Déconnecter
                  </EvButton>
                )}
                {!active && (
                  <EvButton variant="primary" className="h-9 px-3.5 text-[13px]" disabled={!g?.available || connect.isPending} onClick={() => void start()}>
                    {broken ? "Reconnecter" : "Connecter mon Gmail"}
                  </EvButton>
                )}
              </div>
            </div>
            {g && !g.available && <p className="m-0 text-[13px] text-ev-muted">La connexion à Gmail n&apos;est pas encore disponible.</p>}
            {g && !active && (broken || !g.platformReady) && (
              <p className="m-0 rounded-[10px] bg-ev-warn-bg px-3.5 py-2.5 text-[13px] leading-relaxed text-ev-gold-text">
                {broken
                  ? g.platformReady
                    ? "Google a retiré l'autorisation d'envoi. En attendant la reconnexion, vos e-mails partent de l'adresse GiyaX."
                    : "Google a retiré l'autorisation d'envoi : reconnectez Gmail, sinon vos e-mails (billets, rappels) ne partent pas."
                  : "L'adresse GiyaX n'est pas encore active : connectez votre Gmail, sinon vos e-mails (billets, rappels) ne partent pas."}
              </p>
            )}
            <span className="text-xs leading-relaxed text-ev-muted">
              GiyaX demande seulement l&apos;autorisation d&apos;envoyer des e-mails en votre nom : votre boîte de réception n&apos;est jamais lue. Au-delà de {g?.dailyLimit ?? 450} e-mails par jour, les
              envois passent par l&apos;adresse GiyaX.
            </span>
          </div>
        )}
      </SettingsRow>
    </SettingsCard>
  );
}

export function SettingsMessages({ tenant, canEdit }: { tenant: Tenant; canEdit: boolean }) {
  const saved = emailSettingsOf(tenant);
  const initial: EmailSettings = {
    senderName: saved.senderName || tenant.name,
    replyTo: saved.replyTo,
    templates: Object.fromEntries(KINDS.map((k) => [k, { ...DEFAULT_MESSAGES[k], ...saved.templates[k] }])) as Record<MessageKind, MessageTemplate>,
  };
  const [form, setForm] = useState(initial);
  const [source, setSource] = useState(tenant);
  if (source !== tenant) {
    setSource(tenant);
    setForm(initial);
  }
  const [active, setActive] = useState<MessageKind>("ticket");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const save = useSaveEmailSettings();
  const test = useTestEmail();
  const gmail = useGmailStatus(canEdit);
  const meta = MESSAGE_META[active];
  const t = form.templates[active] as MessageTemplate;
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const custom = (k: MessageKind) => JSON.stringify(form.templates[k]) !== JSON.stringify(DEFAULT_MESSAGES[k]);

  const setT = (patch: Partial<MessageTemplate>) => setForm((f) => ({ ...f, templates: { ...f.templates, [active]: { ...(f.templates[active] as MessageTemplate), ...patch } } }));

  // Insère une variable ou entoure la sélection (gras, italique).
  function insert(before: string, after = "") {
    const el = bodyRef.current;
    const start = el?.selectionStart ?? t.body.length;
    const end = el?.selectionEnd ?? t.body.length;
    const next = t.body.slice(0, start) + before + t.body.slice(start, end) + after + t.body.slice(end);
    setT({ body: next.slice(0, 2000) });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + before.length, end + before.length);
    });
  }

  async function submit() {
    if (form.replyTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.replyTo)) return void toast.error("Adresse de réponse invalide.");
    for (const k of KINDS) {
      const m = form.templates[k] as MessageTemplate;
      if (!m.subject.trim() || !m.body.trim()) return void toast.error(`« ${MESSAGE_META[k].name} » : objet et message requis.`);
    }
    try {
      await save.mutateAsync({ senderName: form.senderName.trim(), replyTo: form.replyTo.trim(), templates: form.templates });
      toast.success("Messages enregistrés");
    } catch (err) {
      toast.error(apiError(err, "Échec de l'enregistrement"));
    }
  }

  async function sendTest() {
    if (dirty) return void toast.info("Enregistrez d'abord vos modifications pour les recevoir en essai.");
    try {
      const to = await test.mutateAsync(active);
      toast.success(`E-mail d'essai envoyé à ${to}`);
    } catch (err) {
      toast.error(apiError(err, "Envoi impossible"));
    }
  }

  return (
    <>
      <SettingsHeading title="E-mails et messages" sub="Ce que reçoivent vos participants, et au nom de qui." />
      {!canEdit && <p className="m-0 text-[13px] text-ev-muted">Seul l&apos;organisateur peut modifier les messages.</p>}
      <SendingAddress canEdit={canEdit} senderName={form.senderName || tenant.name} />
      <SettingsCard>
        <fieldset disabled={!canEdit} className="m-0 min-w-0 border-0 p-0">
          <SettingsRow title="Expéditeur" desc="Le nom que voient les participants et l'adresse qui reçoit leurs réponses." last>
            <div className="flex flex-col gap-3.5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="Nom affiché">
                  <EvInput h={42} maxLength={80} value={form.senderName} onChange={(e) => setForm({ ...form, senderName: e.target.value })} className="font-normal" />
                </Field>
                <Field label="Adresse de réponse">
                  <EvInput
                    h={42}
                    type="email"
                    maxLength={120}
                    value={form.replyTo}
                    onChange={(e) => setForm({ ...form, replyTo: e.target.value })}
                    placeholder="contact@votre-organisation.ga"
                    className={cn("font-normal", !form.replyTo && "border-[#C98A1A]")}
                  />
                </Field>
              </div>
              <div className="flex items-center gap-3 rounded-[10px] border border-ev-line bg-ev-soft px-3.5 py-3 text-[13px]">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ev-primary text-[11px] font-semibold text-white">{initialsOf(form.senderName || tenant.name)}</span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate">
                    <b>{form.senderName || tenant.name}</b>{" "}
                    <span className="text-ev-muted">{gmail.data?.connected && gmail.data.status === "ACTIVE" ? `<${gmail.data.email}>` : "via GiyaX"}</span>
                  </span>
                  <span className="truncate text-ev-muted">{(form.templates.ticket as MessageTemplate).subject.replaceAll("{Événement}", "votre prochain événement")}</span>
                </span>
              </div>
            </div>
          </SettingsRow>
        </fieldset>
      </SettingsCard>

      <SettingsCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-ev-line px-5 py-[18px] sm:px-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold">Messages automatiques</span>
            <span className="text-[13px] text-ev-muted">Envoyés par e-mail au bon moment.</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row">
          <div role="tablist" aria-orientation="vertical" aria-label="Messages" className="grid grid-cols-2 gap-1 border-b border-ev-line p-2.5 md:flex md:w-[250px] md:shrink-0 md:flex-col md:border-b-0 md:border-r">
            {KINDS.map((k) => {
              const sel = k === active;
              return (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={sel}
                  onClick={() => setActive(k)}
                  className={cn("flex flex-col gap-1 rounded-[10px] p-3 text-left transition-colors", sel ? "bg-[#F1EFE9] dark:bg-ev-line" : "hover:bg-ev-soft")}
                >
                  <span className={cn("text-sm", sel ? "font-semibold" : "font-medium")}>{MESSAGE_META[k].name}</span>
                  <span className="flex flex-wrap justify-between gap-x-2 text-xs text-ev-muted">
                    <span>{MESSAGE_META[k].when}</span>
                    <span>{MESSAGE_META[k].soon ? "Bientôt" : custom(k) ? "Personnalisé" : "Par défaut"}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <fieldset disabled={!canEdit} className="m-0 flex min-w-0 flex-1 flex-col gap-4 border-0 px-5 py-[22px] sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[15px] font-semibold">
                {meta.name}
                {meta.soon && <EvSoon />}
              </span>
              <div className="flex gap-3.5 text-[13px]">
                <span className="flex items-center gap-2">
                  E-mail
                  <MiniSwitch
                    small
                    checked={meta.locked ? true : t.enabled}
                    disabled={meta.locked || meta.soon || !canEdit}
                    ariaLabel="Envoyer par e-mail"
                    onChange={(v) => setT({ enabled: v })}
                  />
                </span>
                <span className="flex items-center gap-2" title="Bientôt : envoi par WhatsApp">
                  WhatsApp <MiniSwitch small checked={false} disabled ariaLabel="Envoyer par WhatsApp" />
                </span>
              </div>
            </div>
            {meta.note && <span className="-mt-2 text-xs text-ev-muted">{meta.note}</span>}
            {meta.soon && <span className="-mt-2 text-xs text-ev-muted">Envoi automatique le lendemain de l&apos;événement : bientôt. Vous pouvez déjà préparer le texte.</span>}
            <Field label="Objet">
              <EvInput h={42} maxLength={160} value={t.subject} onChange={(e) => setT({ subject: e.target.value })} className="font-normal" />
            </Field>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Message</span>
              <div className="overflow-hidden rounded-[10px] border border-ev-border focus-within:border-ev-primary">
                <div className="flex flex-wrap items-center gap-0.5 border-b border-ev-line bg-ev-soft p-1.5">
                  <button type="button" aria-label="Gras" onClick={() => insert("**", "**")} className="h-7 w-[30px] rounded-[6px] font-bold hover:bg-ev-line">
                    B
                  </button>
                  <button type="button" aria-label="Italique" onClick={() => insert("*", "*")} className="h-7 w-[30px] rounded-[6px] italic hover:bg-ev-line">
                    I
                  </button>
                  <span className="mx-1.5 h-[18px] w-px bg-ev-border" />
                  <span className="mr-1 text-xs text-ev-muted">Insérer :</span>
                  {MESSAGE_VARS.map((v) => (
                    <button key={v} type="button" onClick={() => insert(`{${v}}`)} className="h-[26px] rounded-[6px] border border-ev-border bg-ev-surface px-2 font-ev-mono text-[11px] hover:border-ev-primary">
                      {v}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={bodyRef}
                  rows={5}
                  maxLength={2000}
                  value={t.body}
                  onChange={(e) => setT({ body: e.target.value })}
                  aria-label="Message"
                  className="block w-full resize-y border-0 bg-ev-surface p-3.5 text-sm leading-[1.7] text-ev-ink outline-none"
                />
                <div className="border-t border-ev-line bg-ev-soft px-3.5 py-2.5 text-[13px] leading-[1.7] text-ev-ink2">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ev-muted">Aperçu</span>
                  <Preview text={t.body} />
                </div>
              </div>
            </div>
            <Field label="Texte du bouton">
              <EvInput h={42} maxLength={60} value={t.cta} onChange={(e) => setT({ cta: e.target.value })} className="font-normal" />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ev-line pt-3.5">
              <button type="button" onClick={() => setT({ ...DEFAULT_MESSAGES[active], enabled: t.enabled })} className="p-0 text-[13px] text-ev-muted hover:text-ev-ink">
                Rétablir le texte par défaut
              </button>
              <div className="flex gap-2">
                <EvButton size="sm" className="h-[38px]" disabled={test.isPending} onClick={() => void sendTest()}>
                  {test.isPending ? "Envoi…" : "M'envoyer un test"}
                </EvButton>
                <EvButton size="sm" variant="primary" className="h-[38px] px-4" disabled={!dirty || save.isPending} onClick={() => void submit()}>
                  {save.isPending ? "Enregistrement…" : "Enregistrer"}
                </EvButton>
              </div>
            </div>
          </fieldset>
        </div>
      </SettingsCard>
    </>
  );
}

// ---------- Sécurité des billets ----------

export function SettingsSecurity() {
  const rows: [string, string][] = [
    ["QR code signé, unique par billet", "Chaque billet porte une signature numérique vérifiée au scan : un QR recopié ou inventé est refusé."],
    ["Une seule entrée par billet", "Un billet déjà scanné est signalé et refusé à l'entrée."],
    ["Accès au scanner contrôlé", "Seuls l'organisateur, les managers et les scanners de votre équipe (limités à leurs événements) peuvent valider des billets."],
  ];
  return (
    <>
      <SettingsHeading title="Sécurité des billets" sub="Les protections appliquées à tous vos billets et pass." />
      <SettingsCard>
        {rows.map(([title, desc], i) => (
          <div key={title} className={cn("flex items-center justify-between gap-4 px-5 py-[18px] sm:px-6", i < rows.length - 1 && "border-b border-ev-line")}>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{title}</span>
              <span className="text-[13px] text-ev-muted">{desc}</span>
            </span>
            <StatePill tone="ok" dot>
              Toujours actif
            </StatePill>
          </div>
        ))}
      </SettingsCard>
    </>
  );
}

// ---------- Mon profil ----------

const ROLE_LABELS: Record<string, string> = { OWNER: "Organisateur (propriétaire)", MANAGER: "Manager", STAFF: "Scanner" };

export function SettingsProfile() {
  const user = useAuthStore((s) => s.user);
  const rows: [string, string | null | undefined][] = [
    ["Nom complet", user?.fullName],
    ["E-mail", user?.email],
    ["Téléphone", user?.phone],
    ["Rôle", user ? (ROLE_LABELS[user.role] ?? user.role) : null],
  ];
  return (
    <>
      <SettingsHeading title="Mon profil" sub="Vos informations de connexion." />
      <SettingsCard>
        <SettingsRow title="Compte" desc="Les identifiants avec lesquels vous vous connectez.">
          <dl className="m-0 grid gap-x-6 gap-y-3.5 text-sm sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5">
                <dt className="text-[13px] text-ev-muted">{k}</dt>
                <dd className="m-0 break-all font-medium">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </SettingsRow>
        <SettingsRow title="Mot de passe" desc="Changez-le régulièrement, surtout s'il a été partagé." last>
          <Link href="/change-password" className="inline-flex h-9 items-center rounded-[10px] border border-ev-border bg-ev-surface px-3.5 text-[13px] font-medium transition-colors hover:bg-ev-soft">
            Changer mon mot de passe
          </Link>
        </SettingsRow>
      </SettingsCard>
    </>
  );
}

import { SubscriptionManager } from "@/components/events/settings/subscription-manager";

// ---------- Abonnement ----------

export const PLAN_LABELS: Record<Tenant["plan"], { label: string; detail: string }> = {
  FREE: { label: "Gratuit", detail: "Billetterie, contrôle d'accès, attestations et site vitrine." },
  STANDARD: { label: "Standard", detail: "Pour une activité en croissance." },
  PRO: { label: "Pro", detail: "Domaine personnalisé, fonctionnalités avancées et IA." },
  ENTERPRISE: { label: "Entreprise", detail: "Multi-organisations et accompagnement dédié." },
};

export function SettingsPlan({ tenant }: { tenant: Tenant }) {
  return <SubscriptionManager tenant={tenant} />;
}

