"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthGuard } from "@/components/shared/auth-guard";
import { useAuth } from "@/hooks/useAuth";
import { apiError } from "@/lib/api";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations";
import { useAuthStore } from "@/stores/useAuthStore";

// Obligatoire à la première connexion d'un membre (mot de passe temporaire
// donné par l'OWNER). Le backend ferme ensuite toutes les sessions.
function ChangePasswordForm() {
  const router = useRouter();
  const { changePassword } = useAuth();
  const mustChange = useAuthStore((s) => s.user?.mustChangePassword);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordInput) {
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success("Mot de passe modifié. Reconnectez-vous avec le nouveau mot de passe.");
      router.replace("/login");
    } catch (err) {
      toast.error(apiError(err, "Mot de passe actuel incorrect."));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <h1 className="font-display text-2xl font-bold">Changer de mot de passe</h1>
      {mustChange && (
        <p className="rounded-xl border border-warning/50 bg-warning/10 p-3 text-sm">
          Votre compte a été créé avec un mot de passe temporaire : choisissez le vôtre pour continuer.
        </p>
      )}
      {(
        [
          ["currentPassword", "Mot de passe actuel", "current-password"],
          ["newPassword", "Nouveau mot de passe", "new-password"],
          ["confirm", "Confirmer le nouveau mot de passe", "new-password"],
        ] as const
      ).map(([name, label, autoComplete]) => (
        <div key={name} className="space-y-1.5">
          <Label htmlFor={name}>{label}</Label>
          <Input
            id={name}
            type="password"
            autoComplete={autoComplete}
            className="h-11 rounded-xl"
            {...register(name)}
          />
          {errors[name] && <p className="text-sm text-destructive">{errors[name]?.message}</p>}
        </div>
      ))}
      <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}

export default function ChangePasswordPage() {
  return (
    <AuthGuard>
      <ChangePasswordForm />
    </AuthGuard>
  );
}
