import type {
  CertificateTemplate,
  EventType,
  QuestionnaireQuestion,
  TicketTemplate,
  TicketType,
} from "@/types/api";

// Brouillon du formulaire d'événement (localStorage, par compte et par
// événement). Écrit en continu pendant la saisie, effacé après publication.
export type EventDraft = {
  currentStep: 1 | 2 | 3 | 4;
  uploadedImage: string | null;
  selectedType: EventType;
  hasCert: boolean;
  selectedCertTemplate: CertificateTemplate;
  selectedTicketTemplate: TicketTemplate;
  ticketFormulas: TicketType[];
  hasQuestionnaire: boolean;
  questions: QuestionnaireQuestion[];
  values: Record<string, unknown>;
  savedAt: string;
};

export function readEventDraft(key: string): EventDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as EventDraft) : null;
  } catch {
    return null;
  }
}

// Renvoie l'heure d'enregistrement, ou null si le stockage est indisponible
// ou plein (affiche volumineuse) : on réessaie alors sans l'affiche.
export function writeEventDraft(key: string, draft: Omit<EventDraft, "savedAt">): string | null {
  const savedAt = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  try {
    localStorage.setItem(key, JSON.stringify({ ...draft, savedAt }));
    return savedAt;
  } catch {
    try {
      localStorage.setItem(key, JSON.stringify({ ...draft, uploadedImage: null, savedAt }));
      return savedAt;
    } catch {
      return null;
    }
  }
}

export function clearEventDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // stockage indisponible : rien à effacer
  }
}
