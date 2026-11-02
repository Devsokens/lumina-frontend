"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderDocumentData } from "@/lib/order-document";

// Génère le PDF dans le navigateur, au clic : @react-pdf/renderer est
// chargé à ce moment-là seulement (lourd, inutile au reste de la vitrine).
export function OrderDocumentButton({ data }: { data: OrderDocumentData }) {
  const [busy, setBusy] = useState(false);
  const label = data.kind === "INVOICE" ? "Télécharger la facture" : "Télécharger l'addition";

  async function render(withLogos: boolean) {
    const [{ pdf }, { OrderDocumentPdf }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/vitrine/order-document-pdf"),
    ]);
    const doc = withLogos ? data : { ...data, restaurant: { ...data.restaurant, logoUrl: null } };
    const appLogoUrl = withLogos ? `${window.location.origin}/brand/giyax-logo.png` : null;
    return pdf(<OrderDocumentPdf data={doc} appLogoUrl={appLogoUrl} />).toBlob();
  }

  async function download() {
    setBusy(true);
    try {
      let blob: Blob;
      try {
        blob = await render(true);
      } catch {
        // Logo injoignable (réseau, CSP) : document sans images plutôt que rien.
        blob = await render(false);
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.kind === "INVOICE" ? "facture" : "addition"}-${data.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
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
