"use client";

import { usePathname } from "next/navigation";
import { GiyaxAssistant } from "@/components/ai/giyax-assistant";

// GiyaX AI dans le back-office, sauf dans les éditeurs de site plein écran
// (ils ont leur propre assistant IA en bas de l'aperçu).
const HIDDEN = /^\/admin\/[^/]+\/(showcase|site)(\/|$)/;

export function AdminAssistant() {
  const pathname = usePathname();
  if (HIDDEN.test(pathname)) return null;
  return <GiyaxAssistant mode="admin" />;
}
