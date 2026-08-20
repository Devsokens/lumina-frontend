import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types/api";

const STATUS_VARIANT: Record<Order["status"], "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  CONFIRMED: "secondary",
  PREPARING: "secondary",
  READY: "default",
  DELIVERED: "default",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

export function OrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucune commande pour le moment.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Commande</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono">{order.orderNumber}</TableCell>
            <TableCell>{order.customerName ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {(order.total / 100).toLocaleString("fr-FR")} FCFA
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
