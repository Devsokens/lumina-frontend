import type { Event, EventStatus, EventType, QuestionType, TicketTemplate, TicketType } from "@/types/api";
import type { ApiEvent } from "@/types/events";
import { certificateModelOf, type CertificateModel } from "@/components/events/certificates";
import type {
  CertificateChannels,
  CertificateRecipientsMode,
  CertificateSendMode,
  CertificateSignatory,
  EventFormat,
  EventLogo,
  PosterCrops,
  ProgramItem,
  Speaker,
} from "@/lib/events";
import { defaultTemplateFor } from "@/lib/ticket-templates";

// État de l'éditeur d'événement (4 étapes, refonte 2026-11) et conversion
// vers le format envoyé par useSaveEvent.

export type EditorQuestion = { id: string; title: string; type: QuestionType; options?: string[]; isRequired: boolean };

export type EditorFormula = TicketType & {
  maxPerOrder?: number;
  visible?: boolean;
};

export type EditorForm = {
  status: EventStatus;
  eventType: EventType | null;
  title: string;
  description: string;
  imageUrl: string;
  posterCrops: PosterCrops;
  logos: EventLogo[];
  logosDisplay: { vitrine: boolean; billets: boolean; certificats: boolean };
  startDay: string; // AAAA-MM-JJ
  startTime: string; // HH:MM
  endDay: string;
  endTime: string;
  venueName: string;
  city: string;
  // Point sur la carte (facultatif).
  coords: { lat: number; lng: number } | null;
  format: EventFormat;
  formulas: EditorFormula[];
  ticketTemplate: TicketTemplate;
  ticketColor: string;
  ticketShowPrice: boolean;
  ticketShowLogo: boolean;
  questionnaireEnabled: boolean;
  questions: EditorQuestion[];
  hasCertificate: boolean;
  certificateModel: CertificateModel;
  certificateTitle: string;
  certificateIssuer: string;
  certificateSignatories: [CertificateSignatory, CertificateSignatory];
  certificateRecipients: CertificateRecipientsMode;
  certificateSendMode: CertificateSendMode;
  certificateChannels: CertificateChannels;
  notifyParticipants: boolean;
  // Page publique de l'événement.
  program: ProgramItem[];
  speakers: Speaker[];
  album: string[];
};

const pad = (n: number) => String(n).padStart(2, "0");
const dayOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const timeOf = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function newId(prefix = "q") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function formFromEvent(e: ApiEvent | null, issuer: string): EditorForm {
  const defaultLogos: EventLogo[] = [
    { id: "logo-main", name: issuer, role: "MAIN_ORGANIZER", imageUrl: null },
  ];
  const defaultSigs: [CertificateSignatory, CertificateSignatory] = [
    { name: "", role: "Organisateur" },
    { name: "", role: "Intervenant principal" },
  ];

  if (!e) {
    const start = new Date();
    start.setDate(start.getDate() + 14);
    start.setHours(19, 0, 0, 0);
    return {
      status: "DRAFT",
      eventType: "CONCERT",
      title: "",
      description: "",
      imageUrl: "",
      posterCrops: { portrait45: "center", square11: "center", banner169: "center" },
      logos: defaultLogos,
      logosDisplay: { vitrine: true, billets: true, certificats: true },
      startDay: dayOf(start),
      startTime: "19:00",
      endDay: dayOf(start),
      endTime: "23:00",
      venueName: "",
      city: "Libreville",
      coords: null,
      format: "ONSITE",
      formulas: [],
      ticketTemplate: defaultTemplateFor("CONCERT"),
      ticketColor: "#0C4A3A",
      ticketShowPrice: true,
      ticketShowLogo: true,
      questionnaireEnabled: false,
      questions: [],
      hasCertificate: false,
      certificateModel: "CLASSIC",
      certificateTitle: "Certificat de participation",
      certificateIssuer: issuer,
      certificateSignatories: defaultSigs,
      certificateRecipients: "PRESENT_ONLY",
      certificateSendMode: "AUTO_NEXT_DAY",
      certificateChannels: { email: true, whatsapp: true, portal: false },
      notifyParticipants: true,
      program: [],
      speakers: [],
      album: [],
    };
  }
  const start = new Date(e.startDate);
  const end = e.endDate ? new Date(e.endDate) : null;
  const s = e.settings ?? {};
  return {
    status: e.status,
    eventType: e.eventType,
    title: e.title,
    description: e.description ?? "",
    imageUrl: e.imageUrl ?? "",
    posterCrops: s.posterCrops ?? { portrait45: "center", square11: "center", banner169: "center" },
    logos: s.logos && s.logos.length > 0 ? s.logos : defaultLogos,
    logosDisplay: s.logosDisplay ?? { vitrine: true, billets: true, certificats: true },
    program: s.program ?? [],
    speakers: s.speakers ?? [],
    album: s.album ?? [],
    startDay: dayOf(start),
    startTime: timeOf(start),
    endDay: end ? dayOf(end) : "",
    endTime: end ? timeOf(end) : "",
    venueName: e.venueName ?? "",
    city: e.location ?? "",
    coords: e.lat != null && e.lng != null ? { lat: e.lat, lng: e.lng } : null,
    format: s.format ?? "ONSITE",
    formulas: e.ticketTypes.map((t) => ({
      id: t.id,
      eventId: t.eventId,
      name: t.name,
      price: t.price,
      quantity: t.quantity,
      sold: t.sold,
      description: t.description,
      saleEndsAt: t.saleEndsAt ?? null,
      ticketTemplate: (t.template as TicketTemplate | null) ?? undefined,
      maxPerOrder: t.maxPerOrder ?? undefined,
      visible: t.visible ?? true,
    })),
    ticketTemplate: (s.ticketTemplate as TicketTemplate | undefined) ?? defaultTemplateFor(e.eventType ?? undefined),
    ticketColor: s.ticketColor ?? "#0C4A3A",
    ticketShowPrice: s.ticketShowPrice ?? true,
    ticketShowLogo: s.ticketShowLogo ?? true,
    questionnaireEnabled: s.questionnaireEnabled ?? false,
    questions: (s.questionnaire ?? []).map((q) => ({ id: q.id, title: q.title, type: q.type, options: q.options, isRequired: q.isRequired })),
    hasCertificate: s.hasCertificate ?? false,
    certificateModel: certificateModelOf(s.certificateTemplate),
    certificateTitle: s.certificateTitle ?? "Certificat de participation",
    certificateIssuer: s.certificateIssuer ?? issuer,
    certificateSignatories: s.certificateSignatories ?? defaultSigs,
    certificateRecipients: s.certificateRecipients ?? "PRESENT_ONLY",
    certificateSendMode: s.certificateSendMode ?? "AUTO_NEXT_DAY",
    certificateChannels: s.certificateChannels ?? { email: true, whatsapp: true, portal: false },
    notifyParticipants: true,
  };
}

