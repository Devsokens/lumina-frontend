"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { APP_URL } from "@/lib/constants";
import type { Table } from "@/types/api";

export function TableQrCard({
  tenantSlug,
  table,
  onDelete,
}: {
  tenantSlug: string;
  table: Table;
  onDelete?: () => void;
}) {
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
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-display">Table {table.number}</CardTitle>
        <span className="text-xs text-muted-foreground">{table.capacity} places</span>
      </CardHeader>
      <CardContent className="flex justify-center" ref={wrapperRef}>
        {tenantSlug ? <QRCodeCanvas value={url} size={180} marginSize={2} /> : <div className="size-[180px]" />}
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1" onClick={handleDownload} disabled={!tenantSlug}>
          <Download className="size-4" />
          PNG
        </Button>
        {onDelete && (
          <Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete} aria-label={`Supprimer la table ${table.number}`}>
            <Trash2 className="size-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
