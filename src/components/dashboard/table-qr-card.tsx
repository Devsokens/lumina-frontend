"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { APP_URL } from "@/lib/constants";
import type { Table } from "@/types/api";

export function TableQrCard({ tenantSlug, table }: { tenantSlug: string; table: Table }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const url = `${APP_URL}/${tenantSlug}?table=${table.id}`;

  function handleDownload() {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-table-${table.number}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Table {table.number}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center" ref={wrapperRef}>
        <QRCodeCanvas value={url} size={180} marginSize={2} />
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleDownload}>
          <Download className="size-4" />
          Télécharger (PNG)
        </Button>
      </CardFooter>
    </Card>
  );
}