// Date + heure locales (Libreville) → ISO.
function toIso(day: string, time: string) {
  if (!day) return undefined;
  const [y, m, d] = day.split("-").map(Number);
  const [h, min] = (time || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, h, min).toISOString();
}

export function capacityOf(form: EditorForm) {
  return form.formulas.reduce((n, f) => n + (f.quantity || 0), 0);
}

export function potentialOf(form: EditorForm) {
  return form.formulas.reduce((n, f) => n + f.price * f.quantity, 0);
}

export function toEventForm(form: EditorForm): Partial<Event> {
  const capacity = capacityOf(form);
  const questionnaire = form.questions.map((q) => ({
    id: q.id,
    title: q.title.trim(),
    type: q.type,
    isRequired: q.isRequired,
    ...(q.options && q.options.length ? { options: q.options.filter((o) => o.trim()) } : {}),
  }));
  return {
    status: form.status,
    title: form.title.trim(),
    description: form.description.trim() || null,
    imageUrl: form.imageUrl || null,
    startDate: toIso(form.startDay, form.startTime) ?? new Date().toISOString(),
    endDate: toIso(form.endDay, form.endTime) ?? null,
    venueName: form.venueName.trim() || null,
    location: form.city.trim() || null,
    lat: form.coords?.lat ?? null,
    lng: form.coords?.lng ?? null,
    eventType: form.eventType ?? undefined,
    capacity: capacity > 0 ? capacity : null,
    ticketTypes: form.formulas,
    ticketTemplate: form.ticketTemplate,
    questionnaireEnabled: form.questionnaireEnabled,
    questionnaire,
    hasCertificate: form.hasCertificate,
    certificateTemplate: form.certificateModel,
    notifyParticipants: form.notifyParticipants,
    settings: {
      questionnaireEnabled: form.questionnaireEnabled,
      questionnaire,
      hasCertificate: form.hasCertificate,
      certificateTemplate: form.certificateModel,
      ticketTemplate: form.ticketTemplate,
      format: form.format,
      logos: form.logos,
      logosDisplay: form.logosDisplay,
      posterCrops: form.posterCrops,
      ticketColor: form.ticketColor,
      ticketShowPrice: form.ticketShowPrice,
      ticketShowLogo: form.ticketShowLogo,
      certificateTitle: form.certificateTitle.trim() || "Certificat de participation",
      certificateIssuer: form.certificateIssuer.trim(),
      certificateSignatories: form.certificateSignatories,
      certificateRecipients: form.certificateRecipients,
      certificateSendMode: form.certificateSendMode,
      certificateChannels: form.certificateChannels,
      program: form.program.filter((p) => p.title.trim()).map((p) => ({ ...p, time: p.time.trim(), title: p.title.trim(), detail: p.detail?.trim() || undefined })),
      speakers: form.speakers.filter((p) => p.name.trim()).map((p) => ({ ...p, name: p.name.trim(), role: p.role?.trim() || undefined, photoUrl: p.photoUrl || null })),
      album: form.album,
    },
  };
}

// Durée affichée sous les dates : « durée 9 h », « durée 2 j ».
export function durationLabel(form: EditorForm) {
  const start = toIso(form.startDay, form.startTime);
  const end = toIso(form.endDay, form.endTime);
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return "la fin doit être après le début";
  const hours = Math.round(ms / 3_600_000);
  return hours < 48 ? `durée ${hours} h` : `durée ${Math.round(hours / 24)} j`;
}

export type StepState = "done" | "warn" | "todo";

export function stepStates(form: EditorForm): [StepState, StepState, StepState, StepState] {
  const infos = form.title.trim().length >= 2 && !!form.startDay && !!form.venueName.trim();
  const tickets = form.formulas.length > 0;
  const quiz = !form.questionnaireEnabled || (form.questions.length > 0 && form.questions.every((q) => q.title.trim()));
  return [infos ? "done" : "warn", tickets ? "done" : "warn", quiz ? "done" : "warn", "done"];
}
