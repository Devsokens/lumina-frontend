"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Certificats de participation A · Classique, B · Moderne, C · Exécutif
// (refonte Claude Design, 2026-11). Format A4 paysage 1123 × 794 px, mis à
// l'échelle par <ScaledCertificate>. Polices : --font-ev (Geist),
// --font-ev-serif (Cormorant Garamond), --font-ev-mono (Geist Mono).

export type CertificateModel = "CLASSIC" | "MODERN" | "EXECUTIVE";

export const CERTIFICATE_MODELS: { id: CertificateModel; letter: string; label: string; hint: string }[] = [
  { id: "CLASSIC", letter: "A", label: "Classique", hint: "Cadre et sceau" },
  { id: "MODERN", letter: "B", label: "Moderne", hint: "Bandeau aux couleurs" },
  { id: "EXECUTIVE", letter: "C", label: "Exécutif", hint: "Sobre et éditorial" },
];

// Anciens identifiants enregistrés (avant la refonte) → nouveaux modèles.
export function certificateModelOf(value?: string | null): CertificateModel {
  switch (value) {
    case "MODERN":
    case "TECH_INNOVATION":
      return "MODERN";
    case "EXECUTIVE":
    case "CORPORATE_PRESTIGE":
    case "MINIMALIST_ECO":
      return "EXECUTIVE";
    default:
      return "CLASSIC";
  }
}

export type Signatory = { name?: string; role: string };

export type CertificateData = {
  org: string; // organisme émetteur
  tagline?: string;
  programme?: string; // sous-titre du modèle Exécutif
  participant: string;
  eventTitle: string;
  eventKind: string; // « la conférence-formation »
  dateLabel: string; // « 28 novembre 2026 »
  venue?: string | null;
  city?: string | null;
  formatLabel?: string;
  number: string; // « GA-CERT-2026-001 »
  issuedShort: string; // « 28 nov. 2026 »
  issuedLong: string; // « 28 novembre 2026 »
  year: string;
  mention?: string;
  signatories: Signatory[];
};

const SERIF = "var(--font-ev-serif), Georgia, serif";
const SANS = "var(--font-ev), system-ui, sans-serif";
const MONO = "var(--font-ev-mono), ui-monospace, monospace";

// Motif de QR du design (25 × 25, pseudo-aléatoire stable) : aperçu
// seulement, le code réel est apposé par le serveur à l'émission.
function qrCells(): boolean[] {
  const N = 25;
  const cells: boolean[] = [];
  let s = 7;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const finder = (r: number, c: number): boolean | null => {
    const box = (r0: number, c0: number) => {
      const y = r - r0;
      const x = c - c0;
      if (y < 0 || x < 0 || y > 6 || x > 6) return null;
      if (y === 0 || y === 6 || x === 0 || x === 6) return true;
      return y >= 2 && y <= 4 && x >= 2 && x <= 4;
    };
    const a = box(0, 0);
    const b = box(0, N - 7);
    const d = box(N - 7, 0);
    if (a !== null) return a;
    if (b !== null) return b;
    if (d !== null) return d;
    if ((r === 7 && (c < 8 || c > N - 9)) || (c === 7 && (r < 8 || r > N - 9)) || (r === N - 8 && c < 8) || (c === N - 8 && r < 8)) return false;
    return null;
  };
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const f = finder(r, c);
      cells.push(f === null ? rnd() > 0.52 : f);
    }
  return cells;
}
const QR = qrCells();

function QrArt({ size, padding, style }: { size: number; padding: number; style?: CSSProperties }) {
  return (
    <div
      role="img"
      aria-label="QR code de vérification"
      style={{ width: size, height: size, padding, boxSizing: "border-box", background: "#FFFFFF", display: "grid", gridTemplateColumns: "repeat(25, minmax(0, 1fr))", ...style }}
    >
      {QR.map((on, i) => (
        <span key={i} style={{ background: on ? "#16211C" : "transparent" }} />
      ))}
    </div>
  );
}

function SignatureBlock({ s, width, line, center }: { s: Signatory; width: number; line: string; center?: boolean }) {
  return (
    <div style={{ width, display: "flex", flexDirection: "column", alignItems: center ? "center" : "flex-start", gap: 6 }}>
      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 26, color: "#3F4A45", height: 34 }}>{s.name ? s.name : "[Signature]"}</span>
      <span style={{ alignSelf: "stretch", height: 1, background: line }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name || "[Nom du signataire]"}</span>
      <span style={{ fontSize: 12, color: "#5E6A64" }}>{s.role}</span>
    </div>
  );
}

