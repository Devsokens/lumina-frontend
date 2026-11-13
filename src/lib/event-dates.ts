// Dates d'un événement, d'une soirée ou de plusieurs jours, toujours à
// l'heure de Libreville (même rendu pour un visiteur à l'étranger).
// Même logique que le serveur (backend src/common/event-dates.ts) pour les
// billets PDF et les e-mails.

const TZ = "Africa/Libreville";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function parts(d: Date) {
  const f = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const get = (t: string) => f.find((p) => p.type === t)?.value ?? "";
  return { y: get("year"), m: get("month"), d: get("day") };
}

const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleString("fr-FR", { timeZone: TZ, ...o });
export const eventTime = (d: Date) => fmt(d, { hour: "2-digit", minute: "2-digit" });

function toDate(v: string | Date | null | undefined): Date | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Plusieurs jours : la fin tombe un autre jour que le début (Libreville).
export function isMultiDay(start: string | Date, end?: string | Date | null): boolean {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return false;
  const a = parts(s);
  const b = parts(e);
  return a.y !== b.y || a.m !== b.m || a.d !== b.d;
}

// Libellé complet :
// « Samedi 15 novembre 2026 · 19:00 », « … · 19:00 – 23:00 »,
// « Du lundi 10 au dimanche 16 novembre 2026 »,
// « Du vendredi 28 novembre au mercredi 3 décembre 2026 ».
export function formatEventPeriod(start: string | Date, end?: string | Date | null, withTime = true): string {
  const s = toDate(start);
  if (!s) return "";
  const e = toDate(end);
  if (!e || !isMultiDay(s, e)) {
    const day = cap(fmt(s, { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    if (!withTime) return day;
    const sameTime = !e || eventTime(e) === eventTime(s);
    return `${day} · ${eventTime(s)}${sameTime ? "" : ` – ${eventTime(e)}`}`;
  }
  const a = parts(s);
  const b = parts(e);
  const endLabel = fmt(e, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const startLabel =
    a.y !== b.y
      ? fmt(s, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : a.m !== b.m
        ? fmt(s, { weekday: "long", day: "numeric", month: "long" })
        : fmt(s, { weekday: "long", day: "numeric" });
  return `Du ${startLabel} au ${endLabel}`;
}

// Libellé court pour les listes et cartes :
// « Sam. 15 nov. 2026 », « 10 – 16 nov. 2026 », « 28 nov. – 3 déc. 2026 ».
export function formatEventPeriodShort(start: string | Date, end?: string | Date | null): string {
  const s = toDate(start);
  if (!s) return "";
  const e = toDate(end);
  if (!e || !isMultiDay(s, e)) return cap(fmt(s, { weekday: "short", day: "numeric", month: "short", year: "numeric" }));
  const a = parts(s);
  const b = parts(e);
  const endLabel = fmt(e, { day: "numeric", month: "short", year: "numeric" });
  const startLabel = a.y !== b.y ? fmt(s, { day: "numeric", month: "short", year: "numeric" }) : a.m !== b.m ? fmt(s, { day: "numeric", month: "short" }) : fmt(s, { day: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

// Pastille de calendrier (jour / mois) : « 15 · NOV » ou « 10–16 · NOV ».
export function eventBadge(start: string | Date, end?: string | Date | null): { day: string; month: string } {
  const s = toDate(start) ?? new Date();
  const e = toDate(end);
  const month = (d: Date) => fmt(d, { month: "short" }).replace(".", "").toUpperCase();
  const day = (d: Date) => String(Number(parts(d).d));
  if (!e || !isMultiDay(s, e)) return { day: day(s), month: month(s) };
  const sameMonth = parts(s).m === parts(e).m && parts(s).y === parts(e).y;
  return { day: `${day(s)}–${day(e)}`, month: sameMonth ? month(s) : `${month(s)}–${month(e)}` };
}
