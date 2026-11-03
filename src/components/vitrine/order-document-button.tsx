import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/constants";

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
  const href = `${API_URL}/orders/${encodeURIComponent(orderId)}/document?token=${encodeURIComponent(token)}`;
  return (
    <Button asChild size="lg" className="w-full gap-2">
      <a href={href} rel="noopener">
        {kind === "INVOICE" ? <FileText className="size-5" /> : <Download className="size-5" />}
        {kind === "INVOICE" ? "Télécharger la facture" : "Télécharger l'addition"}
      </a>
    </Button>
  );
}
