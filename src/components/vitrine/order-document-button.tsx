"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderDocumentData } from "@/lib/order-document";

// @react-pdf/renderer est lourd : chargé une seule fois, au clic sur
// « payer » (preloadOrderDocument) plutôt qu'au téléchargement.
let modules: Promise<[typeof import("@react-pdf/renderer"), typeof import("@/components/vitrine/order-document-pdf")]> | null =
  null;

export function preloadOrderDocument() {
  modules ??= Promise.all([import("@react-pdf/renderer"), import("@/components/vitrine/order-document-pdf")]);
  modules.catch(() => {
    modules = null;
  });
  return modules;
}

async function render(data: OrderDocumentData, withLogos: boolean) {
  const [{ pdf }, { OrderDocumentPdf }] = await preloadOrderDocument();
  const doc = withLogos ? data : { ...data, restaurant: { ...data.restaurant, logoUrl: null } };
  const appLogoUrl = withLogos ? `${window.location.origin}/brand/giyax-logo.png` : null;
  return pdf(<OrderDocumentPdf data={doc} appLogoUrl={appLogoUrl} />).toBlob();
}

async function build(data: OrderDocumentData) {
  try {
    return await render(data, true);
  } catch {
    // Logo injoignable (réseau, CSP) : document sans images plutôt que rien.
    return render(data, false);
  }
}

// Le PDF est généré en arrière-plan dès l'affichage du bouton : au clic,
// le téléchargement part immédiatement.
export function OrderDocumentButton({ data }: { data: OrderDocumentData }) {
  const [busy, setBusy] = useState(false);
  const blob = useRef<Promise<Blob> | null>(null);
  const label = data.kind === "INVOICE" ? "Télécharger la facture" : "Télécharger l'addition";
  // Les pages recréent l'objet `data` à chaque rendu : on ne régénère que si
  // son contenu change.
  const key = JSON.stringify(data);

  useEffect(() => {
    const p = build(JSON.parse(key) as OrderDocumentData);
    blob.current = p;
    p.catch(() => {
      if (blob.current === p) blob.current = null;
    });
  }, [key]);

  async function download() {
    setBusy(true);
    try {
      const file = await (blob.current ?? (blob.current = build(data)));
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.kind === "INVOICE" ? "facture" : "addition"}-${data.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      blob.current = null;
      toast.error("Impossible de générer le document. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" size="lg" className="w-full gap-2" onClick={download} disabled={busy}>
      {busy ? <Loader2 className="size-5 animate-spin" /> : data.kind === "INVOICE" ? <FileText className="size-5" /> : <Download className="size-5" />}
      {busy ? "Préparation du PDF…" : label}
    </Button>
  );
}
