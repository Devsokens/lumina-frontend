"use client";

import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin } from "lucide-react";
import { getTicketTemplate } from "@/lib/ticket-templates";
import { formatXAF } from "@/lib/format";
import type { TicketTemplate } from "@/types/api";

export type TicketPreviewProps = {
  template?: TicketTemplate | null;
  eventTitle: string;
  dateLabel?: string;
  venue?: string | null;
  ticketName: string;
  price: number; // centimes
  holder?: string | null;
  // Contenu du QR : code réel du billet, sinon code d'exemple (aperçu).
  code?: string;
  compact?: boolean;
};

// Rendu d'un billet selon son modèle, avec un vrai QR code scannable.
// Utilisé pour l'aperçu à la création et l'affichage des billets achetés.
export function TicketPreview({
  template,
  eventTitle,
  dateLabel,
  venue,
  ticketName,
  price,
  holder,
  code = "LUMINA-APERCU-0000",
  compact = false,
}: TicketPreviewProps) {
  const t = getTicketTemplate(template);
  const priceLabel = price === 0 ? "GRATUIT" : formatXAF(price);
  const qrSize = compact ? 44 : 96;
  const title = eventTitle || "Titre de l'événement";

  const qr = (
    <div className="shrink-0 rounded-lg p-1.5" style={{ background: t.qrBackground ?? "#ffffff" }}>
      <QRCodeSVG value={code} size={qrSize} level="M" />
    </div>
  );

  const meta = !compact && (
    <div className="space-y-0.5 text-[11px]" style={{ color: t.muted }}>
      {dateLabel && (
        <p className="flex items-center gap-1">
          <Calendar className="size-3" /> {dateLabel}
        </p>
      )}
      {venue && (
        <p className="flex items-center gap-1">
          <MapPin className="size-3" /> {venue}
        </p>
      )}
    </div>
  );

  if (t.layout === "badge") {
    return (
      <div
        className={`ticket-art flex flex-col items-center overflow-hidden rounded-2xl text-center shadow-lg ${compact ? "w-24 p-2" : "w-60 p-4"}`}
        style={{ background: t.background, color: t.foreground }}
      >
        <div className={`w-full rounded-md ${compact ? "mb-1 h-1.5" : "mb-3 h-2"}`} style={{ background: t.accent }} />
        <p className={`font-display font-extrabold leading-tight ${compact ? "line-clamp-2 text-[8px]" : "text-base"}`}>{title}</p>
        {!compact && (
          <p className="mt-2 text-lg font-bold" style={{ color: t.accent }}>
            {holder || "Nom du participant"}
          </p>
        )}
        <p
          className={`mt-1 rounded-full px-2 font-mono font-bold uppercase ${compact ? "text-[6px]" : "text-[10px]"}`}
          style={{ background: t.accent, color: t.background.startsWith("#") ? t.background : "#ffffff" }}
        >
          {ticketName || "Formule"}
        </p>
        <div className={compact ? "mt-1.5" : "mt-3"}>{qr}</div>
        {meta && <div className="mt-3">{meta}</div>}
        {!compact && <p className="mt-2 font-mono text-xs font-bold">{priceLabel}</p>}
      </div>
    );
  }

  if (t.layout === "wristband") {
    return (
      <div
        className={`ticket-art flex items-center overflow-hidden rounded-full shadow-lg ${compact ? "w-44 gap-1.5 py-1 pr-1 pl-3" : "w-full max-w-md gap-3 py-2 pr-2 pl-6"}`}
        style={{ background: t.background, color: t.foreground }}
      >
        <div className="min-w-0 flex-1">
          <p className={`truncate font-display font-extrabold ${compact ? "text-[8px]" : "text-sm"}`}>{title}</p>
          <p className={`truncate font-mono font-bold uppercase ${compact ? "text-[6px]" : "text-[10px]"}`} style={{ color: t.accent }}>
            {ticketName || "Formule"} · {priceLabel}
          </p>
          {!compact && dateLabel && (
            <p className="truncate text-[10px]" style={{ color: t.muted }}>
              {dateLabel}
              {venue ? ` · ${venue}` : ""}
            </p>
          )}
        </div>
        <div className="shrink-0 rounded-full bg-white p-1">
          <QRCodeSVG value={code} size={compact ? 28 : 56} level="M" />
        </div>
      </div>
    );
  }

  // stub
  return (
    <div
      className={`ticket-art flex overflow-hidden rounded-2xl shadow-lg ${compact ? "w-44" : "w-full max-w-md"}`}
      style={{ background: t.background, color: t.foreground }}
    >
      <div className={`min-w-0 flex-1 ${compact ? "p-2" : "p-4"}`}>
        <p className={`font-mono font-bold uppercase tracking-wider ${compact ? "text-[6px]" : "text-[10px]"}`} style={{ color: t.accent }}>
          {ticketName || "Formule"}
        </p>
        <p className={`font-display font-extrabold leading-tight ${compact ? "line-clamp-2 text-[9px]" : "mt-1 text-lg"}`}>{title}</p>
        {meta && <div className="mt-2">{meta}</div>}
        {!compact && (
          <div className="mt-3 flex items-end justify-between gap-2">
            <p className="truncate text-xs" style={{ color: t.muted }}>
              {holder || "Nom du participant"}
            </p>
            <p className="font-mono text-sm font-bold" style={{ color: t.accent }}>
              {priceLabel}
            </p>
          </div>
        )}
      </div>
      <div
        className={`flex items-center justify-center border-l-2 border-dashed ${compact ? "px-1.5" : "px-3"}`}
        style={{ borderColor: t.muted }}
      >
        {qr}
      </div>
    </div>
  );
}
