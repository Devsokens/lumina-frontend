import { redirect } from "next/navigation";

// Les participants se consultent désormais dans l'onglet « Participants » du
// détail de chaque événement.
export default function EventAttendeesRedirect() {
  redirect("/admin/event/events");
}
