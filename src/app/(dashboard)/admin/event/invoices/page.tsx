import { redirect } from "next/navigation";

// Pas de module Factures pour l'événementiel. La page des autres secteurs
// (admin/[sector]/invoices) reste inchangée ; cette route statique la masque
// seulement pour ce secteur.
export default function EventInvoicesRedirect() {
  redirect("/admin/event");
}
