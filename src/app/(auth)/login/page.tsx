"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { homePathFor, useAuth } from "@/hooks/useAuth";
import { apiError } from "@/lib/api";
import { OtpLogin } from "@/components/shared/otp-login";
import { useAuthStore, type AuthUser } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { FloatingField } from "@/components/shared/floating-field";
import { API_URL } from "@/lib/constants";

// Accès démo sans backend : uniquement si NEXT_PUBLIC_DEMO_MODE=true
// (prévisualisation des écrans). Jamais en production.
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Retours d'échec du parcours Google (redirections de l'API).
const GOOGLE_ERRORS: Record<string, string> = {
  google_no_email: "Google n'a pas communiqué d'adresse e-mail vérifiée. Utilisez le formulaire ou le code SMS.",
  google_failed: "La connexion Google a été annulée ou a échoué. Réessayez, ou utilisez votre e-mail.",
  google_session: "Session Google non ouverte (cookies bloqués ?). Réessayez ou connectez-vous par e-mail.",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"password" | "otp">("password");
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
      const user = await login({
        password: values.password,
        ...(isEmail
          ? { email: values.identifier.trim() }
          : { phone: values.identifier.replace(/[\s.()-]/g, "") }),
      });
      // null : plusieurs comptes (un par secteur), écran de choix déjà ouvert.
      if (user) await goHome(user);
    } catch (err) {
      toast.error(apiError(err, "Identifiants incorrects"));
      setSubmitting(false);
    }
  }

  // Retour à la page demandée avant la connexion (chemin interne uniquement).
  async function goHome(user: AuthUser) {
    toast.success("Connexion réussie");
    const next = searchParams.get("next");
    const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
    router.replace(user.mustChangePassword ? "/change-password" : safeNext ?? (await homePathFor(user)));
  }

  const [googleLoading, setGoogleLoading] = useState(false);

  function handleGoogleLogin() {
    setGoogleLoading(true);
    toast.loading("Redirection vers Google...");
    window.location.href = `${API_URL}/auth/google`;
  }

  // Connexion démo fictive instantanée pour prévisualiser les écrans
  function handleDemoLogin(sector: "event" | "restaurant" | "accommodation") {
    const sectorNames: Record<string, string> = {
      event: "Festival Urban Libreville",
      restaurant: "Le Palmier d'Or",
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
      <h1 className="font-display text-[28px] font-bold leading-tight text-foreground">Content de vous revoir</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Connectez-vous pour accéder à votre tableau de bord GiyaX.
      </p>

      {GOOGLE_ERRORS[searchParams.get("error") ?? ""] && (
        <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {GOOGLE_ERRORS[searchParams.get("error") ?? ""]}
        </p>
      )}

      {/* Mode démo (prévisualisation sans backend, jamais en production) */}
      {DEMO_MODE && (
        <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Accès démo (sans backend)</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Button type="button" size="sm" variant="outline" className="h-9 rounded-xl text-xs font-semibold" onClick={() => handleDemoLogin("event")}>
              Événements
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-9 rounded-xl text-xs font-semibold" onClick={() => handleDemoLogin("restaurant")}>
              Restaurant
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-9 rounded-xl text-xs font-semibold" onClick={() => handleDemoLogin("accommodation")}>
              RBNB
            </Button>
          </div>
        </div>
      )}

      {/* Bouton Google */}
      <Button
        type="button"
        variant="outline"
        className="mt-6 h-12 w-full rounded-xl border-2 border-foreground/15 bg-card text-[15px] font-medium shadow-xs transition-all hover:border-primary/40 hover:bg-muted/50"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
      >
        <GoogleIcon className="mr-2 size-5" />
        {googleLoading ? "Connexion en cours..." : "Continuer avec Google"}
      </Button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">ou avec vos identifiants</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {mode === "otp" ? (
        <div className="space-y-3">
          <OtpLogin onSuccess={(user) => void goHome(user)} />
          <button
            type="button"
            onClick={() => setMode("password")}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Revenir au mot de passe
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FloatingField
            id="identifier"
            label="Email ou téléphone"
            autoComplete="username"
            required
            error={errors.identifier?.message}
            {...register("identifier")}
          />

          <div>
            <FloatingField
              id="password"
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              error={errors.password?.message}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
              {...register("password")}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setMode("otp")}
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Mot de passe oublié ? Recevoir un code SMS
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20"
            disabled={submitting}
          >
            {submitting ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
          Créer un compte GiyaX
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
