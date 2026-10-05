"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// L'ancien écran de contrôle d'accès était une simulation (validation sans
// appel serveur). Le seul scanner réel est /scan : vérification serveur,
// saisie manuelle et mode hors ligne.
export default function EventScannerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/scan");
  }, [router]);

  return (
    <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
      Redirection vers le scanner…
    </div>
  );
}
