"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import slugify from "slugify";
import { toast } from "sonner";
import { Eye, EyeOff, PartyPopper, UtensilsCrossed, Building2 } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/validations";
import { homePathFor, useAuth } from "@/hooks/useAuth";
import { apiError } from "@/lib/api";
import { API_URL, ROOT_DOMAIN } from "@/lib/constants";
import { publicSiteLabel, subdomainActive } from "@/lib/tenant-url";
import { SECTORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { FloatingField } from "@/components/shared/floating-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SECTOR_LABELS: Record<(typeof SECTORS)[number], string> = {
  EVENT: "Événementiel",
  RESTAURANT: "Restauration",
  SHOP: "Commerce",
  ACCOMMODATION: "RBNB",
};

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { sector: "EVENT", acceptedTerms: undefined },
  });

  // Secteur choisi depuis la landing (/signup?sector=RESTAURANT…).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("sector");
    if (fromUrl === "EVENT" || fromUrl === "RESTAURANT" || fromUrl === "ACCOMMODATION") {
      setValue("sector", fromUrl, { shouldValidate: true });
    }
  }, [setValue]);

  const businessName = watch("businessName");
  const sector = watch("sector");

  function onBusinessNameChange(value: string) {
    setValue("businessName", value);
    setValue("slug", slugify(value, { lower: true, strict: true }));
  }

  async function onSubmit(values: SignupInput) {
    setSubmitting(true);
    try {
      const user = await signup({
        fullName: values.fullName,
        email: values.email || undefined,
        phone: values.phone ? values.phone.replace(/[\s.()-]/g, "") : undefined,
        password: values.password,
        businessName: values.businessName,
        slug: values.slug,
        sector: values.sector,
        acceptedTerms: true,
      });
      toast.success("Compte créé avec succès");
      router.replace(await homePathFor(user));
    } catch (err) {
      toast.error(apiError(err, "Impossible de créer le compte."));
      setSubmitting(false);
    }
  }

  const [googleLoading, setGoogleLoading] = useState(false);

  function handleGoogleSignup() {
    setGoogleLoading(true);
    toast.loading("Redirection vers Google...");
    window.location.href = `${API_URL}/auth/google`;
  }

  const hasSubdomain = subdomainActive();
  // Fond du libellé posé sur la bordure (page au-dessus, champ en dessous),
  // identique aux champs FloatingField.
  const raisedLabelBg = "bg-[linear-gradient(to_bottom,var(--background)_50%,var(--card)_50%)]";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold leading-tight text-foreground sm:text-[26px]">Créer votre compte GiyaX</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Démarrez gratuitement, sans frais d&apos;entrée.
      </p>

      {/* Bouton Google */}
      <Button
        type="button"
        variant="outline"
        className="mt-4 h-11 w-full rounded-xl border-2 border-foreground/15 bg-card text-[15px] font-medium shadow-xs transition-all hover:border-primary/40 hover:bg-muted/50"
        onClick={handleGoogleSignup}
        disabled={googleLoading}
      >
        <GoogleIcon className="mr-2 size-5" />
        {googleLoading ? "Inscription en cours..." : "S'inscrire avec Google"}
      </Button>

      <div className="my-3 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">ou avec vos informations</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Deux colonnes (mobile compris) et erreurs posées sous les champs :
          le formulaire tient dans l'écran, sans défilement. */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-3 gap-y-5" noValidate>
        <FloatingField
          id="fullName"
          label="Nom complet"
          required
          dense
          errorOverlay
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <FloatingField
          id="password"
          label="Mot de passe"
          required
          dense
          errorOverlay
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          error={errors.password?.message}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          {...register("password")}
        />
        <FloatingField
          id="email"
          label="Email"
          type="email"
          dense
          errorOverlay
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <FloatingField
          id="phone"
          label="Téléphone"
          type="tel"
          inputMode="tel"
          dense
          errorOverlay
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <FloatingField
          id="businessName"
          label="Nom de l'activité"
          required
          dense
          errorOverlay
          error={errors.businessName?.message}
          value={businessName ?? ""}
          onChange={(e) => onBusinessNameChange(e.target.value)}
        />

        {/* Secteur : même habillage que les champs, libellé toujours remonté. */}
        <div className="relative">
          <Select
            value={sector}
            onValueChange={(v) => setValue("sector", v as SignupInput["sector"], { shouldValidate: true })}
          >
            <SelectTrigger
              id="sector"
              className="h-12! w-full rounded-xl border-2 border-foreground/15 bg-card px-4 text-sm shadow-xs hover:border-foreground/30 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 dark:border-white/15 dark:bg-card"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EVENT"><PartyPopper className="size-4" /> Événementiel</SelectItem>
              <SelectItem value="RESTAURANT"><UtensilsCrossed className="size-4" /> Restauration</SelectItem>
              <SelectItem value="ACCOMMODATION"><Building2 className="size-4" /> RBNB</SelectItem>
            </SelectContent>
          </Select>
          <label
            htmlFor="sector"
            className={`pointer-events-none absolute left-3 top-0 -translate-y-1/2 rounded px-1.5 text-xs font-semibold text-muted-foreground ${raisedLabelBg}`}
          >
            Secteur <span className="text-destructive">*</span>
          </label>
        </div>

        <div className="relative col-span-2">
          <FloatingField
            id="slug"
            label="Adresse de votre site"
            required
            dense
            errorOverlay
            error={errors.slug?.message}
            className={hasSubdomain ? "pr-28" : undefined}
            endAdornment={
              hasSubdomain ? (
                <span className="pr-2.5 text-sm font-semibold text-primary">.{ROOT_DOMAIN}</span>
              ) : undefined
            }
            {...register("slug")}
          />
          {/* Aperçu de l'adresse, à l'emplacement de l'erreur (aucune hauteur ajoutée). */}
          {!hasSubdomain && !errors.slug && (
            <p className="absolute left-0 top-full mt-0.5 w-full truncate px-1 text-[11px] leading-tight text-muted-foreground">
              Votre site : <strong>{publicSiteLabel(watch("slug") || "votre-activite")}</strong>
            </p>
          )}
        </div>

        <label className="col-span-2 -mt-1 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 rounded border-input accent-[var(--primary)]"
            aria-invalid={errors.acceptedTerms ? true : undefined}
            {...register("acceptedTerms")}
          />
          <span className={errors.acceptedTerms ? "text-destructive" : "text-muted-foreground"}>
            J&apos;accepte les CGU et la politique de confidentialité de GiyaX.
          </span>
        </label>

        <Button
          type="submit"
          className="col-span-2 h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20"
          disabled={submitting}
        >
          {submitting ? "Création..." : "Démarrer gratuitement"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
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
