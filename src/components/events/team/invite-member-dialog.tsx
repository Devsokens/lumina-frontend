"use client";

import { useState, type ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { toast } from "sonner";
import { Copy, Plus, Send, UserPlus, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EvButton, EvInput, EV_PORTAL } from "@/components/events/ev-ui";
import { generatePassword } from "@/components/dashboard/team-manager";
import { useCreateMember, type MemberRole } from "@/hooks/useAdmin";
import { useAdminEvents } from "@/hooks/useEvents";
import { apiError } from "@/lib/api";
import { APP_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

// « Inviter un membre » (refonte Claude Design 2026-11, écran 22).
// Deux façons de donner l'accès (POST /admin/users) :
// - lien d'invitation (7 jours, usage unique) : le membre choisit son mot de
//   passe ; à partager par WhatsApp, et envoyé par e-mail si l'adresse est connue ;
// - mot de passe temporaire, à transmettre soi-même.
// Scanner : événements accessibles (vide = tous), appliqués par le serveur.

export type Credentials =
  | { mode: "password"; name: string; login: string; password: string; reset?: boolean }
  | { mode: "link"; name: string; login: string; inviteUrl: string; phone?: string; email?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Numéro saisi sans indicatif : +241 ajouté ; le 0 national initial d'un
// numéro à 9 chiffres (077 12 34 56) est retiré.
function toPhone(raw: string) {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (trimmed.startsWith("00")) return `+${digits.slice(2)}`;
  return `+241${digits.length === 9 && digits.startsWith("0") ? digits.slice(1) : digits}`;
}

const ROLES: { value: MemberRole | "OWNER"; name: string; desc: string; locked?: string }[] = [
  {
    value: "OWNER",
    name: "Organisateur",
    desc: "Accès complet : événements, recettes, équipe et paramètres.",
    locked: "Titulaire du compte",
  },
  { value: "MANAGER", name: "Manager", desc: "Événements, réservations, remboursements et attestations." },
  { value: "STAFF", name: "Scanner", desc: "Contrôle d'accès uniquement, sur un écran de scan simplifié." },
];

// Cadre commun des fenêtres du module : voile vert sombre flouté, carte
// blanche arrondie (20 px) en haut de l'écran.
export function EvDialog({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  width = 600,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  footer: ReactNode;
  children: ReactNode;
  width?: number;
  onSubmit?: (e: React.FormEvent) => void;
}) {
  const Body = onSubmit ? "form" : "div";
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(12,22,18,.45)] backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          style={{ width }}
          className={cn(
            EV_PORTAL,
            "fixed left-1/2 top-4 z-50 flex max-h-[calc(100dvh-32px)] max-w-[calc(100%-32px)] -translate-x-1/2 flex-col overflow-hidden rounded-[20px] bg-ev-surface text-ev-ink shadow-[0_30px_80px_rgba(12,22,18,.3)] outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:top-16 sm:max-h-[calc(100dvh-96px)]"
          )}
        >
          <Body onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col" noValidate={onSubmit ? true : undefined}>
            <div className="flex items-start justify-between gap-4 border-b border-ev-line px-5 pb-[18px] pt-[22px] sm:px-6">
              <div className="flex flex-col gap-1">
                <DialogPrimitive.Title className="m-0 text-[19px] font-semibold">{title}</DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-[13px] text-ev-muted">{description}</DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close
                aria-label="Fermer"
                className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#F1EFE9] text-ev-ink2 transition-colors hover:bg-ev-border dark:bg-ev-line"
              >
                <X className="size-4" />
              </DialogPrimitive.Close>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-[22px] sm:px-6">{children}</div>
            <div className="flex justify-end gap-2 border-t border-ev-line bg-ev-soft px-5 py-4 sm:px-6">{footer}</div>
          </Body>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// Carte de choix (radio) du design : bordure verte 1,5 px et fond menthe
// pâle une fois choisie.
function ChoiceCard({
  name,
  checked,
  disabled,
  onSelect,
  children,
  dot = true,
}: {
  name: string;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <label
      className={cn(
        "relative flex items-start gap-3 rounded-[12px] px-3.5 py-3 transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ev-mint",
        checked ? "border-[1.5px] border-ev-primary bg-ev-selected" : "border border-ev-border bg-ev-surface",
        disabled ? "cursor-not-allowed" : "cursor-pointer hover:border-ev-dash"
      )}
    >
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onSelect} className="absolute size-px opacity-0" />
      {dot && (
        <span
          aria-hidden
          className={cn(
            "mt-0.5 size-[18px] shrink-0 rounded-full bg-white",
            checked ? "border-[5px] border-ev-primary" : "border-[1.5px] border-ev-dash",
            disabled && "opacity-50"
          )}
        />
      )}
      <span className={cn("flex min-w-0 flex-1 flex-col gap-0.5", disabled && "opacity-60")}>{children}</span>
    </label>
  );
}

// Événements accessibles : pastilles + « Ajouter ». Vide = tous.
export function EventScopePicker({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const { data: events } = useAdminEvents();
  const list = (events ?? []).slice().sort((a, b) => b.startDate.localeCompare(a.startDate));
  const chosen = list.filter((e) => value.includes(e.id));
  const rest = list.filter((e) => !value.includes(e.id));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {chosen.length === 0 ? (
          <span className="flex h-8 items-center rounded-full bg-ev-mint px-3 text-[13px] font-medium text-ev-primary">Tous les événements</span>
        ) : (
          chosen.map((e) => (
            <span key={e.id} className="flex h-8 max-w-full items-center gap-2 rounded-full bg-ev-mint pl-3 pr-1.5 text-[13px] font-medium text-ev-primary">
              <span className="truncate">{e.title}</span>
              <button
                type="button"
                aria-label={`Retirer ${e.title}`}
                onClick={() => onChange(value.filter((id) => id !== e.id))}
                className="flex size-[22px] shrink-0 items-center justify-center rounded-full hover:bg-white/60"
              >
                <X className="size-3" />
              </button>
            </span>
          ))
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={rest.length === 0}
              className="flex h-8 items-center gap-1 rounded-full border border-dashed border-ev-dash bg-ev-surface px-3 text-[13px] text-ev-ink2 disabled:opacity-50"
            >
              <Plus className="size-3.5" /> Ajouter
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={cn(EV_PORTAL, "max-h-72 w-72 overflow-y-auto rounded-xl")}>
            {rest.map((e) => (
              <DropdownMenuItem key={e.id} onClick={() => onChange([...value, e.id])} className="flex flex-col items-start gap-0">
                <span className="truncate text-[13px] font-medium">{e.title}</span>
                <span className="text-xs text-ev-muted">{new Date(e.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <span className="text-xs text-ev-muted">
        {chosen.length === 0 ? "Sans sélection, le scanner voit tous vos événements." : "Le scanner ne verra que ces événements dans son application."}
      </span>
    </div>
  );
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (c: Credentials) => void;
}) {
  const create = useCreateMember();
  const [fullName, setFullName] = useState("");
  const [idType, setIdType] = useState<"email" | "phone">("phone");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<MemberRole>("STAFF");
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [mode, setMode] = useState<"link" | "password">("link");

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setFullName("");
      setEmail("");
      setPhone("");
      setRole("STAFF");
      setEventIds([]);
      setMode("link");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = fullName.trim();
    if (name.length < 2) return void toast.error("Indiquez le nom complet du membre.");
    const login = idType === "email" ? email.trim().toLowerCase() : toPhone(phone);
    if (idType === "email" && !EMAIL.test(login)) return void toast.error("Adresse e-mail invalide.");
    if (idType === "phone" && !/^\+[0-9]{8,15}$/.test(login)) return void toast.error("Numéro de téléphone invalide (ex. 77 12 34 56).");
    const password = mode === "password" ? generatePassword() : undefined;
    try {
      const member = await create.mutateAsync({
        fullName: name,
        ...(idType === "email" ? { email: login } : { phone: login }),
        role,
        ...(mode === "link" ? { invite: true } : { temporaryPassword: password }),
        ...(role === "STAFF" && eventIds.length ? { eventIds } : {}),
      });
      if (mode === "link" && member?.inviteUrl) {
        onCreated({ mode: "link", name, login, inviteUrl: member.inviteUrl, ...(idType === "phone" ? { phone: login } : { email: login }) });
      } else {
        onCreated({ mode: "password", name, login, password: password ?? "" });
      }
      close(false);
    } catch (err) {
      toast.error(apiError(err, idType === "email" ? "Création impossible (e-mail déjà utilisé ?)" : "Création impossible (numéro déjà utilisé ?)"));
    }
  }

  return (
    <EvDialog
      open={open}
      onOpenChange={close}
      onSubmit={submit}
      title="Inviter un membre"
      description={mode === "link" ? "Il recevra un lien pour créer son mot de passe." : "Vous lui transmettrez son identifiant et un mot de passe temporaire."}
      footer={
        <>
          <EvButton size="lg" className="h-[42px] px-4" onClick={() => close(false)}>
            Annuler
          </EvButton>
          <EvButton type="submit" variant="primary" size="lg" className="h-[42px]" disabled={create.isPending}>
            {mode === "link" ? <Send /> : <UserPlus />}
            {create.isPending ? "Création…" : mode === "link" ? "Envoyer l'invitation" : "Créer l'accès"}
          </EvButton>
        </>
      }
    >
      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        Nom complet
        <EvInput h={42} value={fullName} maxLength={120} autoComplete="off" placeholder="Ex. : Marc Ondimba" onChange={(e) => setFullName(e.target.value)} className="font-normal" />
      </label>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium" id="inv-login">
            Identifiant de connexion
          </span>
          <div role="radiogroup" aria-labelledby="inv-login" className="flex rounded-[8px] bg-[#F1EFE9] p-0.5 dark:bg-ev-line">
            {(
              [
                ["email", "E-mail"],
                ["phone", "Téléphone"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={idType === v}
                onClick={() => setIdType(v)}
                className={cn(
                  "h-[26px] rounded-[6px] px-2.5 text-xs transition-colors",
                  idType === v ? "bg-ev-surface font-semibold text-ev-ink shadow-[0_1px_2px_rgba(22,33,28,.08)]" : "text-ev-ink3 hover:text-ev-ink"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {idType === "phone" ? (
          <span className="flex h-[42px] overflow-hidden rounded-[10px] border border-ev-border focus-within:border-ev-primary focus-within:shadow-[0_0_0_3px_var(--ev-mint)]">
            <span className="flex items-center border-r border-ev-border bg-ev-soft px-3 text-sm text-ev-ink2">+241</span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="off"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 00 00 00"
              aria-label="Numéro de téléphone"
              className="min-w-0 flex-1 border-0 bg-ev-surface px-3 text-sm text-ev-ink outline-none placeholder:text-ev-muted"
            />
          </span>
        ) : (
          <EvInput h={42} type="email" inputMode="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="marc@exemple.com" aria-label="Adresse e-mail" />
        )}
      </div>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2 p-0 text-[13px] font-medium">Rôle</legend>
        <div role="radiogroup" className="flex flex-col gap-2">
          {ROLES.map((r) => (
            <ChoiceCard key={r.value} name="role" checked={role === r.value} disabled={!!r.locked} onSelect={() => r.value !== "OWNER" && setRole(r.value)}>
              <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                {r.name}
                {r.locked && (
                  <span className="inline-flex h-5 items-center rounded-full bg-ev-line px-2 text-[11px] font-semibold text-ev-muted" title="Un seul organisateur par compte : celui qui l'a créé.">
                    {r.locked}
                  </span>
                )}
              </span>
              <span className="text-[13px] text-ev-muted">{r.desc}</span>
            </ChoiceCard>
          ))}
        </div>
      </fieldset>

      {role === "STAFF" && (
        <div className="flex flex-col gap-2 rounded-[12px] border border-ev-line bg-ev-soft p-3.5">
          <span className="text-[13px] font-medium">Événements accessibles</span>
          <EventScopePicker value={eventIds} onChange={setEventIds} />
        </div>
      )}

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2 p-0 text-[13px] font-medium">Envoi des accès</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <ChoiceCard name="acces" checked={mode === "link"} dot={false} onSelect={() => setMode("link")}>
            <span className="text-sm font-semibold">Lien d&apos;invitation</span>
            <span className="text-xs text-ev-muted">Par WhatsApp ou e-mail · conseillé</span>
          </ChoiceCard>
          <ChoiceCard name="acces" checked={mode === "password"} dot={false} onSelect={() => setMode("password")}>
            <span className="text-sm font-semibold">Mot de passe temporaire</span>
            <span className="text-xs text-ev-muted">À transmettre vous-même</span>
          </ChoiceCard>
        </div>
      </fieldset>
    </EvDialog>
  );
}

// Accès créé : lien d'invitation (à partager) ou mot de passe temporaire
// (affiché une seule fois), après création ou réinitialisation.
export function CredentialsDialog({ credentials, onClose }: { credentials: Credentials | null; onClose: () => void }) {
  const loginUrl = `${APP_URL}/login`;
  const c = credentials;
  const link = c?.mode === "link";

  function copy(text: string, done = "Copié") {
    navigator.clipboard?.writeText(text).then(
      () => toast.success(done),
      () => toast.error("Copie impossible")
    );
  }

  const shareText = c?.mode === "link" ? `Bonjour ${c.name}, voici votre invitation à rejoindre notre équipe sur GiyaX : ${c.inviteUrl}` : "";
  const whatsapp = c?.mode === "link" ? `https://wa.me/${(c.phone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(shareText)}` : "";

  return (
    <EvDialog
      open={c !== null}
      onOpenChange={(o) => !o && onClose()}
      width={480}
      title={link ? "Invitation prête" : c?.mode === "password" && c.reset ? "Mot de passe réinitialisé" : "Accès créé"}
      description={
        link ? (
          <>Envoyez ce lien à {c?.name || "ce membre"} : il choisira son mot de passe. Valable 7 jours, une seule fois.</>
        ) : (
          <>À transmettre à {c?.name || "ce membre"}. Ce mot de passe ne sera plus affiché.</>
        )
      }
      footer={
        c?.mode === "link" ? (
          <>
            <EvButton size="lg" className="h-[42px]" onClick={() => copy(c.inviteUrl, "Lien copié")}>
              <Copy /> Copier le lien
            </EvButton>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex h-[42px] items-center gap-2 rounded-[10px] bg-ev-primary px-[18px] text-sm font-semibold text-white hover:bg-ev-primary-hover">
              <Send className="size-4" /> WhatsApp
            </a>
          </>
        ) : (
          <>
            <EvButton
              size="lg"
              className="h-[42px]"
              onClick={() =>
                c &&
                c.mode === "password" &&
                copy(
                  `Vos accès GiyaX\nConnexion : ${loginUrl}\nIdentifiant : ${c.login}\nMot de passe temporaire : ${c.password}\nVous choisirez votre mot de passe à la première connexion.`,
                  "Accès copiés"
                )
              }
            >
              <Copy /> Copier les accès
            </EvButton>
            <EvButton variant="primary" size="lg" className="h-[42px]" onClick={onClose}>
              Terminé
            </EvButton>
          </>
        )
      }
    >
      {c?.mode === "link" ? (
        <div className="flex flex-col gap-3 text-[13px]">
          <div className="flex flex-col gap-1">
            <span className="text-ev-muted">Lien d&apos;invitation</span>
            <span className="break-all rounded-[10px] border border-ev-line bg-ev-soft p-3 font-ev-mono text-xs">{c.inviteUrl}</span>
          </div>
          <span className="text-ev-muted">
            Identifiant de connexion : <b className="text-ev-ink">{c.login}</b>
            {c.email && " · le lien lui est aussi envoyé par e-mail."}
          </span>
        </div>
      ) : (
        <>
          <dl className="m-0 flex flex-col gap-3 text-[13px]">
            {[
              ["Adresse de connexion", loginUrl],
              ["Identifiant", c?.login ?? ""],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1">
                <dt className="text-ev-muted">{k}</dt>
                <dd className="m-0 break-all font-medium">{v}</dd>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <dt className="text-ev-muted">Mot de passe temporaire</dt>
              <dd className="m-0 rounded-[10px] border border-ev-line bg-ev-soft p-3 text-center font-ev-mono text-lg tracking-wider">{c?.mode === "password" ? c.password : ""}</dd>
            </div>
          </dl>
          <p className="m-0 text-xs text-ev-muted">Le membre choisira son propre mot de passe à sa première connexion.</p>
        </>
      )}
    </EvDialog>
  );
}
