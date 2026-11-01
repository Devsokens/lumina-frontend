"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Plus } from "lucide-react";
import { useTenantSector } from "@/hooks/useTenantSector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateMember,
  useMembers,
  useResetMemberPassword,
  useUpdateMember,
  type Member,
  type MemberRole,
} from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiError } from "@/lib/api";

const ROLE_LABELS: Record<Member["role"], string> = {
  OWNER: "Propriétaire",
  MANAGER: "Manager",
  STAFF: "Équipe / contrôle",
  KITCHEN: "Cuisine",
  CASHIER: "Caisse",
};
// Événementiel (spec V1) : Organisateur, Manager, Scanner.
export const EVENT_ROLE_LABELS: Record<Member["role"], string> = {
  ...ROLE_LABELS,
  OWNER: "Organisateur",
  MANAGER: "Manager",
  STAFF: "Scanner",
};
const MEMBER_ROLES: MemberRole[] = ["MANAGER", "STAFF", "KITCHEN", "CASHIER"];

function rolesFor(sector: string | undefined): MemberRole[] {
  if (sector === "restaurant") return MEMBER_ROLES;
  // Événementiel : pas de caisse ni de cuisine (paiement en ligne, scan).
  if (sector === "event") return ["MANAGER", "STAFF"];
  return MEMBER_ROLES.filter((r) => r !== "KITCHEN");
}
const STRONG = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// Mot de passe temporaire lisible, communiqué par l'OWNER au membre (qui
// doit le changer à sa première connexion).
function generatePassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const body = Array.from(bytes, (b) => "abcdefghjkmnpqrstuvwxyz23456789"[b % 31]).join("");
  return `G${body}${(bytes[0] % 90) + 10}`;
}

// Équipe (docs/API_CONTRACT.md §11) : lecture OWNER/MANAGER, écriture OWNER.
export function TeamManager() {
  const role = useAuthStore((s) => s.user?.role);
  const isOwner = role === "OWNER";
  const canRead = isOwner || role === "MANAGER";
  // Rôles proposés selon le métier (Cuisine : restauration uniquement).
  const { sector } = useTenantSector();
  const roles = rolesFor(sector);
  const labels = sector === "event" ? EVENT_ROLE_LABELS : ROLE_LABELS;
  const { data: members, isLoading, isError } = useMembers(canRead);
  const create = useCreateMember();
  const update = useUpdateMember();
  const reset = useResetMemberPassword();
  const [form, setForm] = useState<{ open: boolean; fullName: string; contact: string; role: MemberRole; password: string }>(
    { open: false, fullName: "", contact: "", role: "STAFF", password: "" }
  );
  const [shownPassword, setShownPassword] = useState<{ name: string; password: string } | null>(null);

  if (!canRead) {
    return <p className="text-sm text-muted-foreground">La gestion de l&apos;équipe est réservée au propriétaire et aux managers.</p>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const contact = form.contact.trim();
    const isEmail = contact.includes("@");
    const phone = contact.replace(/[\s.()-]/g, "");
    if (form.fullName.trim().length < 2 || !contact || (!isEmail && !/^\+?[0-9]{8,15}$/.test(phone))) {
      toast.error("Nom et e-mail ou téléphone valides requis.");
      return;
    }
    if (!STRONG.test(form.password)) {
      toast.error("Mot de passe : 8 caractères, une majuscule, un chiffre.");
      return;
    }
    try {
      await create.mutateAsync({
        fullName: form.fullName.trim(),
        ...(isEmail ? { email: contact } : { phone }),
        role: form.role,
        temporaryPassword: form.password,
      });
      setShownPassword({ name: form.fullName.trim(), password: form.password });
      setForm({ open: false, fullName: "", contact: "", role: "STAFF", password: "" });
    } catch (err) {
      toast.error(apiError(err, "Création impossible (e-mail ou téléphone déjà utilisé ?)"));
    }
  }

  async function setActive(m: Member, isActive: boolean) {
    try {
      await update.mutateAsync({ id: m.id, isActive });
      toast.success(isActive ? "Membre réactivé" : "Membre désactivé (sessions fermées)");
    } catch (err) {
      toast.error(apiError(err, "Mise à jour impossible"));
    }
  }

  async function changeRole(m: Member, newRole: MemberRole) {
    try {
      await update.mutateAsync({ id: m.id, role: newRole });
      toast.success("Rôle modifié");
    } catch (err) {
      toast.error(apiError(err, "Mise à jour impossible"));
    }
  }

  async function resetPassword(m: Member) {
    if (!window.confirm(`Réinitialiser le mot de passe de ${m.fullName ?? "ce membre"} ? Ses sessions seront fermées.`)) return;
    const password = generatePassword();
    try {
      await reset.mutateAsync({ id: m.id, temporaryPassword: password });
      setShownPassword({ name: m.fullName ?? "", password });
    } catch (err) {
      toast.error(apiError(err, "Réinitialisation impossible"));
    }
  }

  return (
    <div className="space-y-4">
      {isOwner && (
        <Button onClick={() => setForm((f) => ({ ...f, open: true, password: generatePassword() }))}>
          <Plus className="size-4" />
          Ajouter un membre
        </Button>
      )}

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger l&apos;équipe.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {(members ?? []).map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="font-medium">
                  {m.fullName ?? "—"} {!m.isActive && <Badge variant="outline">Désactivé</Badge>}{" "}
                  {m.mustChangePassword && <Badge variant="outline">Mot de passe temporaire</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {m.email ?? m.phone} · dernière connexion{" "}
                  {m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleDateString("fr-FR") : "jamais"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isOwner && m.role !== "OWNER" ? (
                  <>
                    <select
                      aria-label="Rôle"
                      value={m.role}
                      onChange={(e) => void changeRole(m, e.target.value as MemberRole)}
                      className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {labels[r]}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" variant="outline" onClick={() => void setActive(m, !m.isActive)}>
                      {m.isActive ? "Désactiver" : "Réactiver"}
                    </Button>
                    <Button size="sm" variant="ghost" aria-label="Réinitialiser le mot de passe" onClick={() => void resetPassword(m)}>
                      <KeyRound className="size-4" />
                    </Button>
                  </>
                ) : (
                  <Badge variant="secondary">{labels[m.role]}</Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={form.open} onOpenChange={(open) => setForm((f) => ({ ...f, open }))}>
        <DialogContent>
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Nouveau membre</DialogTitle>
              <DialogDescription>
                Communiquez-lui le mot de passe temporaire : il devra le changer à sa première connexion.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="m-name">Nom complet</Label>
              <Input id="m-name" value={form.fullName} maxLength={120} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-contact">E-mail ou téléphone (identifiant de connexion)</Label>
              <Input id="m-contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-role">Rôle</Label>
              <select
                id="m-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as MemberRole })}
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {labels[r]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-password">Mot de passe temporaire</Label>
              <Input id="m-password" className="font-mono" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Création…" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={shownPassword !== null} onOpenChange={(o) => !o && setShownPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mot de passe temporaire</DialogTitle>
            <DialogDescription>
              À transmettre à {shownPassword?.name}. Il ne sera plus affiché ensuite.
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-xl bg-muted p-3 text-center font-mono text-lg">{shownPassword?.password}</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                void navigator.clipboard?.writeText(shownPassword?.password ?? "");
                toast.success("Copié");
              }}
            >
              Copier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
