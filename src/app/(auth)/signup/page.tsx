"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import slugify from "slugify";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  PartyPopper,
  Plus,
  Trash2,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { homePathFor, useAuth } from "@/hooks/useAuth";
import { apiError } from "@/lib/api";
import { API_URL, type Sector } from "@/lib/constants";
import { publicSiteLabel } from "@/lib/tenant-url";
import { LEGAL_LINKS } from "@/lib/legal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SECTOR_OPTIONS: { id: Sector; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "EVENT", label: "Événementiel", icon: PartyPopper },
  { id: "RESTAURANT", label: "Restauration", icon: UtensilsCrossed },
  { id: "ACCOMMODATION", label: "RBNB / Séjours", icon: Building2 },
];

function checkPasswordStrength(p: string) {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  return score;
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();

  const sectorParam = searchParams.get("sector");
  const initialSector: Sector =
    sectorParam === "EVENT" || sectorParam === "RESTAURANT" || sectorParam === "ACCOMMODATION"
      ? sectorParam
      : "EVENT";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Étape 1 : Compte
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Étape 2 : Organisation
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [sector, setSector] = useState<Sector>(initialSector);

  // Étape 3 : Équipe & CGU
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; contact: string; role: "MANAGER" | "STAFF" }>>([]);
  const [inviteContact, setInviteContact] = useState("");
  const [inviteRole, setInviteRole] = useState<"MANAGER" | "STAFF">("STAFF");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleBusinessNameChange = (val: string) => {
    setBusinessName(val);
    if (!slug || slug === slugify(businessName, { lower: true, strict: true })) {
      setSlug(slugify(val, { lower: true, strict: true }).slice(0, 50).replace(/-+$/, ""));
    }
  };

  const handleAddTeamMember = () => {
    const trimmed = inviteContact.trim();
    if (!trimmed) return;
    setTeamMembers((prev) => [...prev, { id: Math.random().toString(36).slice(2), contact: trimmed, role: inviteRole }]);
    setInviteContact("");
  };

  const handleRemoveTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const validateStep1 = () => {
    if (!fullName.trim()) {
      toast.error("Veuillez renseigner votre nom complet.");
      return false;
    }
    if (!email.trim() && !phone.trim()) {
      toast.error("Veuillez renseigner un email ou un numéro de téléphone.");
      return false;
    }
    if (password.length < 8) {
      toast.error("Le mot de passe doit comporter au moins 8 caractères.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!businessName.trim()) {
      toast.error("Veuillez renseigner le nom de votre organisation.");
      return false;
    }
    if (!slug.trim()) {
      toast.error("Veuillez définir une adresse pour votre site vitrine.");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      toast.error("Veuillez accepter les CGU et la politique de confidentialité.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await signup({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() ? phone.replace(/[\s.()-]/g, "") : undefined,
        password,
        businessName: businessName.trim(),
        slug: slug.trim(),
        sector,
        acceptedTerms: true,
      });

      toast.success("Votre compte GiyaX a été créé avec succès !");
      router.replace(await homePathFor(user));
    } catch (err) {
      toast.error(apiError(err, "Impossible de créer le compte."));
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    toast.loading("Redirection vers Google...");
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${API_URL}/auth/google`);
  };

  const pwdStrength = checkPasswordStrength(password);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">
          Créer votre compte GiyaX
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Étape {step} sur 3 : {step === 1 ? "Vos identifiants" : step === 2 ? "Votre organisation" : "Votre équipe"}
        </p>

        {/* Stepper bar */}
        <div className="mt-4 flex h-1.5 w-full gap-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full flex-1 rounded-full transition-all duration-300", step >= 1 ? "bg-primary" : "bg-transparent")}
          />
          <div
            className={cn("h-full flex-1 rounded-full transition-all duration-300", step >= 2 ? "bg-primary" : "bg-transparent")}
          />
          <div
            className={cn("h-full flex-1 rounded-full transition-all duration-300", step >= 3 ? "bg-primary" : "bg-transparent")}
          />
        </div>
      </div>

      {/* Étape 1 : Compte & Identifiants */}
      {step === 1 && (
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-2 border-foreground/15 bg-card text-sm font-medium shadow-xs transition-all hover:border-primary/40 hover:bg-muted/50"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
          >
            <GoogleIcon className="mr-2 size-4" />
            {googleLoading ? "Inscription en cours..." : "Continuer avec Google"}
          </Button>

          <div className="my-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              ou avec vos identifiants
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div>
            <label htmlFor="fullName" className="text-xs font-semibold text-foreground">
              Nom complet <span className="text-destructive">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex. Jean Ondo"
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@exemple.ga"
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-xs font-semibold text-foreground">
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="074 XX XX XX"
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-semibold text-foreground">
                Mot de passe <span className="text-destructive">*</span>
              </label>
            </div>
            <div className="relative mt-1.5">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum..."
                className="h-11 w-full rounded-xl border border-input bg-card px-3.5 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {/* Indicateur de force */}
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex h-1 flex-1 gap-1">
                  <div
                    className={cn(
                      "h-full flex-1 rounded-full transition-all",
                      pwdStrength >= 1 ? (pwdStrength === 1 ? "bg-red-500" : pwdStrength === 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-muted",
                    )}
                  />
                  <div
                    className={cn(
                      "h-full flex-1 rounded-full transition-all",
                      pwdStrength >= 2 ? (pwdStrength === 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-muted",
                    )}
                  />
                  <div
                    className={cn(
                      "h-full flex-1 rounded-full transition-all",
                      pwdStrength >= 3 ? "bg-emerald-500" : "bg-muted",
                    )}
                  />
                </div>
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {pwdStrength === 1 ? "Faible" : pwdStrength === 2 ? "Moyen" : "Sécurisé"}
                </span>
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={handleNextStep}
            className="mt-2 h-11 w-full rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
          >
            <span>Continuer</span>
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      )}

      {/* Étape 2 : Organisation */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="businessName" className="text-xs font-semibold text-foreground">
              Nom de l&apos;organisation <span className="text-destructive">*</span>
            </label>
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => handleBusinessNameChange(e.target.value)}
              placeholder="Ex. Afro Nation Gabon, TedxLibreville..."
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="slug" className="text-xs font-semibold text-foreground">
              Adresse du site vitrine <span className="text-destructive">*</span>
            </label>
            <div className="mt-1.5 flex items-center rounded-xl border border-input bg-card px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <span className="text-xs font-medium text-muted-foreground">giya.events/</span>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value, { lower: true, strict: true }))}
                placeholder="nom-organisation"
                className="h-11 flex-1 bg-transparent px-1.5 text-sm font-medium outline-none"
              />
              {slug && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <Check className="size-3" />
                  Valide
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Adresse publique : <strong>{publicSiteLabel(slug || "votre-activite")}</strong>
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">
              Secteur d&apos;activité <span className="text-destructive">*</span>
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {SECTOR_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = sector === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSector(opt.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-input bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="text-xs">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="h-11 rounded-xl px-4 text-xs font-semibold"
            >
              <ArrowLeft className="mr-1.5 size-3.5" />
              Retour
            </Button>
            <Button
              type="button"
              onClick={handleNextStep}
              className="h-11 flex-1 rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
            >
              <span>Continuer</span>
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Étape 3 : Équipe & CGU */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Inviter votre équipe (facultatif)
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ajoutez des collaborateurs pour gérer les événements ou scanner les billets à l&apos;entrée.
            </p>
          </div>

          {/* Formulaire ajout collaborateur */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteContact}
              onChange={(e) => setInviteContact(e.target.value)}
              placeholder="Email ou téléphone..."
              className="h-10 flex-1 rounded-xl border border-input bg-card px-3 text-xs outline-none focus:border-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTeamMember();
                }
              }}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "MANAGER" | "STAFF")}
              className="rounded-xl border border-input bg-card px-2.5 text-xs font-medium text-foreground outline-none focus:border-primary"
            >
              <option value="MANAGER">Manager</option>
              <option value="STAFF">Scanner</option>
            </select>
            <button
              type="button"
              onClick={handleAddTeamMember}
              disabled={!inviteContact.trim()}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-muted px-3 text-xs font-semibold text-foreground hover:bg-muted/80 disabled:opacity-40"
            >
              <Plus className="size-3.5" />
              Ajouter
            </button>
          </div>

          {teamMembers.length > 0 && (
            <div className="flex flex-col gap-1.5 rounded-xl border border-input bg-card/60 p-2.5">
              {teamMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{m.contact}</span>
                    <span className="rounded bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground border">
                      {m.role === "MANAGER" ? "Manager" : "Scanner"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTeamMember(m.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* CGU checkbox */}
          <label className="flex cursor-pointer items-start gap-2.5 pt-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 size-4 rounded border-input accent-[var(--primary)]"
            />
            <span>
              J&apos;accepte les{" "}
              <a href={LEGAL_LINKS.terms} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline underline-offset-2">
                conditions d&apos;utilisation
              </a>{" "}
              et la{" "}
              <a href={LEGAL_LINKS.privacy} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline underline-offset-2">
                politique de confidentialité
              </a>{" "}
              de GiyaX.
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              className="h-11 rounded-xl px-4 text-xs font-semibold"
            >
              <ArrowLeft className="mr-1.5 size-3.5" />
              Retour
            </Button>
            <Button
              type="button"
              disabled={submitting || !acceptedTerms}
              onClick={handleSubmit}
              className="h-11 flex-1 rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
            >
              {submitting ? "Création en cours..." : "Créer mon compte"}
            </Button>
          </div>
        </div>
      )}

      {/* Footer link to Login */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.75-2.1-6.69-4.93H1.3v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.32a7.2 7.2 0 0 1 0-4.64V6.59H1.3a12 12 0 0 0 0 10.82l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44A11.7 11.7 0 0 0 12 0 12 12 0 0 0 1.3 6.59l4.01 3.09C6.25 6.85 8.89 4.75 12 4.75Z"
      />
    </svg>
  );
}
