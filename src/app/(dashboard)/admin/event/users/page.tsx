"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  KeyRound,
  Mail,
  Phone,
  Briefcase,
  Lock,
  Unlock,
  Check,
  X,
  Sparkles,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Crown,
  CheckCircle2,
  Sliders,
  Calendar,
  ClipboardList,
  QrCode,
  GraduationCap,
  BarChart3,
  Settings,
  Pencil,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { PricingUpgradeModal } from "@/components/shared/pricing-upgrade-modal";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "STAFF";
export type PermissionLevel = "EDITOR" | "VIEWER";
export type ModuleKey = "events" | "reservations" | "scanner" | "certificates" | "stats" | "settings";

export interface ModulePermissionConfig {
  enabled: boolean;
  level: PermissionLevel; // Éditeur vs Lecteur pour ce module spécifique
}

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  jobTitle?: string; // Fonction optionnelle
  status: "ACTIVE" | "PENDING_INVITE" | "SUSPENDED";
  createdAt: string;
  modulePermissions: Record<ModuleKey, ModulePermissionConfig>;
}

const DEFAULT_SUPERADMIN_PERMISSIONS: Record<ModuleKey, ModulePermissionConfig> = {
  events: { enabled: true, level: "EDITOR" },
  reservations: { enabled: true, level: "EDITOR" },
  scanner: { enabled: true, level: "EDITOR" },
  certificates: { enabled: true, level: "EDITOR" },
  stats: { enabled: true, level: "EDITOR" },
  settings: { enabled: true, level: "EDITOR" },
};

const DEFAULT_MEMBER_PERMISSIONS: Record<ModuleKey, ModulePermissionConfig> = {
  events: { enabled: true, level: "EDITOR" },
  reservations: { enabled: true, level: "VIEWER" },
  scanner: { enabled: true, level: "EDITOR" },
  certificates: { enabled: true, level: "VIEWER" },
  stats: { enabled: false, level: "VIEWER" },
  settings: { enabled: false, level: "VIEWER" },
};

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "usr-1",
    fullName: "Marc Ondimba (Vous)",
    email: "marc.ondimba@urban-festival.ga",
    phone: "+241 77 12 34 56",
    role: "SUPER_ADMIN",
    jobTitle: "Directeur & Fondateur",
    status: "ACTIVE",
    createdAt: "2026-08-01T10:00:00Z",
    modulePermissions: DEFAULT_SUPERADMIN_PERMISSIONS,
  },
];

const MODULE_DEFINITIONS: { key: ModuleKey; label: string; desc: string; icon: typeof Calendar }[] = [
  { key: "events", label: "Mes Événements", desc: "Création et gestion des fiches", icon: Calendar },
  { key: "reservations", label: "Réservations", desc: "Suivi des participants et billets", icon: ClipboardList },
  { key: "scanner", label: "Contrôle d'Accès", desc: "Scanner les pass QR à l'entrée", icon: QrCode },
  { key: "certificates", label: "Certifications", desc: "Délivrance des diplômes officiels", icon: GraduationCap },
  { key: "stats", label: "Statistiques", desc: "Chiffre d'affaires et présences", icon: BarChart3 },
  { key: "settings", label: "Paramètres & MoMo", desc: "Comptes Airtel & Moov Money", icon: Settings },
];

