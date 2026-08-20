"use client";

import { OrdersGrid } from "@/components/kitchen/orders-grid";
import { useAuth } from "@/hooks/useAuth";

// Fullscreen, sans header ni distraction — voir LUMINA_Document_Maitre_v2.md 3.4.F.
export default function KitchenPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <OrdersGrid tenantId={user.tenantId} />
    </div>
  );
}
