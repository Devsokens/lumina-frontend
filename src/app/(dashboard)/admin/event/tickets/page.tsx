"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EventTicketsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/event/reservations");
  }, [router]);

  return (
    <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
      Redirection vers les Réservations...
    </div>
  );
}