export default function EventUsersPage() {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [jobTitle, setJobTitle] = useState(""); // Optionnel
  const [modulePermissions, setModulePermissions] = useState<Record<ModuleKey, ModulePermissionConfig>>(
    DEFAULT_MEMBER_PERMISSIONS
  );

  const FREE_TIER_LIMIT = 2;
  const isFreeLimitReached = members.length >= FREE_TIER_LIMIT;

  function handleOpenCreate() {
    if (isFreeLimitReached) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setEditingMember(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword(generateRandomPassword());
    setRole("ADMIN");
    setJobTitle("");
    setModulePermissions({
      events: { enabled: true, level: "EDITOR" },
      reservations: { enabled: true, level: "VIEWER" },
      scanner: { enabled: true, level: "EDITOR" },
      certificates: { enabled: true, level: "VIEWER" },
      stats: { enabled: false, level: "VIEWER" },
      settings: { enabled: false, level: "VIEWER" },
    });
    setIsSheetOpen(true);
  }

  function handleOpenEdit(member: TeamMember) {
    setEditingMember(member);
    setFullName(member.fullName);
    setEmail(member.email);
    setPhone(member.phone);
    setPassword(""); // Keep blank if unchanged
    setRole(member.role);
    setJobTitle(member.jobTitle ?? "");
    setModulePermissions(member.modulePermissions ?? DEFAULT_MEMBER_PERMISSIONS);
    setIsSheetOpen(true);
  }

  function generateRandomPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  }

  function handleToggleModule(key: ModuleKey) {
    setModulePermissions((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key].enabled,
      },
    }));
  }

  function handleSetModuleLevel(key: ModuleKey, level: PermissionLevel) {
    setModulePermissions((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: true, // S'assure que le module est actif si on change son niveau
        level,
      },
    }));
  }

  function handleSaveMember(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      toast.error("Le nom et l'email sont requis.");
      return;
    }

    const permsToSave = role === "SUPER_ADMIN" ? DEFAULT_SUPERADMIN_PERMISSIONS : modulePermissions;

    if (editingMember) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMember.id
            ? {
                ...m,
                fullName,
                email,
                phone,
                role,
                jobTitle: jobTitle.trim() || undefined,
                modulePermissions: permsToSave,
              }
            : m
        )
      );
      toast.success(`Compte de ${fullName} mis à jour avec succès !`);
    } else {
      const newMember: TeamMember = {
        id: `usr-${Date.now()}`,
        fullName,
        email,
        phone,
        role,
        jobTitle: jobTitle.trim() || undefined,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        modulePermissions: permsToSave,
      };
      setMembers((prev) => [...prev, newMember]);
      toast.success(`Utilisateur ${fullName} créé ! Identifiants d'accès configurés.`);
    }

    setIsSheetOpen(false);
  }

  function handleDeleteMember(id: string, name: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success(`Compte de ${name} supprimé de votre équipe.`);
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Utilisateurs & Gestion d&apos;Équipe
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Invitez vos collaborateurs, attribuez les rôles et configurez les permissions (Éditeur / Lecteur) pour chaque module.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenCreate}
          className="rounded-xl bg-primary text-white text-xs font-semibold gap-1.5 shadow-md shadow-primary/20"
        >
          <UserPlus className="size-3.5" />
          <span>Ajouter un utilisateur</span>
        </Button>
      </div>

      {/* Free Plan Quota & Upgrade Banner */}
      <div className="rounded-3xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
            <Users className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-foreground">
                Plan Gratuit : 2 Comptes Collaborateurs Inclus
              </span>
              <span className="text-[10px] font-mono font-bold text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                {members.length} / {FREE_TIER_LIMIT} Utilisés
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isFreeLimitReached
                ? "Vous avez atteint la limite de 2 comptes du Plan Gratuit. Passez au Plan PRO pour une équipe illimitée."
                : `Vous pouvez encore inviter ${FREE_TIER_LIMIT - members.length} collaborateur avec ce plan.`}
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => setIsUpgradeModalOpen(true)}
          className="rounded-xl bg-primary text-white text-xs font-bold gap-1.5 shadow-sm shrink-0"
        >
          <Sparkles className="size-3.5" />
          <span>Équipe Illimitée (Plan PRO)</span>
        </Button>
      </div>

      {/* Team Members Table */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Collaborateur & Contact</th>
                <th className="py-3.5 px-4">Rôle & Titre</th>
                <th className="py-3.5 px-4">Permissions par Module</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                  {/* Name & Contact */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xs">
                        {member.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-xs">{member.fullName}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Mail className="size-2.5" /> {member.email}
                        </p>
                        {member.phone && (
                          <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                            <Phone className="size-2.5" /> {member.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Role & Optional Job Title */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          member.role === "SUPER_ADMIN"
                            ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                            : member.role === "ADMIN"
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                            : "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30"
                        }`}
                      >
                        {member.role === "SUPER_ADMIN" && <Crown className="size-2.5" />}
                        {member.role === "ADMIN" && <Shield className="size-2.5" />}
                        {member.role === "SUPER_ADMIN"
                          ? "Super Admin"
                          : member.role === "ADMIN"
                          ? "Administrateur"
                          : "Collaborateur"}
                      </span>
                      {member.jobTitle ? (
                        <p className="text-[11px] text-muted-foreground font-medium">
                          {member.jobTitle}
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground/60 italic">Sans fonction</p>
                      )}
                    </div>
                  </td>

                  {/* Modules & Per-module Permissions Chips */}
                  <td className="py-3.5 px-4">
                    {member.role === "SUPER_ADMIN" ? (
                      <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                        <CheckCircle2 className="size-3.5 text-primary" /> Tous les modules (Éditeur Total)
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-w-[340px]">
                        {MODULE_DEFINITIONS.filter(
                          (m) => member.modulePermissions?.[m.key]?.enabled
                        ).map((m) => {
                          const config = member.modulePermissions[m.key];
                          const isEditor = config?.level === "EDITOR";
                          return (
                            <span
                              key={m.key}
                              className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold border ${
                                isEditor
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                                  : "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {isEditor ? (
                                <Pencil className="size-2.5 text-emerald-500" />
                              ) : (
                                <BookOpen className="size-2.5 text-muted-foreground" />
                              )}
                              <span>{m.label}</span>
                              <span
                                className={`text-[8px] font-bold px-1 rounded uppercase ${
                                  isEditor ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-muted-foreground/15 text-muted-foreground"
                                }`}
                              >
                                {isEditor ? "Éditeur" : "Lecteur"}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                      <Check className="size-2.5" /> Actif
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(member)}
                        title="Modifier les accès et permissions"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>

                      {member.role !== "SUPER_ADMIN" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 rounded-lg text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteMember(member.id, member.fullName)}
                          title="Supprimer l'accès"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SLIDE-OVER SHEET MODAL (GLISSE DE LA DROITE VERS LA GAUCHE)               */}
      {/* ========================================================================= */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-6 sm:p-7 border-l border-border bg-card"
        >
          <SheetHeader className="mb-5 border-b border-border pb-3 text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-2xl bg-primary text-white">
                <UserPlus className="size-4.5" />
              </div>
              <div>
                <SheetTitle className="font-display font-bold text-lg text-foreground">
                  {editingMember ? "Modifier le Collaborateur" : "Ajouter un Collaborateur"}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Identifiants, rôle et attribution des permissions (Éditeur / Lecteur) par module.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
            {/* SECTION 1: INFOS PERSONNELLES & MOT DE PASSE */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">
                    Nom complet <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Marc Ondimba"
                    className="h-9 rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">
                    Email de connexion <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="collaborateur@votre-evenement.ga"
                    className="h-9 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">
                    Téléphone (WhatsApp)
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+241 77 XX XX XX"
                    className="h-9 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">
                      {editingMember ? "Nouveau Mot de Passe (Optionnel)" : "Mot de Passe Initial *"}
                    </Label>
                    <button
                      type="button"
                      onClick={() => setPassword(generateRandomPassword())}
                      className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                    >
                      <RefreshCw className="size-2.5" /> Générer
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={editingMember ? "Laisser vide pour ne pas changer" : "Mot de passe sécurisé"}
                      className="h-9 rounded-xl text-xs pr-8 font-mono"
                      required={!editingMember}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: RÔLE & FONCTION (OPTIONNELLE) */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-foreground">
                  Attribution du Rôle
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("SUPER_ADMIN")}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      role === "SUPER_ADMIN"
                        ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500"
                        : "border-border bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <Crown className={`size-4 mb-1 ${role === "SUPER_ADMIN" ? "text-purple-500" : "text-muted-foreground"}`} />
                    <p className="font-bold text-xs text-foreground">Super Admin</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Tous les accès</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("ADMIN")}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      role === "ADMIN"
                        ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                        : "border-border bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <Shield className={`size-4 mb-1 ${role === "ADMIN" ? "text-blue-500" : "text-muted-foreground"}`} />
                    <p className="font-bold text-xs text-foreground">Admin</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Gestion avancée</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("STAFF")}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      role === "STAFF"
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <Users className={`size-4 mb-1 ${role === "STAFF" ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-bold text-xs text-foreground">Staff / Opérateur</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Accès sur-mesure</p>
                  </button>
                </div>
              </div>

              {/* Job Title / Fonction (NON OBLIGATOIRE) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">
                    Fonction / Titre (Optionnel)
                  </Label>
                  <span className="text-[10px] text-muted-foreground italic">Facultatif</span>
                </div>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex: Responsable Billetterie, Régisseur Général, Contrôleur..."
                  className="h-9 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* SECTION 3: PERMISSIONS GRANULAIRES PAR MODULE (ÉDITEUR VS LECTEUR) */}
            {role !== "SUPER_ADMIN" ? (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">
                    Permissions Granulaires par Module
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    Activez et choisissez Éditeur ou Lecteur
                  </span>
                </div>

                <div className="space-y-2">
                  {MODULE_DEFINITIONS.map((mod) => {
                    const Icon = mod.icon;
                    const config = modulePermissions[mod.key] ?? { enabled: false, level: "VIEWER" };

                    return (
                      <div
                        key={mod.key}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                          config.enabled
                            ? "border-border bg-card shadow-xs"
                            : "border-border/60 bg-muted/15 opacity-70"
                        }`}
                      >
                        {/* Module Checkbox & Info */}
                        <label className="flex items-start gap-2.5 cursor-pointer min-w-0">
                          <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={() => handleToggleModule(mod.key)}
                            className="rounded border-border text-primary focus:ring-primary size-4 mt-0.5"
                          />
                          <div>
                            <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              <Icon className="size-3.5 text-primary shrink-0" />
                              <span>{mod.label}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">{mod.desc}</p>
                          </div>
                        </label>

                        {/* Permission Level Selector (Éditeur vs Lecteur) */}
                        {config.enabled ? (
                          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleSetModuleLevel(mod.key, "EDITOR")}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                config.level === "EDITOR"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <Pencil className="size-2.5" />
                              <span>Éditeur</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSetModuleLevel(mod.key, "VIEWER")}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                config.level === "VIEWER"
                                  ? "bg-foreground text-background shadow-xs font-bold"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <BookOpen className="size-2.5" />
                              <span>Lecteur</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60 italic self-end sm:self-center">
                            Accès désactivé
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3 flex items-center gap-2.5 text-xs text-purple-700 dark:text-purple-300">
                <Crown className="size-4 shrink-0 text-purple-500" />
                <span>
                  Le rôle <strong>Super Admin</strong> confère automatiquement le statut d&apos;<strong>Éditeur</strong> sur l&apos;intégralité des modules et paramètres.
                </span>
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsSheetOpen(false)}
                className="rounded-xl text-xs"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="sm"
                className="rounded-xl bg-primary text-white font-bold text-xs gap-1.5 shadow-md shadow-primary/20"
              >
                <Check className="size-3.5" />
                <span>{editingMember ? "Enregistrer les modifications" : "Créer le compte"}</span>
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Upgrade Modal */}
      <PricingUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        feature="TEAM_LIMIT"
      />
    </div>
  );
}
