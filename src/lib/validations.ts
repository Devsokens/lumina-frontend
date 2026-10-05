import { z } from "zod";
import { SECTORS } from "@/lib/constants";

// Zod obligatoire sur tous les formulaires — LUMINA_FRONTEND_CONTEXT.md 4.4,
// LUMINA_Audit_Menaces_Complet.md 7.1 (mass assignment).

export const loginSchema = z.object({
  identifier: z.string().min(3, "Email ou téléphone requis"),
  password: z.string().min(8, "8 caractères minimum"),
});

export const signupSchema = z.object({
  fullName: z.string().min(2).max(120),
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
  businessName: z.string().min(2).max(120),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Uniquement lettres minuscules, chiffres et tirets"),
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
