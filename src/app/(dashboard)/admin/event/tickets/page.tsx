import { redirect } from "next/navigation";

// Ancienne adresse : les billets se gèrent dans l'onglet « Participants » du
// détail de chaque événement.
export default function EventTicketsRedirect() {
  redirect("/admin/event/events");
}
