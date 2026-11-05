import { redirect } from "next/navigation";

// Pas de module Clients pour l'événementiel : les acheteurs de billets sont
// listés dans l'onglet « Participants » de chaque événement. Cette page
// statique masque aussi admin/[sector]/customers pour ce secteur.
export default function EventCustomersRedirect() {
  redirect("/admin/event/events");
}