const sig = (d: CertificateData, i: number): Signatory => d.signatories[i] ?? { role: i === 0 ? "Organisateur" : "Intervenant principal" };
const place = (d: CertificateData) => [d.venue, d.city].filter(Boolean).join(", ");

export function CertificateClassic({ d, primary = "#0C4A3A", gold = "#C79A3B" }: { d: CertificateData; primary?: string; gold?: string }) {
  const corner = (pos: CSSProperties) => <div style={{ position: "absolute", width: 22, height: 22, background: primary, ...pos }} />;
  return (
    <div style={{ width: 1123, height: 794, boxSizing: "border-box", position: "relative", background: "#FBF8F1", fontFamily: SANS, color: "#16211C", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 26, border: `2px solid ${primary}` }} />
      <div style={{ position: "absolute", inset: 34, border: `1px solid ${gold}` }} />
      {corner({ top: 26, left: 26 })}
      {corner({ top: 26, right: 26 })}
      {corner({ bottom: 26, left: 26 })}
      {corner({ bottom: 26, right: 26 })}

      <div style={{ position: "absolute", inset: "64px 96px 56px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, fontWeight: 600, letterSpacing: "0.32em", color: primary }}>
          <span style={{ width: 40, height: 1, background: gold }} />
          {d.org.toUpperCase()}
          <span style={{ width: 40, height: 1, background: gold }} />
        </div>
        <h1 style={{ margin: "28px 0 0", fontFamily: SERIF, fontSize: 64, fontWeight: 600, letterSpacing: "0.14em", lineHeight: 1, color: primary }}>CERTIFICAT</h1>
        <p style={{ margin: "6px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 26, color: "#8A5A0B" }}>de participation</p>
        <p style={{ margin: "34px 0 0", fontSize: 12, letterSpacing: "0.24em", color: "#5E6A64" }}>EST DÉCERNÉ À</p>
        <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 60, fontWeight: 600, lineHeight: 1.05 }}>{d.participant}</p>
        <span style={{ marginTop: 10, width: 280, height: 1, background: gold }} />
        <p style={{ margin: "20px 0 0", maxWidth: 700, fontSize: 16, lineHeight: 1.65, color: "#3F4A45" }}>
          {d.mention ? (
            d.mention
          ) : (
            <>
              pour sa participation à {d.eventKind} <b style={{ color: "#16211C" }}>« {d.eventTitle} »</b>, tenue le {d.dateLabel}
              {place(d) ? ` au ${place(d)}` : ""}.
            </>
          )}
        </p>

        <div style={{ marginTop: "auto", width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <SignatureBlock s={sig(d, 0)} width={230} line="#16211C" center />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ width: 112, height: 112, borderRadius: 999, background: gold, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 4px #FBF8F1, inset 0 0 0 5px #8A5A0B" }}>
              <div style={{ width: 84, height: 84, borderRadius: 999, border: "1px dashed #FFF6E3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#FFFFFF" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden>
                  <path d="m12 2 2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" />
                </svg>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", marginTop: 4 }}>CERTIFIÉ</span>
                <span style={{ fontFamily: MONO, fontSize: 10 }}>{d.year}</span>
              </div>
            </div>
          </div>
          <SignatureBlock s={sig(d, 1)} width={230} line="#16211C" center />
        </div>
      </div>

      <div style={{ position: "absolute", left: 56, bottom: 50, display: "flex", flexDirection: "column", gap: 2, fontSize: 10, color: "#5E6A64", textAlign: "left" }}>
        <span style={{ fontFamily: MONO, color: "#3F4A45" }}>N° {d.number}</span>
        <span>Délivré le {d.issuedShort}</span>
      </div>
      <div style={{ position: "absolute", right: 56, bottom: 50, display: "flex", alignItems: "flex-end", gap: 10 }}>
        <span style={{ fontSize: 10, color: "#5E6A64", textAlign: "right", lineHeight: 1.4 }}>
          Vérifier
          <br />
          l&apos;authenticité
        </span>
        <QrArt size={62} padding={4} />
      </div>
    </div>
  );
}

export function CertificateModern({ d, primary = "#0C4A3A", accent = "#E39A1F" }: { d: CertificateData; primary?: string; accent?: string }) {
  const info = (label: string, value: ReactNode, size = 15) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11, letterSpacing: "0.16em", color: "#BFD8CD" }}>{label}</span>
      <span style={{ fontSize: size, fontWeight: size > 15 ? 600 : 400, lineHeight: 1.35 }}>{value}</span>
    </div>
  );
  return (
    <div style={{ width: 1123, height: 794, boxSizing: "border-box", display: "flex", background: "#FFFFFF", fontFamily: SANS, color: "#16211C", overflow: "hidden" }}>
      <aside style={{ width: 340, flex: "none", position: "relative", background: primary, color: "#FFFFFF", padding: "56px 44px", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <svg width="420" height="420" viewBox="0 0 420 420" aria-hidden style={{ position: "absolute", right: -210, top: -150, opacity: 0.14 }}>
          {[200, 160, 120, 80].map((r) => (
            <circle key={r} cx="210" cy="210" r={r} fill="none" stroke="#FFFFFF" />
          ))}
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.28em" }}>{d.org.toUpperCase()}</span>
        {d.tagline && <span style={{ marginTop: 6, fontSize: 12, color: "#BFD8CD" }}>{d.tagline}</span>}
        <div style={{ marginTop: 72, display: "flex", flexDirection: "column", gap: 22 }}>
          {info("ÉVÉNEMENT", d.eventTitle, 17)}
          {info("DATE", d.dateLabel)}
          {place(d) && info("LIEU", place(d))}
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 14 }}>
          <QrArt size={76} padding={5} style={{ borderRadius: 6 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "#BFD8CD", lineHeight: 1.4 }}>
            <span style={{ fontFamily: MONO, color: "#FFFFFF" }}>{d.number}</span>
            <span>
              Scannez pour vérifier
              <br />
              l&apos;authenticité
            </span>
          </div>
        </div>
      </aside>
      <main style={{ flex: 1, padding: "64px 72px 56px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 32, height: 3, background: accent }} />
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.22em", color: "#8A5A0B" }}>CERTIFICAT DE PARTICIPATION</span>
        </div>
        <p style={{ margin: "64px 0 0", fontSize: 15, color: "#5E6A64" }}>Ce certificat atteste que</p>
        <p style={{ margin: "10px 0 0", fontSize: 64, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.02 }}>{d.participant}</p>
        <p style={{ margin: "26px 0 0", maxWidth: 580, fontSize: 17, lineHeight: 1.65, color: "#3F4A45" }}>
          {d.mention ? (
            d.mention
          ) : (
            <>
              a pris part avec assiduité à {d.eventKind} <b style={{ color: "#16211C" }}>{d.eventTitle}</b> et en a suivi l&apos;ensemble du programme.
            </>
          )}
        </p>
        <div style={{ marginTop: "auto", display: "flex", gap: 48, alignItems: "flex-end" }}>
          <SignatureBlock s={sig(d, 0)} width={220} line="#D9D6CC" />
          <SignatureBlock s={sig(d, 1)} width={220} line="#D9D6CC" />
          <div style={{ marginLeft: "auto", width: 84, height: 84, borderRadius: 999, border: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#8A5A0B" }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <circle cx="12" cy="9" r="6" />
              <path d="m8.5 14-1.5 8 5-3 5 3-1.5-8" />
              <path d="m9.5 9 1.8 1.8L14.8 7.5" />
            </svg>
          </div>
        </div>
        <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid #EFEDE6", display: "flex", justifyContent: "space-between", fontSize: 11, color: "#5E6A64" }}>
          <span>Délivré le {d.issuedLong}</span>
          <span>Attestation numérique certifiée</span>
        </div>
      </main>
    </div>
  );
}

export function CertificateExecutive({ d, primary = "#0C4A3A", gold = "#C79A3B" }: { d: CertificateData; primary?: string; gold?: string }) {
  const cell = (label: string, value: string, first?: boolean) => (
    <div style={{ padding: first ? "14px 0" : "14px 0 14px 20px", borderLeft: first ? undefined : "1px solid #E7E5DE", display: "flex", flexDirection: "column", gap: 4 }}>
      <dt style={{ fontSize: 11, letterSpacing: "0.14em", color: "#5E6A64" }}>{label}</dt>
      <dd style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{value}</dd>
    </div>
  );
  return (
    <div style={{ width: 1123, height: 794, boxSizing: "border-box", position: "relative", background: "#FFFFFF", fontFamily: SANS, color: "#16211C", padding: "64px 80px 56px 96px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: primary }} />
      <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, width: 4, background: gold }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.26em", color: primary }}>{d.org.toUpperCase()}</span>
          {d.programme && <span style={{ fontSize: 12, color: "#5E6A64" }}>{d.programme}</span>}
        </div>
        <span style={{ fontFamily: MONO, fontSize: 12, color: "#5E6A64" }}>N° {d.number}</span>
      </div>
      <div style={{ marginTop: 76, display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.22em", color: "#5E6A64" }}>CERTIFICAT DE PARTICIPATION</span>
        <span style={{ marginTop: 18, fontFamily: SERIF, fontSize: 92, fontWeight: 600, lineHeight: 0.95, letterSpacing: "-0.01em" }}>{d.participant}</span>
        <span style={{ marginTop: 24, width: 72, height: 2, background: gold }} />
        <p style={{ margin: "24px 0 0", maxWidth: 640, fontSize: 17, lineHeight: 1.65, color: "#3F4A45" }}>
          {d.mention ? (
            d.mention
          ) : (
            <>
              a participé à {d.eventKind} <b style={{ color: "#16211C" }}>{d.eventTitle}</b> et en a suivi l&apos;intégralité du programme.
            </>
          )}
        </p>
      </div>
      <dl style={{ margin: "48px 0 0", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", borderTop: "1px solid #E7E5DE", borderBottom: "1px solid #E7E5DE" }}>
        {cell("DATE", d.dateLabel, true)}
        {cell("LIEU", d.city ? `${d.city}, Gabon` : d.venue || "—")}
        {cell("FORMAT", d.formatLabel || "Présentiel")}
      </dl>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 56 }}>
        <SignatureBlock s={sig(d, 0)} width={220} line="#16211C" />
        <SignatureBlock s={sig(d, 1)} width={220} line="#16211C" />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "right", fontSize: 11, color: "#5E6A64", lineHeight: 1.45 }}>
            <span style={{ fontWeight: 600, color: "#16211C" }}>Vérification</span>
            <span>
              Scannez le code pour
              <br />
              confirmer ce certificat
            </span>
          </div>
          <QrArt size={80} padding={4} style={{ border: "1px solid #E7E5DE" }} />
        </div>
      </div>
    </div>
  );
}

export function Certificate({ model, d }: { model: CertificateModel; d: CertificateData }) {
  if (model === "MODERN") return <CertificateModern d={d} />;
  if (model === "EXECUTIVE") return <CertificateExecutive d={d} />;
  return <CertificateClassic d={d} />;
}

// Certificat 1123 × 794 réduit à la largeur de son conteneur.
export function ScaledCertificate({ model, d, className }: { model: CertificateModel; d: CertificateData; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.22);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 1123);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ position: "relative", width: "100%", aspectRatio: "1123 / 794", overflow: "hidden" }}>
      <div style={{ width: 1123, height: 794, transform: `scale(${scale})`, transformOrigin: "0 0", position: "absolute", left: 0, top: 0 }}>
        <Certificate model={model} d={d} />
      </div>
    </div>
  );
}

// Données d’un certificat à partir de l’événement (aperçu : participant
// d’exemple, numéro d’exemple ; les vrais certificats sont émis par le serveur).
const EVENT_KIND: Record<string, string> = {
  CONFERENCE: "la conférence-formation",
  CONCERT: "le concert",
  NIGHTLIFE: "la soirée",
  EXHIBITION: "le salon",
  SPORTS: "la compétition",
  SHOW: "le spectacle",
  WEDDING: "la célébration",
};

export function certificateDataFor(
  e: { title: string; startDate: string; venueName?: string | null; location?: string | null; eventType?: string | null },
  opts: { org: string; participant: string; tagline?: string; programme?: string; signatories?: Signatory[]; mention?: string; issuedAt?: Date }
): CertificateData {
  const start = new Date(e.startDate);
  const issued = opts.issuedAt ?? start;
  return {
    org: opts.org,
    tagline: opts.tagline,
    programme: opts.programme,
    participant: opts.participant,
    eventTitle: e.title,
    eventKind: EVENT_KIND[e.eventType ?? ""] ?? "l’événement",
    dateLabel: start.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    venue: e.venueName,
    city: e.location,
    number: `GA-CERT-${start.getFullYear()}-001`,
    issuedShort: issued.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
    issuedLong: issued.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    year: String(start.getFullYear()),
    mention: opts.mention,
    signatories: opts.signatories ?? [],
  };
}
