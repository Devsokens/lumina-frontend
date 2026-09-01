"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import slugify from "slugify";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { SECTORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ACCOMMODATION: "Hébergement & RBNB",
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
    defaultValues: { sector: "RESTAURANT", acceptedTerms: undefined },
  });

  const businessName = watch("businessName");

  function onBusinessNameChange(value: string) {
    setValue("businessName", value);
    setValue("slug", slugify(value, { lower: true, strict: true }));
  }

  async function onSubmit(values: SignupInput) {
    setSubmitting(true);
    try {
      await signup({
        fullName: values.fullName,
        email: values.email || undefined,
        phone: values.phone || undefined,
        businessName: values.businessName,
        slug: values.slug,
        sector: values.sector,
        acceptedTerms: true,
      });
      toast.success("Compte créé avec succès");
      router.push(`/admin/${values.sector.toLowerCase()}`);
    } catch {
      toast.error("Impossible de créer le compte. Slug déjà pris ?");
    } finally {
      setSubmitting(false);
    }
  }

  const [googleLoading, setGoogleLoading] = useState(false);

  function handleGoogleSignup() {
    setGoogleLoading(true);
    toast.loading("Redirection vers Google...");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";
    window.location.href = `${apiUrl}/auth/google`;
  }

  return (
    <div>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-primary">
        <UserPlus className="size-6" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-foreground">Créer votre compte Giya</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Digitalisez votre activité en quelques minutes sans frais d&apos;entrée.
      </p>

      {/* Google Signup Button */}
      <Button
        type="button"
        variant="outline"
        className="mt-6 h-12 w-full rounded-xl border-border bg-card text-base font-medium shadow-xs transition-all hover:bg-muted/50 hover:border-primary/40"
        onClick={handleGoogleSignup}
        disabled={googleLoading}
      >
        <GoogleIcon className="mr-2 size-5" />
        {googleLoading ? "Inscription en cours..." : "S'inscrire avec Google"}
      </Button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">ou avec formulaire</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">
              Nom complet <span className="text-destructive">*</span>
            </Label>
            <Input id="fullName" className="h-11 rounded-xl" placeholder="Votre nom" {...register("fullName")} />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">
              Mot de passe <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="h-11 rounded-xl pr-10"
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" className="h-11 rounded-xl" placeholder="vous@exemple.com" {...register("email")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone (Mobile Money)</Label>
            <Input id="phone" className="h-11 rounded-xl" placeholder="+241 XX XX XX XX" {...register("phone")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="businessName">
            Nom de l&apos;activité <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            className="h-11 rounded-xl"
            placeholder="Ex: Villa Sunset, Festival Libreville, Le Palmier"
            value={businessName ?? ""}
            onChange={(e) => onBusinessNameChange(e.target.value)}
          />
          {errors.businessName && (
            <p className="text-sm text-destructive">{errors.businessName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">
            Sous-domaine personnalisé <span className="text-destructive">*</span>
          </Label>
          <div className="flex h-11 items-center gap-1 rounded-xl border border-input pr-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <Input
              id="slug"
              {...register("slug")}
              className="h-full flex-1 rounded-xl border-0 focus-visible:ring-0"
            />
            <span className="shrink-0 text-sm font-semibold text-primary">.giya.ga</span>
          </div>
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>
            Secteur d&apos;activité <span className="text-destructive">*</span>
          </Label>
          <Select
            defaultValue="EVENT"
            onValueChange={(v) => setValue("sector", v as SignupInput["sector"])}
          >
            <SelectTrigger className="h-11 w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EVENT">🎉 Événementiel (Billetterie & Scan QR)</SelectItem>
              <SelectItem value="RESTAURANT">🍽️ Restauration (Menu QR & KDS Cuisine)</SelectItem>
              <SelectItem value="SHOP">🛍️ E-Commerce (Boutique & Stocks)</SelectItem>
              <SelectItem value="ACCOMMODATION">🏨 Hébergement & RBNB (Calendrier & Reçus)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1 size-4 rounded border-input" {...register("acceptedTerms")} />
          <span className="text-muted-foreground">
            J&apos;accepte les CGU et la politique de confidentialité de Giya.
          </span>
        </label>
        {errors.acceptedTerms && (
          <p className="text-sm text-destructive">{errors.acceptedTerms.message}</p>
        )}

        <Button type="submit" className="h-11 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20" disabled={submitting}>
          {submitting ? "Création..." : "Démarrer gratuitement"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
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
