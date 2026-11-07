"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Check, ChevronRight, Building2, Plus, Sparkles, Trash2, Upload, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { EV_PORTAL, initialsOf } from "@/components/events/ev-ui";
import { useAuth } from "@/hooks/useAuth";
import { useMembers } from "@/hooks/useAdmin";
import { useCreateOrganization, type NewOrganization } from "@/hooks/useOrganizations";
import { useTenantSector } from "@/hooks/useTenantSector";
import { useShellStore } from "@/stores/useShellStore";
import { cn } from "@/lib/utils";

const SECTORS = [
  "Concerts & Festivals",
  "Conférences & Séminaires",
  "Sport & Bien-être",
  "Soirées & Spectacles",
  "Formations & Ateliers",
  "Autre",
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewOrganizationDrawer() {
  const open = useShellStore((s) => s.newOrgOpen);
  const setOpen = useShellStore((s) => s.setNewOrgOpen);
  const { user } = useAuth();
  const { tenant } = useTenantSector();
  const { data: currentMembers = [] } = useMembers();
  const createOrg = useCreateOrganization();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [activity, setActivity] = useState(SECTORS[0]);
  const [logoUrl, setLogoUrl] = useState<string>("");

  // Options de reprise depuis l'organisation actuelle
  const [copyPayouts, setCopyPayouts] = useState(true);
  const [copyEmails, setCopyEmails] = useState(true);
  const [copyCertificate, setCopyCertificate] = useState(true);
  const [copySiteTheme, setCopySiteTheme] = useState(true);

  // Membres sélectionnés depuis l'orga courante
  const [selectedMembers, setSelectedMembers] = useState<Record<string, { selected: boolean; role: "MANAGER" | "STAFF" }>>({});

  // Nouveaux invités
  const [newInvites, setNewInvites] = useState<Array<{ id: string; contact: string; role: "MANAGER" | "STAFF" }>>([]);
  const [inviteContact, setInviteContact] = useState("");
  const [inviteRole, setInviteRole] = useState<"MANAGER" | "STAFF">("STAFF");

  const resetForm = () => {
    setStep(1);
    setName("");
    setSlug("");
    setActivity(SECTORS[0]);
    setLogoUrl("");
    setCopyPayouts(true);
    setCopyEmails(true);
    setCopyCertificate(true);
    setCopySiteTheme(true);
    setSelectedMembers({});
    setNewInvites([]);
    setInviteContact("");
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) resetForm();
    setOpen(v);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(val));
    }
  };

  const handleAddInvite = () => {
    const trimmed = inviteContact.trim();
    if (!trimmed) return;
    setNewInvites((prev) => [...prev, { id: Math.random().toString(36).slice(2), contact: trimmed, role: inviteRole }]);
    setInviteContact("");
  };

  const handleRemoveInvite = (id: string) => {
    setNewInvites((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleMemberSelection = (memberId: string, defaultRole?: string) => {
    setSelectedMembers((prev) => {
      const current = prev[memberId];
      if (current?.selected) {
        const copy = { ...prev };
        delete copy[memberId];
        return copy;
      }
      return {
        ...prev,
        [memberId]: {
          selected: true,
          role: defaultRole === "MANAGER" ? "MANAGER" : "STAFF",
        },
      };
    });
  };

  const handleMemberRoleChange = (memberId: string, role: "MANAGER" | "STAFF") => {
    setSelectedMembers((prev) => ({
      ...prev,
      [memberId]: {
        selected: prev[memberId]?.selected ?? true,
        role,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Veuillez saisir le nom de l'organisation");
      setStep(1);
      return;
    }

    const payload: NewOrganization = {
      name: name.trim(),
      slug: (slug.trim() || slugify(name.trim())),
      activity,
      logoUrl: logoUrl || undefined,
      copy: {
        payouts: copyPayouts,
        emails: copyEmails,
        certificate: copyCertificate,
        siteTheme: copySiteTheme,
      },
      members: Object.entries(selectedMembers)
        .filter(([, v]) => v.selected)
        .map(([userId, v]) => ({ userId, role: v.role })),
      invites: newInvites.map((i) => ({ contact: i.contact, role: i.role })),
    };

    try {
      await createOrg.mutateAsync(payload);
      toast.success(`Organisation "${payload.name}" créée avec succès !`);
      handleOpenChange(false);
    } catch {
      toast.error("Impossible de créer l'organisation pour le moment.");
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(12,22,18,.45)] backdrop-blur-[3px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            EV_PORTAL,
            "fixed right-0 top-0 z-50 flex h-full w-full max-w-[560px] flex-col bg-white text-ev-ink shadow-[-10px_0_40px_rgba(0,0,0,0.15)] outline-none duration-300 data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ev-border px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-ev-soft text-ev-primary">
                <Building2 className="size-5" />
              </span>
              <div>
                <DialogPrimitive.Title className="text-base font-bold tracking-tight">
                  Nouvelle organisation
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-xs text-ev-ink2">
                  Étape {step} sur 2 : {step === 1 ? "Identité & Configuration" : "Équipe & Accès"}
                </DialogPrimitive.Description>
              </div>
            </div>
            <DialogPrimitive.Close
              aria-label="Fermer"
              className="flex size-8 items-center justify-center rounded-lg text-ev-ink2 hover:bg-ev-soft hover:text-ev-ink"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          {/* Stepper bar */}
          <div className="flex h-1 w-full bg-ev-soft">
            <div
              className="h-full bg-ev-primary transition-all duration-300"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 1 && (
              <div className="flex flex-col gap-6">
                {/* Logo & Nom */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ev-ink2">
                    Logo de l&apos;organisation
                  </label>
                  <div className="mt-2.5 flex items-center gap-4">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-ev-border bg-ev-soft text-lg font-bold text-ev-primary">
                      {initialsOf(name || "Org")}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-ev-ink2 leading-relaxed">
                        PNG ou JPG, 400×400px recommandé. Sera affiché sur la vitrine et vos billets.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt("URL du logo (ou laissez vide pour les initiales) :");
                          if (url !== null) setLogoUrl(url);
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-ev-primary hover:underline"
                      >
                        <Upload className="size-3.5" />
                        {logoUrl ? "Modifier l'image" : "Ajouter une image"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nom */}
                <div>
                  <label htmlFor="org-name" className="text-xs font-semibold uppercase tracking-wider text-ev-ink2">
                    Nom de l&apos;organisation <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="org-name"
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex. Afro Nation Gabon, TedxLibreville..."
                    className="mt-2 h-11 w-full rounded-xl border border-ev-border bg-white px-3.5 text-sm font-medium outline-none focus:border-ev-primary focus:ring-2 focus:ring-ev-primary/20"
                    autoFocus
                  />
                </div>

                {/* Slug */}
                <div>
                  <label htmlFor="org-slug" className="text-xs font-semibold uppercase tracking-wider text-ev-ink2">
                    Adresse du site vitrine
                  </label>
                  <div className="mt-2 flex items-center rounded-xl border border-ev-border bg-ev-soft px-3.5 focus-within:border-ev-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-ev-primary/20">
                    <span className="text-xs font-medium text-ev-ink2">giya.events/</span>
                    <input
                      id="org-slug"
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      placeholder="nom-organisation"
                      className="h-11 flex-1 bg-transparent px-1.5 text-sm font-medium outline-none"
                    />
                    {slug && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <Check className="size-3" />
                        Valide
                      </span>
                    )}
                  </div>
                </div>

                {/* Secteur */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ev-ink2">
                    Secteur d&apos;activité
                  </label>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {SECTORS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setActivity(s)}
                        className={cn(
                          "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                          activity === s
                            ? "border-ev-primary bg-ev-primary/10 text-ev-primary font-semibold"
                            : "border-ev-border bg-white text-ev-ink2 hover:border-ev-ink2/40 hover:text-ev-ink",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reprise depuis l'organisation active */}
                {tenant && (
                  <div className="rounded-2xl border border-ev-border bg-ev-soft/50 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-ev-primary" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ev-ink">
                        Reprendre depuis {tenant.name}
                      </h4>
                    </div>
                    <p className="mt-1 text-xs text-ev-ink2">
                      Gagnez du temps en dupliquant vos réglages existants dans la nouvelle organisation :
                    </p>

                    <div className="mt-3.5 flex flex-col gap-2.5">
                      <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-ev-ink">
                        <input
                          type="checkbox"
                          checked={copyPayouts}
                          onChange={(e) => setCopyPayouts(e.target.checked)}
                          className="size-4 rounded border-ev-border text-ev-primary focus:ring-ev-primary"
                        />
                        Comptes de paiement (Paystack / Mobile Money)
                      </label>
                      <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-ev-ink">
                        <input
                          type="checkbox"
                          checked={copyEmails}
                          onChange={(e) => setCopyEmails(e.target.checked)}
                          className="size-4 rounded border-ev-border text-ev-primary focus:ring-ev-primary"
                        />
                        Modèles d&apos;e-mails (confirmation, rappels de billets)
                      </label>
                      <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-ev-ink">
                        <input
                          type="checkbox"
                          checked={copyCertificate}
                          onChange={(e) => setCopyCertificate(e.target.checked)}
                          className="size-4 rounded border-ev-border text-ev-primary focus:ring-ev-primary"
                        />
                        Modèle de certificat (signatures, polices, logo)
                      </label>
                      <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-ev-ink">
                        <input
                          type="checkbox"
                          checked={copySiteTheme}
                          onChange={(e) => setCopySiteTheme(e.target.checked)}
                          className="size-4 rounded border-ev-border text-ev-primary focus:ring-ev-primary"
                        />
                        Thème du site vitrine (palette et typographies)
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold text-ev-ink">Membres de l&apos;organisation</h3>
                  <p className="mt-1 text-xs text-ev-ink2">
                    Sélectionnez les membres de <strong>{tenant?.name ?? "votre organisation"}</strong> à intégrer
                    immédiatement.
                  </p>
                </div>

                {/* Membres existants */}
                <div className="flex flex-col divide-y divide-ev-border rounded-xl border border-ev-border">
                  {/* Propriétaire courant (automatiquement inclus) */}
                  <div className="flex items-center justify-between p-3 bg-ev-soft/50">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-ev-primary text-xs font-bold text-white">
                        {initialsOf(user?.fullName ?? "Vous")}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-ev-ink">
                          {user?.fullName ?? "Vous"} <span className="text-[10px] text-ev-ink2">(vous)</span>
                        </p>
                        <p className="text-[11px] text-ev-ink2">{user?.email}</p>
                      </div>
                    </div>
                    <span className="rounded-md bg-ev-soft px-2 py-0.5 text-[11px] font-semibold text-ev-ink2">
                      Organisateur (Créateur)
                    </span>
                  </div>

                  {currentMembers
                    .filter((m) => m.id !== user?.id)
                    .map((m) => {
                      const selected = !!selectedMembers[m.id]?.selected;
                      const role = selectedMembers[m.id]?.role ?? (m.role === "MANAGER" ? "MANAGER" : "STAFF");

                      return (
                        <div key={m.id} className="flex items-center justify-between p-3">
                          <label className="flex flex-1 cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleMemberSelection(m.id, m.role)}
                              className="size-4 rounded border-ev-border text-ev-primary focus:ring-ev-primary"
                            />
                            <span className="flex size-8 items-center justify-center rounded-lg bg-ev-soft text-xs font-bold text-ev-ink">
                              {initialsOf(m.fullName || m.email || "M")}
                            </span>
                            <div>
                              <p className="text-xs font-semibold text-ev-ink">{m.fullName || m.email}</p>
                              <p className="text-[11px] text-ev-ink2">{m.email || m.phone}</p>
                            </div>
                          </label>

                          {selected && (
                            <select
                              value={role}
                              onChange={(e) =>
                                handleMemberRoleChange(m.id, e.target.value as "MANAGER" | "STAFF")
                              }
                              className="rounded-lg border border-ev-border bg-white px-2 py-1 text-xs font-medium text-ev-ink outline-none focus:border-ev-primary"
                            >
                              <option value="MANAGER">Manager</option>
                              <option value="STAFF">Scanner</option>
                            </select>
                          )}
                        </div>
                      );
                    })}

                  {currentMembers.length <= 1 && (
                    <div className="p-3 text-center text-xs text-ev-ink2">
                      Aucun autre collaborateur dans l&apos;organisation active.
                    </div>
                  )}
                </div>

                {/* Inviter un nouveau membre */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ev-ink2">
                    Inviter un nouveau membre
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={inviteContact}
                      onChange={(e) => setInviteContact(e.target.value)}
                      placeholder="Email ou téléphone..."
                      className="h-10 flex-1 rounded-xl border border-ev-border bg-white px-3 text-xs font-medium outline-none focus:border-ev-primary"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInvite();
                        }
                      }}
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as "MANAGER" | "STAFF")}
                      className="rounded-xl border border-ev-border bg-white px-2.5 text-xs font-medium text-ev-ink outline-none focus:border-ev-primary"
                    >
                      <option value="MANAGER">Manager</option>
                      <option value="STAFF">Scanner</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddInvite}
                      disabled={!inviteContact.trim()}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ev-soft px-3.5 text-xs font-semibold text-ev-ink hover:bg-ev-border disabled:opacity-40"
                    >
                      <Plus className="size-3.5" />
                      Ajouter
                    </button>
                  </div>

                  {newInvites.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {newInvites.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between rounded-lg border border-ev-border bg-ev-soft/50 px-3 py-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-ev-ink">{inv.contact}</span>
                            <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-ev-ink2 border border-ev-border">
                              {inv.role === "MANAGER" ? "Manager" : "Scanner"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveInvite(inv.id)}
                            className="text-ev-ink2 hover:text-red-600"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between border-t border-ev-border px-6 py-4">
            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="h-10 rounded-xl border border-ev-border px-4 text-xs font-semibold text-ev-ink hover:bg-ev-soft"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={!name.trim()}
                  onClick={() => setStep(2)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-ev-primary px-5 text-xs font-semibold text-white hover:bg-ev-primary-hover disabled:opacity-50"
                >
                  Continuer
                  <ChevronRight className="size-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-ev-border px-4 text-xs font-semibold text-ev-ink hover:bg-ev-soft"
                >
                  <ArrowLeft className="size-3.5" />
                  Retour
                </button>
                <button
                  type="button"
                  disabled={createOrg.isPending}
                  onClick={handleSubmit}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-ev-primary px-6 text-xs font-semibold text-white hover:bg-ev-primary-hover disabled:opacity-50"
                >
                  {createOrg.isPending ? "Création en cours..." : "Créer l'organisation"}
                </button>
              </>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
