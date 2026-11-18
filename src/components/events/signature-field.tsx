"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, PenLine, Upload } from "lucide-react";
import { EvButton, EvLabel } from "@/components/events/ev-ui";
import { prepareImage } from "@/lib/image";

// Signature manuscrite d'un signataire de certificat : photo ou scan de la
// signature (fond blanc ou transparent), réduite dans le navigateur puis
// envoyée avec le certificat. Elle remplace la signature écrite en italique,
// sur l'aperçu comme sur le PDF envoyé.
export function SignatureField({ value, onChange }: { value: string | null | undefined; onChange: (v: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await prepareImage(file, 800));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image illisible.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <EvLabel>Signature (facultatif)</EvLabel>
      <div className="flex items-center gap-3">
        <span className="flex h-[54px] w-[150px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-ev-dash bg-white">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Signature importée" className="max-h-full max-w-full object-contain" />
          ) : (
            <PenLine className="size-5 text-ev-muted" />
          )}
        </span>
        <div className="flex flex-wrap gap-2">
          <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
          <EvButton size="sm" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {value ? "Changer" : "Importer"}
          </EvButton>
          {value && (
            <EvButton size="sm" variant="ghost" onClick={() => onChange(null)}>
              Retirer
            </EvButton>
          )}
        </div>
      </div>
      <span className="text-xs text-ev-muted">Photo ou scan de la signature, sur fond blanc ou transparent. Sans image, le nom est écrit en italique.</span>
    </div>
  );
}
