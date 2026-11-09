import { z } from "zod";
import { SECTORS } from "@/lib/constants";
import { isReservedSlug } from "@/lib/tenant-url";

// Zod obligatoire sur tous les formulaires — LUMINA_FRONTEND_CONTEXT.md 4.4,
// LUMINA_Audit_Menaces_Complet.md 7.1 (mass assignment).

export const loginSchema = z.object({
  identifier: z.string().min(3, "Email ou téléphone requis"),
  password: z.string().min(8, "8 caractères minimum"),
});

// Adresse du site public : elle devient un sous-domaine (nom.giyax.com), donc
// un libellé DNS valide (pas de tiret au début ni à la fin), et ne doit pas
// prendre un nom réservé par l'application (www, admin, login…).
export const slugSchema = z
  .string({ required_error: "Adresse requise" })
  .min(3, "3 caractères minimum")
  .max(50, "50 caractères maximum")
  .regex(/^[a-z0-9-]+$/, "Uniquement lettres minuscules, chiffres et tirets")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Pas de tiret au début, à la fin, ni deux à la suite")
  .refine((v) => !isReservedSlug(v), "Cette adresse est réservée, choisissez-en une autre");

export const signupSchema = z.object({
  fullName: z
    .string({ required_error: "Nom requis" })
    .min(2, "Nom requis (2 caractères minimum)")
    .max(120, "120 caractères maximum"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  // Espaces, points, tirets et parenthèses tolérés à la saisie.
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^\+?[0-9]{8,15}$/.test(v.replace(/[\s.()-]/g, "")), "Numéro invalide"),
  password: z
    .string()
    .min(8, "8 caractères minimum")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
  businessName: z
    .string({ required_error: "Nom de l'activité requis" })
    .min(2, "Nom de l'activité requis")
    .max(120, "120 caractères maximum"),
  slug: slugSchema,
  sector: z.enum(SECTORS),
  acceptedTerms: z.literal(true, {
    invalid_type_error: "Vous devez accepter les CGU",
  }),
}).refine((v) => !!v.email || !!v.phone, {
  message: "Renseignez un e-mail ou un téléphone",
  path: ["email"],
});

export const otpRequestSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, "Numéro invalide"),
});

export const otpVerifySchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{8,15}$/),
  code: z.string().length(6, "Code à 6 chiffres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(8, "8 caractères minimum")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Mot de passe oublié : adresse, puis code reçu par e-mail + nouveau mot de passe.
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide").max(254),
});

export const resetPasswordSchema = z
  .object({
    code: z.string().regex(/^[0-9]{6}$/, "Le code comporte 6 chiffres"),
    newPassword: z
      .string()
      .min(8, "8 caractères minimum")
      .max(128, "128 caractères maximum")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
