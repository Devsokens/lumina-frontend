"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingField } from "@/components/shared/floating-field";
import { homePathFor, useAuth } from "@/hooks/useAuth";
import { apiError } from "@/lib/api";
import { LEGAL } from "@/lib/legal";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations";

// Mot de passe oublié : 1) adresse e-mail → code à 6 chiffres envoyé par
// GiyaX ; 2) code + nouveau mot de passe, puis connexion directe.
// Le serveur répond pareil que l'adresse ait un compte ou non.

// Un envoi par minute côté serveur : le bouton « Renvoyer » attend autant.
const RESEND_SECONDS = 60;

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPassword />
    </Suspense>
  );
}

function ForgotPassword() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);

  if (!email) return <EmailStep initial={searchParams.get("email") ?? ""} onSent={setEmail} />;
  return <ResetStep email={email} onChangeEmail={() => setEmail(null)} />;
}

function EmailStep({ initial, onSent }: { initial: string; onSent: (email: string) => void }) {
  const { requestPasswordReset } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: initial } });

  async function onSubmit(values: ForgotPasswordInput) {
    const email = values.email.trim().toLowerCase();
    try {
      await requestPasswordReset(email);
      onSent(email);
    } catch (err) {
      toast.error(apiError(err, "Envoi du code impossible. Réessayez dans un instant."));
    }
  }

  return (
    <div>
      <BackToLogin />
      <h1 className="mt-5 font-display text-[28px] font-bold leading-tight text-foreground">Mot de passe oublié</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Saisissez l&apos;adresse e-mail de votre compte : nous vous envoyons un code pour choisir un nouveau mot de passe.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <FloatingField
          id="email"
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          autoFocus
          error={errors.email?.message}
          {...register("email")}
        />
        <Button type="submit" className="h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20" disabled={isSubmitting}>
          {isSubmitting ? "Envoi…" : "Recevoir un code"}
        </Button>
      </form>
      <SupportNote />
    </div>
  );
}

function ResetStep({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) {
  const router = useRouter();
  const { requestPasswordReset, resetPassword, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [wait, setWait] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function resend() {
    setResending(true);
    try {
      await requestPasswordReset(email);
      setWait(RESEND_SECONDS);
      setValue("code", "");
      toast.success("Nouveau code envoyé. Seul le dernier code reçu est valable.");
    } catch (err) {
      toast.error(apiError(err, "Envoi du code impossible."));
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(values: ResetPasswordInput) {
    try {
      await resetPassword({ email, code: values.code, newPassword: values.newPassword });
    } catch (err) {
      toast.error(apiError(err, "Code incorrect ou expiré."));
      return;
    }
    toast.success("Mot de passe modifié.");
    // Connexion directe avec le nouveau mot de passe ; sinon, page de connexion
    // avec l'adresse déjà remplie.
    try {
      const user = await login({ email, password: values.newPassword });
      // null : plusieurs comptes (un par secteur), écran de choix déjà ouvert.
      if (user) router.replace(user.mustChangePassword ? "/change-password" : await homePathFor(user));
    } catch {
      router.replace(`/login?login=${encodeURIComponent(email)}`);
    }
  }

  return (
    <div>
      <BackToLogin />
      <span className="mt-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <MailCheck className="size-6" />
      </span>
      <h1 className="mt-4 font-display text-[28px] font-bold leading-tight text-foreground">Vérifiez vos e-mails</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Si un compte GiyaX utilise <strong className="font-semibold text-foreground">{email}</strong>, un code à 6 chiffres vient d&apos;y être envoyé. Il
        est valable 15 minutes. Pensez à regarder dans les courriers indésirables.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <FloatingField
          id="code"
          label="Code reçu par e-mail"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          autoFocus
          className="font-mono tracking-[0.4em]"
          error={errors.code?.message}
          {...register("code", {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
            },
          })}
        />
        <FloatingField
          id="newPassword"
          label="Nouveau mot de passe"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          error={errors.newPassword?.message}
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
          {...register("newPassword")}
        />
        <FloatingField
          id="confirm"
          label="Confirmer le mot de passe"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          error={errors.confirm?.message}
          {...register("confirm")}
        />
        <p className="text-xs text-muted-foreground">8 caractères minimum, dont une majuscule et un chiffre.</p>
        <Button type="submit" className="h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : "Changer le mot de passe"}
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
        <button
          type="button"
          onClick={() => void resend()}
          disabled={wait > 0 || resending}
          className="font-medium text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {resending ? "Envoi…" : wait > 0 ? `Renvoyer le code (${wait} s)` : "Renvoyer le code"}
        </button>
        <button type="button" onClick={onChangeEmail} className="font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          Changer d&apos;adresse
        </button>
      </div>
      <SupportNote />
    </div>
  );
}

function BackToLogin() {
  return (
    <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> Retour à la connexion
    </Link>
  );
}

function SupportNote() {
  return (
    <p className="mt-6 text-center text-xs text-muted-foreground">
      Plus accès à cette adresse e-mail ?{" "}
      <a href={`mailto:${LEGAL.email}?subject=${encodeURIComponent("Accès à mon compte")}`} className="font-semibold text-primary underline-offset-4 hover:underline">
        Contactez le support
      </a>
    </p>
  );
}
