"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setSubmitting(true);
    try {
      const isEmail = values.identifier.includes("@");
      await login({
        password: values.password,
        ...(isEmail ? { email: values.identifier } : { phone: values.identifier }),
      });
      toast.success("Connexion réussie");
      router.push("/admin/restaurant");
    } catch {
      toast.error("Identifiants incorrects");
    } finally {
      setSubmitting(false);
    }
  }

  const [googleLoading, setGoogleLoading] = useState(false);

  function handleGoogleLogin() {
    setGoogleLoading(true);
    toast.loading("Redirection vers Google...");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";
    window.location.href = `${apiUrl}/auth/google`;
  }

  // Connexion démo fictive instantanée pour prévisualiser les écrans
  function handleDemoLogin(sector: "event" | "restaurant" | "shop" | "accommodation") {
    const sectorNames: Record<string, string> = {
      event: "Festival Urban Libreville",
      restaurant: "Le Palmier d'Or",
      shop: "Sneakers Store LBV",
      accommodation: "Résidences Mbolo",
    };

    setAccessToken("demo-jwt-mock-token");
    setUser({
      id: "demo-user-1",
      email: `organisateur@${sector}.ga`,
      phone: "+241 77 00 00 00",
      fullName: `Admin ${sectorNames[sector]}`,
      role: "OWNER",
      tenantId: `demo-${sector}-tenant`,
    });
    setStatus("authenticated");

    toast.success(`Connecté en mode démo : ${sectorNames[sector]}`);
    router.push(`/admin/${sector}`);
  }

  return (
    <div>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-primary">
        <KeyRound className="size-6" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-foreground">Content de vous revoir</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Connectez-vous pour accéder à votre tableau de bord Giya.
      </p>

      {/* Mode Démo Rapide en 1 Clic pour la prévisualisation */}
      <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            Accès Démo Immédiat (Sans backend)
          </span>
          <span className="text-[10px] font-mono rounded bg-primary/20 px-1.5 py-0.5 text-primary">
            Mode Prévisualisation
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Cliquez sur le secteur de votre choix pour explorer immédiatement tous les écrans :
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs h-9 justify-start px-3"
            onClick={() => handleDemoLogin("event")}
          >
            Événementiel (Pass & Scan)
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 font-semibold text-xs h-9 justify-start px-3"
            onClick={() => handleDemoLogin("restaurant")}
          >
            Restauration & KDS
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl border-purple-500/30 text-purple-600 hover:bg-purple-500/10 font-semibold text-xs h-9 justify-start px-3"
            onClick={() => handleDemoLogin("accommodation")}
          >
            Hébergement & RBNB
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl border-blue-500/30 text-blue-600 hover:bg-blue-500/10 font-semibold text-xs h-9 justify-start px-3"
            onClick={() => handleDemoLogin("shop")}
          >
            E-Commerce & Stocks
          </Button>
        </div>
      </div>

      {/* Bouton Google */}
      <Button
        type="button"
        variant="outline"
        className="mt-4 h-12 w-full rounded-xl border-border bg-card text-base font-medium shadow-xs transition-all hover:bg-muted/50 hover:border-primary/40"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
      >
        <GoogleIcon className="mr-2 size-5" />
        {googleLoading ? "Connexion en cours..." : "Continuer avec Google"}
      </Button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">ou formulaire classique</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="identifier">
            Email ou téléphone <span className="text-destructive">*</span>
          </Label>
          <Input
            id="identifier"
            autoComplete="username"
            className="h-11 rounded-xl"
            placeholder="vous@exemple.com ou +241..."
            {...register("identifier")}
          />
          {errors.identifier && (
            <p className="text-sm text-destructive">{errors.identifier.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">
              Mot de passe <span className="text-destructive">*</span>
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary underline-offset-4 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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

        <Button type="submit" className="h-11 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20" disabled={submitting}>
          {submitting ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
          Créer un compte Giya
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
