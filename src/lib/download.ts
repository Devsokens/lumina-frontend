import { api } from "@/lib/api";

// Téléchargements directs (sans nouvel onglet). Les codes des billets partent
// dans le corps de la requête : ils ne figurent jamais dans une adresse, donc
// ni dans l'historique du navigateur ni dans les journaux des serveurs.

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function downloadTickets(codes: string[]) {
  const { data } = await api.post<Blob>("/tickets/pdf", { codes }, { responseType: "blob", timeout: 60_000 });
  saveBlob(data, codes.length > 1 ? "billets.pdf" : "billet.pdf");
}

export async function downloadOrderDocument(orderId: string, token: string, kind: "INVOICE" | "BILL") {
  const { data } = await api.get<Blob>(`/orders/${encodeURIComponent(orderId)}/document`, {
    params: { token },
    responseType: "blob",
    timeout: 60_000,
  });
  saveBlob(data, kind === "INVOICE" ? "facture.pdf" : "addition.pdf");
}
