import type { MessageKind, MessageTemplate } from "@/hooks/useAdmin";

// Messages envoyés aux participants (Paramètres · E-mails et messages).
// Textes par défaut identiques à ceux du serveur
// (src/modules/notifications/custom-messages.ts, backend). Variables :
// {Prénom} {Événement} {Date} {Lieu} ; **gras**, *italique*.

export const DEFAULT_MESSAGES: Record<MessageKind, MessageTemplate> = {
  ticket: {
    subject: "Votre pass pour {Événement}",
    body: "Bonjour {Prénom},\nVotre réservation est **confirmée** ! Présentez le QR code de votre billet à l'entrée de {Événement}, le {Date}.",
    cta: "Voir mon pass",
    enabled: true,
  },
  certificate: {
    subject: "Votre attestation pour {Événement}",
    body: "Bonjour {Prénom},\nMerci d'avoir participé à {Événement}. Votre attestation certifiée est jointe à ce message : vous pouvez la télécharger ou la partager.",
    cta: "Télécharger mon attestation",
    enabled: true,
  },
  reminder: {
    subject: "C'est demain : {Événement}",
    body: "Bonjour {Prénom},\nRendez-vous demain à {Lieu} pour {Événement}. Gardez votre QR code à portée de main.",
    cta: "Voir mon pass",
    enabled: false,
  },
  survey: {
    subject: "Votre avis sur {Événement}",
    body: "Bonjour {Prénom},\nMerci d'être venu à {Événement} ! Deux minutes pour nous dire ce que vous en avez pensé ?",
    cta: "Donner mon avis",
    enabled: false,
  },
};

export const MESSAGE_META: Record<MessageKind, { name: string; when: string; note?: string; locked?: boolean; soon?: boolean }> = {
  ticket: { name: "Billet et pass QR", when: "Après le paiement", note: "Toujours envoyé, avec les billets en PDF.", locked: true },
  certificate: { name: "Certificat", when: "À l'envoi des attestations", note: "Envoyé avec l'attestation en PDF quand vous l'envoyez." },
  reminder: { name: "Rappel", when: "La veille, 18:00", note: "Envoyé automatiquement la veille à 18 h aux participants qui ont donné leur e-mail." },
  survey: { name: "Avis et questionnaire", when: "Le lendemain", soon: true },
};

export const MESSAGE_VARS = ["Prénom", "Événement", "Date", "Lieu"] as const;
