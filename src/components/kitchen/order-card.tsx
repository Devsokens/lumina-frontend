"use client";

import { useEffect, useState } from "react";
import { differenceInMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/api";

function ageColor(minutes: number): string {
  if (minutes < 5) return "border-success bg-success/10";
  if (minutes < 12) return "border-warning bg-warning/10";
  return "border-destructive bg-destructive/10";
}

export function OrderCard({
  order,
  onAdvance,
}: {
  order: Order;
  onAdvance: (id: string, next: Order["status"]) => void;
}) {
  const [minutes, setMinutes] = useState(() => differenceInMinutes(new Date(), new Date(order.createdAt)));

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutes(differenceInMinutes(new Date(), new Date(order.createdAt)));
    }, 30_000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const nextStatus = order.status === "PREPARING" ? "READY" : "PREPARING";
  const nextLabel = order.status === "PREPARING" ? "Prêt" : "En préparation";

  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border-2 p-4", ageColor(minutes))}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-lg font-bold">{order.orderNumber}</p>
        <p className="font-mono text-sm text-muted-foreground">{minutes} min</p>
      </div>
      <ul className="flex-1 space-y-1 text-base">
        {order.items.map((item) => (
          <li key={item.id}>
            <span className="font-semibold">{item.quantity}×</span> {item.product?.name}
            {item.notes && <span className="block text-sm text-muted-foreground">{item.notes}</span>}
          </li>
        ))}
      </ul>
      <Button size="lg" className="h-14 text-lg" onClick={() => onAdvance(order.id, nextStatus)}>
        {nextLabel}
      </Button>
    </div>
  );
}
