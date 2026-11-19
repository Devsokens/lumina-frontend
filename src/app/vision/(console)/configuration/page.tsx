import { redirect } from "next/navigation";

// Première rubrique par défaut.
export default function ConfigurationPage() {
  redirect("/vision/configuration/frais");
}
