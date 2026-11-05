import { redirect } from "next/navigation";

// Plus de module Réservations : les billets, les entrées et les
// remboursements se gèrent dans l'onglet « Participants » du détail de
// chaque événement.
export default function EventReservationsRedirect() {
  redirect("/admin/event/events");
}
