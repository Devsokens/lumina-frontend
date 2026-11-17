"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

// Écran d'erreur de toute l'application (les sites publics ont le leur) : à
// la place de la page blanche de Next, un message en français et deux
// issues, réessayer ou repartir de l'accueil. Le détail technique n'est
// jamais montré.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-6 text-center">
      <Image src="/brand/giyax-icon-x.png" alt="" width={64} height={65} className="opacity-90" />
      <div className="flex max-w-sm flex-col gap-2">
        <h1 className="font-display text-xl font-bold">Cette page n&apos;a pas pu s&apos;afficher</h1>
        <p className="text-sm text-muted-foreground">Un souci passager, souvent lié au réseau. Réessayez : vos données sont en sécurité.</p>
        {error.digest && <p className="text-xs text-muted-foreground/70">Référence : {error.digest}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button type="button" onClick={reset} className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <RefreshCw className="size-4" />
          Réessayer
        </button>
        <Link href="/" className="flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold hover:bg-muted">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
