"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Lie le panier à la vitrine courante et mémorise la table du QR code
// (`/{slug}?table=<id>`) jusqu'au paiement — la page de commande n'a plus
// le paramètre dans l'URL après navigation menu → panier → commande.
export function CartBinding({ tenantSlug }: { tenantSlug: string }) {
  const params = useSearchParams();
  const bindTenant = useCartStore((s) => s.bindTenant);
  const setTableId = useCartStore((s) => s.setTableId);
  const table = params.get("table");

  useEffect(() => {
    bindTenant(tenantSlug);
    if (table && UUID.test(table)) setTableId(table);
  }, [tenantSlug, table, bindTenant, setTableId]);

  return null;
}
