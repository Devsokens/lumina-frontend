"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomers } from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/useAuthStore";

// Clients (docs/API_CONTRACT.md §12) : alimentés automatiquement par les
// commandes. Recherche serveur (debounce 300 ms), pagination serveur.
export function CustomersList() {
  const role = useAuthStore((s) => s.user?.role);
  const canRead = role === "OWNER" || role === "MANAGER";
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(input);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [input]);

  const { data, isLoading, isError, isFetching } = useCustomers(search, page);

  if (!canRead) {
    return <p className="text-sm text-muted-foreground">Fichier clients réservé au propriétaire et aux managers.</p>;
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1;

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Nom, téléphone ou e-mail"
          maxLength={100}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      {isLoading ? (
        <Skeleton className="h-40" />
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger les clients.</p>
      ) : (data?.data ?? []).length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Aucun client.</p>
      ) : (
        <ul className={`divide-y divide-border rounded-2xl border border-border ${isFetching ? "opacity-70" : ""}`}>
          {(data?.data ?? []).map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <div>
                <p className="font-medium">{c.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{[c.phone, c.email].filter(Boolean).join(" · ")}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                depuis le {new Date(c.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Précédent
          </Button>
          <span className="text-muted-foreground">
            Page {page} / {totalPages} · {data?.meta.total} client(s)
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
