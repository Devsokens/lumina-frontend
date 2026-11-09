"use client";

import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadButton } from "@/components/shared/download-button";
import { downloadTenantExport } from "@/lib/download";
import { useAuthStore } from "@/stores/useAuthStore";

// Copie des données de l'organisation (propriétaire uniquement).
export function DataExportCard() {
  const isOwner = useAuthStore((s) => s.user?.role === "OWNER");
  if (!isOwner) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Mes données</CardTitle>
        <CardDescription>
          Récupérez à tout moment une copie de vos données : clients, commandes, catalogue et images, dans un fichier ZIP.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <DownloadButton action={downloadTenantExport} className={buttonVariants({ variant: "outline", className: "gap-2" })}>
          <Download className="size-4" />
          Télécharger mes données
        </DownloadButton>
        <p className="text-xs text-muted-foreground">
          Ce fichier contient les données personnelles de vos clients : gardez-le en lieu sûr. Trois téléchargements par heure au plus.
        </p>
      </CardContent>
    </Card>
  );
}
