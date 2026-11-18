"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// Aperçu réel d'un billet : le serveur le génère avec le même moteur que
// les billets envoyés (POST /admin/events/ticket-preview), à partir des
// réglages en cours dans l'éditeur. Recalculé peu après chaque changement.

export type TicketPreviewInput = {
  template: string;
  color?: string | null;
  title: string;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  couplePhoto?: string | null;
  texts?: Record<string, string> | null;
  formulaName: string;
  price: number;
  contribution?: boolean;
};

const DEBOUNCE_MS = 700;

// Image importée trop lourde pour l'aperçu, ou URL non https : omise.
const imageOrNull = (v?: string | null) => (v && (v.startsWith("https://") || (v.startsWith("data:image/") && v.length < 450_000)) ? v : null);

export function TicketPdfPreview({ input, className }: { input: TicketPreviewInput; className?: string }) {
  const body = useMemo(() => JSON.stringify({ ...input, imageUrl: imageOrNull(input.imageUrl), couplePhoto: imageOrNull(input.couplePhoto) }), [input]);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let created: string | null = null;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.post<Blob>("/admin/events/ticket-preview", JSON.parse(body), { responseType: "blob", timeout: 60_000 });
        if (cancelled) return;
        created = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
        setUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return created;
        });
        setFailed(false);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [body]);

  // Libère le dernier aperçu en quittant.
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("relative flex flex-col gap-2", className)}>
      <div className="relative min-h-[360px] flex-1 overflow-hidden rounded-[10px] border border-ev-line bg-white">
        {url && <iframe title="Aperçu réel du billet" src={`${url}#toolbar=0&navpanes=0&view=FitH`} className="absolute inset-0 size-full border-0" />}
        {(loading || !url) && !failed && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-ev-muted">
            <Loader2 className="size-5 animate-spin" />
          </span>
        )}
        {failed && !url && <span className="absolute inset-0 flex items-center justify-center px-6 text-center text-[13px] text-ev-muted">Aperçu indisponible pour le moment.</span>}
      </div>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 self-start text-xs font-semibold text-ev-link hover:underline">
          <ExternalLink className="size-3.5" /> Ouvrir en grand (le billet exact envoyé aux participants)
        </a>
      )}
    </div>
  );
}
