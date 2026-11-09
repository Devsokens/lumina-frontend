"use client";

import { Download, FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DownloadButton } from "@/components/shared/download-button";
import { downloadOrderDocument } from "@/lib/download";

// Facture (commande réglée) ou addition (à régler sur place), PDF généré par
// l'API (docs/API_CONTRACT.md §16). Le jeton vient de POST /orders ou de
// /payments/status : sans lui, le lien ne donne rien.
export function OrderDocumentButton({
  orderId,
  token,
  kind,
}: {
  orderId: string;
  token: string;
  kind: "INVOICE" | "BILL";
}) {
  return (
    <DownloadButton action={() => downloadOrderDocument(orderId, token, kind)} className={buttonVariants({ size: "lg", className: "w-full gap-2" })}>
      {kind === "INVOICE" ? <FileText className="size-5" /> : <Download className="size-5" />}
      {kind === "INVOICE" ? "Télécharger la facture" : "Télécharger l'addition"}
    </DownloadButton>
  );
}
