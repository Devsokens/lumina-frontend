import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hors ligne — Giya" };

// Page servie par le service worker quand une page n'est ni en ligne ni en
// cache (précachée au build). Statique : aucun appel réseau.
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="Giya" className="size-20 rounded-3xl shadow-lg" />
      <h1 className="font-display text-2xl font-bold">Vous êtes hors ligne</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Cette page n&apos;est pas encore disponible sans connexion. Les écrans déjà ouverts (scanner
        préparé, menu consulté) restent utilisables. Reconnectez-vous puis réessayez.
      </p>
      {/* Rechargement complet voulu (nouvelle requête réseau), pas une navigation client. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
        Réessayer
      </a>
    </main>
  );
}
