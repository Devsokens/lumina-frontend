"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarRange, Check, KeyRound, Link2, MoreHorizontal, Plus, Search, Shield, UserRoundCheck, UserRoundX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EvButton, EvCard, EvPill, EvSegmented, EV_PORTAL, initialsOf } from "@/components/events/ev-ui";
import { CredentialsDialog, EvDialog, EventScopePicker, InviteMemberDialog, type Credentials } from "@/components/events/team/invite-member-dialog";
import { useAdminEvents } from "@/hooks/useEvents";
import { generatePassword } from "@/components/dashboard/team-manager";
import { useMembers, useResendInvite, useResetMemberPassword, useUpdateMember, type Member, type MemberRole } from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiError } from "@/lib/api";
import { cn } from "@/lib/utils";

// Équipe du back-office événementiel (refonte Claude Design 2026-11, écrans
// 21 et 22) : membres, filtres, invitation, matrice des rôles.
// API : docs/API_CONTRACT.md §11 (lecture OWNER/MANAGER, écriture OWNER).

const ROLE_PILL: Record<Member["role"], { label: string; tone: string }> = {
  OWNER: { label: "Propriétaire", tone: "bg-ev-mint text-ev-primary" },
  MANAGER: { label: "Manager", tone: "bg-ev-mint text-ev-primary" },
  STAFF: { label: "Scanner", tone: "bg-ev-line text-ev-ink2" },
  KITCHEN: { label: "Cuisine", tone: "bg-ev-line text-ev-ink2" },
  CASHIER: { label: "Caisse", tone: "bg-ev-line text-ev-ink2" },
};

// Ce que le serveur autorise réellement à chaque rôle (contrôleurs admin du
// backend, 2026-11). Organisateur = OWNER, Manager = MANAGER, Scanner = STAFF.
const PERMISSIONS: [string, boolean, boolean, boolean][] = [
  ["Créer et modifier des événements", true, true, false],
  ["Supprimer un événement", true, true, false],
  ["Voir les participants et les réservations", true, true, false],
  ["Rembourser un billet", true, true, false],
  ["Envoyer les attestations", true, true, false],
  ["Scanner les billets à l’entrée", true, true, true],
  ["Voir les recettes et les statistiques", true, true, false],
  ["Modifier le site vitrine", true, true, false],
  ["Gérer l’équipe et les paramètres", true, false, false],
];

type Filter = "all" | "active" | "pending";

// Invitation en attente : lien pas encore utilisé, ou mot de passe
// temporaire jamais changé (aucune connexion).
const isPending = (m: Member) => m.invitePending || (m.mustChangePassword && !m.lastLoginAt);

function lastSeen(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86_400_000);
  if (diff === 0) return `Aujourd'hui, ${time}`;
  if (diff === 1) return `Hier, ${time}`;
  const date = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", ...(d.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }) });
  return `${date}, ${time}`;
}

