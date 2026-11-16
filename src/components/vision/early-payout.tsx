"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileCheck2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/vision/vision-ui";
import { relative, visionApi, visionGet } from "@/lib/vision";
import { apiError } from "@/lib/api";

// Versement anticipé d'une organisation : ses ventes sont versées sans
// attendre la fin de l'événement. Activé seulement avec le document de
// consentement signé par l'organisateur (PDF ou photo, gardé côté serveur)
// et le code de l'application d'authentification.

type State = {
  earlyPayout: boolean;
  consent: { fileName: string; mime: string; size: number; uploadedBy: string; createdAt: string } | null;
};

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT = "application/pdf,image/png,image/jpeg";

const readDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("lecture"));
    reader.readAsDataURL(file);
  });

export function EarlyPayout({ tenantId, name }: { tenantId: string; name: string }) {
  const qc = useQueryClient();
  const key = ["vision-early-payout", tenantId];
  const { data } = useQuery({ queryKey: key, queryFn: () => visionGet<State>(`/tenants/${tenantId}/early-payout`) });
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [code, setCode] = useState("");
  const [opening, setOpening] = useState(false);

  const enable = useMutation({
    mutationFn: async () => {
      const document = await readDataUrl(file as File);
      return (await visionApi.post<{ data: State }>(`/tenants/${tenantId}/early-payout`, { document, fileName: (file as File).name, code }, { timeout: 120_000 })).data.data;
    },
    onSuccess: (state) => {
      qc.setQueryData(key, state);
      setFile(null);
      setCode("");
      toast.success("Versement anticipé activé.");
    },
    onError: (err) => {
      setCode("");
      toast.error(apiError(err, "Activation impossible"));
    },
  });
  const disable = useMutation({
    mutationFn: async () => (await visionApi.delete<{ data: State }>(`/tenants/${tenantId}/early-payout`)).data.data,
    onSuccess: (state) => {
      qc.setQueryData(key, state);
      toast.success("Versement anticipé désactivé.");
    },
    onError: (err) => toast.error(apiError(err, "Désactivation impossible")),
  });

  function pick(f: File | undefined) {
    if (!f) return;
    if (!ACCEPT.split(",").includes(f.type)) return void toast.error("Document attendu : PDF, PNG ou JPEG.");
    if (f.size > MAX_BYTES) return void toast.error("Document trop lourd : 4 Mo au plus.");
    setFile(f);
  }

  async function openDocument() {
    setOpening(true);
    try {
      const doc = await visionGet<{ fileName: string; mime: string; base64: string }>(`/tenants/${tenantId}/early-payout/document`);
      const bytes = Uint8Array.from(atob(doc.base64), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: doc.mime }));
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      toast.error(apiError(err, "Document indisponible"));
    } finally {
      setOpening(false);
    }
  }

  if (!data) return null;
  const { consent } = data;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Versement anticipé</h3>
      <div className="space-y-3 rounded-xl border border-border p-3">
        <div className="flex items-start justify-between gap-3">
          <span className="text-sm">
            <span className="flex items-center gap-2 font-medium">
              Verser avant la fin de l&apos;événement
              {data.earlyPayout ? <Pill tone="warn">Activé</Pill> : <Pill tone="muted">Désactivé</Pill>}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {data.earlyPayout
                ? "Ses ventes sont dues tout de suite, sans le délai après l'événement. En cas d'annulation, les remboursements ne sont plus couverts par les recettes déjà versées."
                : "Par défaut, ses recettes sont versées après la fin de l'événement. L'activation demande son consentement écrit."}
            </span>
          </span>
          {data.earlyPayout && (
            <Button size="sm" variant="outline" disabled={disable.isPending} onClick={() => disable.mutate()}>
              {disable.isPending && <Loader2 className="size-4 animate-spin" />}
              Désactiver
            </Button>
          )}
        </div>

        {consent && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              <FileCheck2 className="size-4 shrink-0 text-primary" />
              <span className="truncate">
                {consent.fileName} · {Math.max(1, Math.round(consent.size / 1024))} Ko · déposé {relative(consent.createdAt)} par {consent.uploadedBy}
              </span>
            </span>
            <button type="button" disabled={opening} onClick={() => void openDocument()} className="font-semibold text-primary hover:underline disabled:opacity-60">
              {opening ? "Ouverture…" : "Télécharger"}
            </button>
          </div>
        )}

        {!data.earlyPayout && (
          <form
            className="space-y-2.5 border-t border-border pt-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (file && /^[0-9]{6}$/.test(code)) enable.mutate();
            }}
          >
            <p className="text-xs text-muted-foreground">
              Pour activer : déposez le document de consentement signé par « {name} » (PDF ou photo, 4 Mo au plus), puis saisissez votre code d&apos;authentification.
            </p>
            <input ref={input} type="file" accept={ACCEPT} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => input.current?.click()}>
                <Upload className="size-4" />
                {file ? "Changer de document" : "Choisir le document"}
              </Button>
              {file && <span className="min-w-0 truncate text-xs text-muted-foreground">{file.name}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Code à 6 chiffres"
                aria-label="Code d'authentification"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-40"
              />
              <Button type="submit" size="sm" disabled={!file || code.length !== 6 || enable.isPending}>
                {enable.isPending && <Loader2 className="size-4 animate-spin" />}
                Activer le versement anticipé
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
