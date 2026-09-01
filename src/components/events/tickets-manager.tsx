"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Ticket, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { TicketType } from "@/types/api";

interface TicketsManagerProps {
  eventId?: string;
  initialTickets?: TicketType[];
}

const DEFAULT_TICKETS: TicketType[] = [
  {
    id: "tt-1",
    eventId: "evt-1",
    name: "Pass Standard (Accès Général)",
    price: 1000000, // 10 000 FCFA
    quantity: 350,
    sold: 142,
    description: "Accès à la fosse et scène principale.",
  },
  {
    id: "tt-2",
    eventId: "evt-1",
    name: "Pass VIP (Carré Or)",
    price: 2500000, // 25 000 FCFA
    quantity: 100,
    sold: 68,
    description: "Cocktail d'accueil offert, place assise réservée et vue plongeante.",
  },
  {
    id: "tt-3",
    eventId: "evt-1",
    name: "Table VVIP Privative (5 Personnes)",
    price: 15000000, // 150 000 FCFA
    quantity: 10,
    sold: 8,
    description: "Bouteille de champagne incluse, service dédié et parking VIP.",
  },
];

export function TicketsManager({ initialTickets = DEFAULT_TICKETS }: TicketsManagerProps) {
  const [tickets, setTickets] = useState<TicketType[]>(initialTickets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State for new/edited ticket
  const [name, setName] = useState("");
  const [priceFcfa, setPriceFcfa] = useState<number>(10000);
  const [quantity, setQuantity] = useState<number>(100);
  const [description, setDescription] = useState("");

  function handleOpenCreate() {
    setName("");
    setPriceFcfa(10000);
    setQuantity(100);
    setDescription("");
    setEditingId(null);
    setIsCreating(true);
  }

  function handleOpenEdit(ticket: TicketType) {
    setName(ticket.name);
    setPriceFcfa(ticket.price / 100);
    setQuantity(ticket.quantity);
    setDescription(ticket.description ?? "");
    setEditingId(ticket.id);
    setIsCreating(true);
  }

  function handleSaveTicket() {
    if (!name.trim()) {
      toast.error("Veuillez saisir un nom pour la catégorie de billet");
      return;
    }

    if (editingId) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                name,
                price: priceFcfa * 100,
                quantity,
                description,
              }
            : t
        )
      );
      toast.success("Catégorie de billet mise à jour");
    } else {
      const newTicket: TicketType = {
        id: `tt-${Date.now()}`,
        eventId: "evt-1",
        name,
        price: priceFcfa * 100,
        quantity,
        sold: 0,
        description,
      };
      setTickets((prev) => [...prev, newTicket]);
      toast.success("Nouvelle catégorie de billet ajoutée");
    }

    setIsCreating(false);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    toast.success("Catégorie supprimée");
  }

  const totalSold = tickets.reduce((acc, t) => acc + t.sold, 0);
  const totalCapacity = tickets.reduce((acc, t) => acc + t.quantity, 0);
  const totalRevenue = tickets.reduce((acc, t) => acc + (t.sold * t.price) / 100, 0);

  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Billets Vendus</span>
          <p className="font-display text-2xl font-bold text-foreground mt-1">
            {totalSold} <span className="text-sm font-normal text-muted-foreground">/ {totalCapacity}</span>
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalSold / (totalCapacity || 1)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Recettes Billetterie</span>
          <p className="font-display text-2xl font-bold text-emerald-500 mt-1">
            {totalRevenue.toLocaleString("fr-FR")} FCFA
          </p>
          <span className="text-xs text-muted-foreground mt-2 block">Directement sur compte Mobile Money</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Catégories Actives</span>
          <p className="font-display text-2xl font-bold text-foreground mt-1">{tickets.length} Types</p>
          <span className="text-xs text-muted-foreground mt-2 block">Pass Standard, VIP & VVIP</span>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Tarifs & Catégories de Billets</h3>
          <p className="text-xs text-muted-foreground">Définissez vos prix en FCFA et vos quotas de places.</p>
        </div>
        {!isCreating && (
          <Button onClick={handleOpenCreate} className="rounded-xl bg-primary text-white text-xs font-semibold gap-1.5 shadow-sm">
            <Plus className="size-4" />
            Ajouter un tarif
          </Button>
        )}
      </div>

      {/* Creation / Edit Form Inline */}
      {isCreating && (
        <div className="rounded-2xl border border-primary/40 bg-card p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
              <Ticket className="size-4 text-primary" />
              {editingId ? "Modifier le tarif" : "Créer une nouvelle catégorie de billet"}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setIsCreating(false)}
            >
              Fermer
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Nom de la catégorie</Label>
              <Input
                placeholder="Ex: Pass VIP, Early Bird, Pass 2 Jours..."
                className="h-10 rounded-xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Prix de vente (FCFA)</Label>
              <Input
                type="number"
                placeholder="10000"
                className="h-10 rounded-xl"
                value={priceFcfa}
                onChange={(e) => setPriceFcfa(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Quota disponible (Nombre de places)</Label>
              <Input
                type="number"
                placeholder="100"
                className="h-10 rounded-xl"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Avantages inclus / Description</Label>
              <Input
                placeholder="Ex: Cocktail offert, entrée coupe-file, accès loge..."
                className="h-10 rounded-xl"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs"
              onClick={() => setIsCreating(false)}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              className="rounded-xl bg-primary text-white text-xs font-semibold"
              onClick={handleSaveTicket}
            >
              <Check className="size-3.5 mr-1" />
              {editingId ? "Mettre à jour" : "Ajouter la catégorie"}
            </Button>
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-3">
        {tickets.map((ticket) => {
          const percent = Math.min(100, Math.round((ticket.sold / (ticket.quantity || 1)) * 100));
          const isSoldOut = ticket.sold >= ticket.quantity;

          return (
            <div
              key={ticket.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
                  <Ticket className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-base text-foreground">{ticket.name}</h4>
                    {isSoldOut ? (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-500">
                        COMPLET
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                        En Vente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ticket.description}</p>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-border/50 pt-3 sm:border-0 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className="font-display text-lg font-bold text-foreground">
                    {((ticket.price ?? 0) / 100).toLocaleString("fr-FR")} FCFA
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>{ticket.sold}</strong> / {ticket.quantity} vendus ({percent}%)
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={() => handleOpenEdit(ticket)}
                  >
                    <Edit2 className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(ticket.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