export function EventTeam() {
  const me = useAuthStore((s) => s.user);
  const isOwner = me?.role === "OWNER";
  const canRead = isOwner || me?.role === "MANAGER";
  const { data, isLoading, isError } = useMembers(canRead);
  const update = useUpdateMember();
  const reset = useResetMemberPassword();
  const resend = useResendInvite();
  const { data: events } = useAdminEvents();
  const titles = new Map((events ?? []).map((e) => [e.id, e.title]));
  const [scopeFor, setScopeFor] = useState<{ member: Member; ids: string[] } | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [shown, setShown] = useState<Credentials | null>(null);

  const members = useMemo(() => {
    const list = [...(data ?? [])];
    // Le propriétaire d'abord, puis par nom.
    return list.sort((a, b) => Number(b.role === "OWNER") - Number(a.role === "OWNER") || (a.fullName ?? "").localeCompare(b.fullName ?? "", "fr"));
  }, [data]);
  const counts = {
    all: members.length,
    active: members.filter((m) => m.isActive && !isPending(m)).length,
    pending: members.filter(isPending).length,
  };
  const q = query.trim().toLowerCase();
  const rows = members
    .filter((m) => (filter === "all" ? true : filter === "active" ? m.isActive && !isPending(m) : isPending(m)))
    .filter((m) => !q || [m.fullName, m.email, m.phone].some((v) => v?.toLowerCase().includes(q)));
  const alone = !isLoading && !isError && members.length <= 1;

  async function setActive(m: Member, isActive: boolean) {
    try {
      await update.mutateAsync({ id: m.id, isActive });
      toast.success(isActive ? "Accès réactivé" : "Accès désactivé (sessions fermées)");
    } catch (err) {
      toast.error(apiError(err, "Mise à jour impossible"));
    }
  }

  async function changeRole(m: Member, role: MemberRole) {
    try {
      await update.mutateAsync({ id: m.id, role });
      toast.success(`${m.fullName ?? "Le membre"} est maintenant ${role === "MANAGER" ? "Manager" : "Scanner"}.`);
    } catch (err) {
      toast.error(apiError(err, "Mise à jour impossible"));
    }
  }

  async function resetPassword(m: Member) {
    if (!window.confirm(`Réinitialiser le mot de passe de ${m.fullName ?? "ce membre"} ? Ses sessions seront fermées.`)) return;
    const password = generatePassword();
    try {
      await reset.mutateAsync({ id: m.id, temporaryPassword: password });
      setShown({ mode: "password", name: m.fullName ?? "", login: m.email ?? m.phone ?? "", password, reset: true });
    } catch (err) {
      toast.error(apiError(err, "Réinitialisation impossible"));
    }
  }

  async function resendInvite(m: Member) {
    try {
      const inviteUrl = await resend.mutateAsync(m.id);
      setShown({ mode: "link", name: m.fullName ?? "", login: m.email ?? m.phone ?? "", inviteUrl, ...(m.phone ? { phone: m.phone } : {}) });
    } catch (err) {
      toast.error(apiError(err, "Nouveau lien impossible"));
    }
  }

  async function saveScope() {
    if (!scopeFor) return;
    try {
      await update.mutateAsync({ id: scopeFor.member.id, eventIds: scopeFor.ids });
      toast.success(scopeFor.ids.length ? "Événements accessibles mis à jour" : "Accès à tous les événements");
      setScopeFor(null);
    } catch (err) {
      toast.error(apiError(err, "Mise à jour impossible"));
    }
  }

  function accessLabel(m: Member) {
    if (m.role !== "STAFF" || !m.eventIds?.length) return m.role === "STAFF" ? "Contrôle d'accès, tous les événements" : "Tous les événements";
    const names = m.eventIds.map((id) => titles.get(id)).filter(Boolean) as string[];
    if (!names.length) return `${m.eventIds.length} événement${m.eventIds.length > 1 ? "s" : ""}`;
    return names.length > 1 ? `${names[0]} + ${names.length - 1}` : names[0];
  }

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 pb-16 pt-6 sm:px-8 sm:pt-9">
      <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[24px] font-semibold tracking-[-0.02em] sm:text-[28px]">Équipe</h1>
          <p className="m-0 text-sm text-ev-muted sm:text-[15px]">Invitez vos collaborateurs et choisissez ce que chacun peut faire.</p>
        </div>
        {isOwner && (
          <EvButton variant="primary" className="ml-auto h-[42px] px-[18px] text-sm sm:ml-0" onClick={() => setInviteOpen(true)}>
            <Plus /> Inviter un membre
          </EvButton>
        )}
      </div>

      {!canRead ? (
        <EvCard className="p-6 text-sm text-ev-muted">La gestion de l&apos;équipe est réservée à l&apos;organisateur et aux managers.</EvCard>
      ) : (
        <EvCard className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ev-line px-4 py-3.5 sm:px-5">
            <EvSegmented<Filter>
              size="sm"
              ariaLabel="Filtrer"
              value={filter}
              onChange={setFilter}
              items={[
                { value: "all", label: "Tous", count: counts.all },
                { value: "active", label: "Actifs", count: counts.active },
                { value: "pending", label: "Invitations", count: counts.pending },
              ]}
            />
            <label className="flex h-9 w-full items-center gap-2 rounded-[10px] border border-ev-border px-3 text-ev-muted focus-within:border-ev-primary sm:w-[260px]">
              <Search className="size-4 shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un membre"
                aria-label="Rechercher un membre"
                className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-ev-ink outline-none placeholder:text-ev-muted"
              />
            </label>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-5">
              {[0, 1].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-[10px] bg-ev-line" />
              ))}
            </div>
          ) : isError ? (
            <p className="p-5 text-sm text-ev-danger">Impossible de charger l&apos;équipe.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-ev-soft text-left text-xs text-ev-muted">
                  <th className="px-4 py-[11px] font-medium sm:px-5">Membre</th>
                  <th className="hidden px-2 py-[11px] font-medium sm:table-cell">Rôle</th>
                  <th className="hidden px-2 py-[11px] font-medium lg:table-cell">Accès</th>
                  <th className="hidden px-2 py-[11px] font-medium md:table-cell">Dernière connexion</th>
                  <th className="w-10 px-4 py-[11px] sm:px-5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr className="border-t border-ev-line">
                    <td colSpan={5} className="px-5 py-8 text-center text-[13px] text-ev-muted">
                      {q ? <>Aucun membre ne correspond à « {query.trim()} ».</> : filter === "pending" ? "Aucune invitation en attente." : "Aucun membre."}
                    </td>
                  </tr>
                )}
                {rows.map((m) => {
                  const self = m.id === me?.id;
                  const pill = ROLE_PILL[m.role];
                  const seen = lastSeen(m.lastLoginAt);
                  return (
                    <tr key={m.id} className={cn("border-t border-ev-line", !m.isActive && "opacity-60")}>
                      <td className="px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-ev-primary text-[13px] font-semibold text-white">
                            {initialsOf(m.fullName || m.email || m.phone || "?")}
                          </span>
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate font-semibold">
                              {m.fullName ?? "—"} {self && <span className="font-normal text-ev-muted">(vous)</span>}
                              {!m.isActive && <EvPill tone="neutral" className="ml-2 h-5 align-middle text-[11px]">Désactivé</EvPill>}
                            </span>
                            <span className="truncate text-[13px] text-ev-muted">{m.email ?? m.phone}</span>
                            <span className={cn("mt-1 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:hidden", pill.tone)}>{pill.label}</span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-2 py-4 sm:table-cell">
                        <span className={cn("inline-flex h-[26px] items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold", pill.tone)}>
                          {m.role === "OWNER" && <Shield className="size-3.5" strokeWidth={2.2} />}
                          {pill.label}
                        </span>
                      </td>
                      <td className="hidden px-2 py-4 text-[13px] text-ev-ink2 lg:table-cell">
                        {accessLabel(m)}
                      </td>
                      <td className="hidden px-2 py-4 text-[13px] text-ev-ink2 md:table-cell">
                        {seen ?? (m.invitePending ? <span className="text-ev-gold-text">Invitation envoyée</span> : isPending(m) ? <span className="text-ev-gold-text">En attente de première connexion</span> : "Jamais connecté")}
                      </td>
                      <td className="px-4 py-4 text-right sm:px-5">
                        {(self || (isOwner && m.role !== "OWNER")) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                aria-label={`Actions pour ${m.fullName ?? "ce membre"}`}
                                className="inline-flex size-8 items-center justify-center rounded-[8px] text-ev-ink2 transition-colors hover:bg-ev-line"
                              >
                                <MoreHorizontal className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className={cn(EV_PORTAL, "w-60 rounded-xl")}>
                              {self ? (
                                <DropdownMenuItem asChild>
                                  <Link href="/change-password" className="gap-2">
                                    <KeyRound className="size-4" /> Changer mon mot de passe
                                  </Link>
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuLabel className="text-xs font-medium text-ev-muted">Rôle</DropdownMenuLabel>
                                  {(["MANAGER", "STAFF"] as MemberRole[]).map((r) => (
                                    <DropdownMenuItem key={r} className="gap-2" disabled={m.role === r} onClick={() => void changeRole(m, r)}>
                                      <Check className={cn("size-4", m.role === r ? "opacity-100" : "opacity-0")} />
                                      {r === "MANAGER" ? "Manager" : "Scanner"}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                  {m.role === "STAFF" && (
                                    <DropdownMenuItem className="gap-2" onClick={() => setScopeFor({ member: m, ids: m.eventIds ?? [] })}>
                                      <CalendarRange className="size-4" /> Événements accessibles
                                    </DropdownMenuItem>
                                  )}
                                  {m.invitePending && (
                                    <DropdownMenuItem className="gap-2" onClick={() => void resendInvite(m)}>
                                      <Link2 className="size-4" /> Nouveau lien d&apos;invitation
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem className="gap-2" onClick={() => void resetPassword(m)}>
                                    <KeyRound className="size-4" /> Réinitialiser le mot de passe
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className={cn("gap-2", m.isActive && "text-ev-danger focus:text-ev-danger")}
                                    onClick={() => void setActive(m, !m.isActive)}
                                  >
                                    {m.isActive ? <UserRoundX className="size-4" /> : <UserRoundCheck className="size-4" />}
                                    {m.isActive ? "Désactiver l'accès" : "Réactiver l'accès"}
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {alone && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ev-line bg-ev-soft p-4 sm:flex-nowrap sm:p-5">
              <div className="flex items-center gap-3.5">
                <span className="flex shrink-0" aria-hidden>
                  <span className="size-8 rounded-full border-2 border-ev-soft bg-ev-mint" />
                  <span className="-ml-2.5 size-8 rounded-full border-2 border-ev-soft bg-[#F1EFE9] dark:bg-ev-line" />
                  <span className="-ml-2.5 size-8 rounded-full border-2 border-ev-soft bg-ev-border" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">Vous êtes seul pour l&apos;instant</span>
                  <span className="text-[13px] text-ev-muted">Ajoutez un manager pour les réservations et des scanners pour l&apos;entrée le jour J.</span>
                </span>
              </div>
              {isOwner && (
                <EvButton className="ml-auto h-[38px] font-semibold sm:ml-0" onClick={() => setInviteOpen(true)}>
                  Inviter
                </EvButton>
              )}
            </div>
          )}
        </EvCard>
      )}

      <EvCard className="overflow-hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ev-line px-4 py-[18px] sm:px-5">
          <h2 className="m-0 text-base font-semibold">Rôles et permissions</h2>
          <span className="text-[13px] text-ev-muted">Ce que chaque rôle peut faire</span>
        </div>
        <table className="w-full border-collapse text-[13px] sm:text-sm">
          <thead>
            <tr className="text-[13px]">
              <th className="w-[40%] px-4 py-4 text-left font-medium text-ev-muted sm:px-5">Action</th>
              {[
                ["Organisateur", "Accès complet"],
                ["Manager", "Opérations"],
                ["Scanner", "Entrée le jour J"],
              ].map(([name, sub]) => (
                <th key={name} className="px-1 py-4 text-center sm:px-2">
                  <span className="flex flex-col items-center gap-0.5">
                    <span className="font-semibold">{name}</span>
                    <span className="hidden text-xs font-normal text-ev-muted sm:block">{sub}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map(([label, ...allowed]) => (
              <tr key={label} className="border-t border-ev-line">
                <td className="px-4 py-[13px] sm:px-5">{label}</td>
                {allowed.map((ok, i) => (
                  <td key={i} className="px-1 py-[13px] text-center sm:px-2">
                    {ok ? (
                      <Check className="inline size-4 text-ev-bar" strokeWidth={2.4} aria-label="Autorisé" />
                    ) : (
                      <span aria-label="Non autorisé" className="text-[#B9B5A9] dark:text-ev-dash">
                        —
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </EvCard>

      {isOwner && (
        <InviteMemberDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          onCreated={(c) => {
            setInviteOpen(false);
            setShown(c);
          }}
        />
      )}
      <CredentialsDialog credentials={shown} onClose={() => setShown(null)} />
      <EvDialog
        open={scopeFor !== null}
        onOpenChange={(o) => !o && setScopeFor(null)}
        width={520}
        title="Événements accessibles"
        description={<>{scopeFor?.member.fullName ?? "Ce scanner"} ne verra et ne pourra scanner que ces événements.</>}
        footer={
          <>
            <button type="button" onClick={() => setScopeFor(null)} className="h-[42px] rounded-[10px] border border-ev-border bg-ev-surface px-4 text-sm font-medium">
              Annuler
            </button>
            <button type="button" onClick={() => void saveScope()} disabled={update.isPending} className="h-[42px] rounded-[10px] bg-ev-primary px-[18px] text-sm font-semibold text-white disabled:opacity-60">
              Enregistrer
            </button>
          </>
        }
      >
        {scopeFor && <EventScopePicker value={scopeFor.ids} onChange={(ids) => setScopeFor({ ...scopeFor, ids })} />}
      </EvDialog>
    </div>
  );
}
