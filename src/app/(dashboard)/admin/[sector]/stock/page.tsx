"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminProducts } from "@/hooks/useMenu";

export default function StockPage() {
  const { data: products, isLoading } = useAdminProducts();

  const stocked = (products ?? []).filter((p) => p.stock !== null);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Stock</h1>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : stocked.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucun article avec suivi de stock activé.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Seuil d&apos;alerte</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocked.map((product) => {
              const low = (product.stock ?? 0) <= (product.stockAlert ?? 0);
              return (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {product.stock}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {product.stockAlert}
                  </TableCell>
                  <TableCell>
                    {low ? (
                      <Badge variant="destructive">Stock faible</Badge>
                    ) : (
                      <Badge variant="outline">OK</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
