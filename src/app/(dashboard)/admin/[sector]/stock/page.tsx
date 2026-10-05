"use client";

import { useState } from "react";
import { toast } from "sonner";
import { History, PackagePlus, ClipboardCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminProducts } from "@/hooks/useMenu";
import { useStockMovement, useStockMovements } from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiError } from "@/lib/api";
import type { Product } from "@/types/api";

type Action = { product: Product; type: "IN" | "ADJUSTMENT" } | null;

const MOVEMENT_LABELS = { IN: "Réception", OUT: "Vente", ADJUSTMENT: "Inventaire" } as const;

// Stock (docs/API_CONTRACT.md §3) : réception (IN, ajoute) et inventaire
// (ADJUSTMENT, fixe le niveau compté). Les ventes décrémentent côté serveur.
export default function StockPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role === "OWNER" || role === "MANAGER";
  const { data: products, isLoading } = useAdminProducts();
  const movement = useStockMovement();
  const [action, setAction] = useState<Action>(null);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [historyFor, setHistoryFor] = useState<Product | null>(null);
  const { data: history, isLoading: historyLoading } = useStockMovements(historyFor?.id ?? null);

  const stocked = (products ?? []).filter((p) => p.stock !== null);

  function open(product: Product, type: "IN" | "ADJUSTMENT") {
    setAction({ product, type });
    setQuantity(type === "ADJUSTMENT" ? String(product.stock ?? 0) : "");
    setReason("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!action) return;
    const qty = Number(quantity);
    const min = action.type === "IN" ? 1 : 0;
    if (!Number.isInteger(qty) || qty < min) {
      toast.error(action.type === "IN" ? "Quantité reçue : 1 minimum." : "Niveau compté invalide.");
      return;
    }
    try {
      await movement.mutateAsync({
        productId: action.product.id,
        type: action.type,
        quantity: qty,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      toast.success("Stock mis à jour");
      setAction(null);
    } catch (err) {
      toast.error(apiError(err, "Mise à jour impossible"));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Stock</h1>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : stocked.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucun article avec suivi de stock. Activez-le depuis le Menu (« Suivre le stock »).
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Alerte</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocked.map((product) => {
                const low = (product.stock ?? 0) <= (product.stockAlert ?? 0);
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{product.stock}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{product.stockAlert}</TableCell>
                    <TableCell>
                      {low ? <Badge variant="destructive">Stock faible</Badge> : <Badge variant="outline">OK</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {canEdit && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => open(product, "IN")}>
                              <PackagePlus className="size-3.5" />
                              <span className="hidden sm:inline">Réception</span>
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => open(product, "ADJUSTMENT")}>
                              <ClipboardCheck className="size-3.5" />
                              <span className="hidden sm:inline">Inventaire</span>
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" aria-label="Historique" onClick={() => setHistoryFor(product)}>
                          <History className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={action !== null} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent>
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {action?.type === "IN" ? "Réception" : "Inventaire"} — {action?.product.name}
              </DialogTitle>
              <DialogDescription>
                {action?.type === "IN"
                  ? "Quantité reçue, ajoutée au stock actuel."
                  : "Quantité réellement comptée : elle remplace le stock actuel."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="qty">{action?.type === "IN" ? "Quantité reçue" : "Quantité comptée"}</Label>
              <Input id="qty" type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reason">Motif (optionnel)</Label>
              <Input id="reason" maxLength={200} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={movement.isPending}>
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={historyFor !== null} onOpenChange={(o) => !o && setHistoryFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mouvements — {historyFor?.name}</DialogTitle>
            <DialogDescription>100 derniers mouvements.</DialogDescription>
          </DialogHeader>
          {historyLoading ? (
            <Skeleton className="h-32" />
          ) : (history ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun mouvement.</p>
          ) : (
            <ul className="max-h-80 space-y-1 overflow-y-auto text-sm">
              {(history ?? []).map((m) => (
                <li key={m.id} className="flex justify-between gap-2 border-b border-border/50 py-1">
                  <span>
                    {MOVEMENT_LABELS[m.type]} {m.type === "ADJUSTMENT" ? "→" : m.type === "IN" ? "+" : "−"}
                    {m.quantity}
                    {m.reason ? <span className="text-muted-foreground"> · {m.reason}</span> : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(m.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
