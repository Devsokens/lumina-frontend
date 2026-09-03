"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Ticket, Check, AlertCircle, Sparkles, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { TicketType, TicketTemplate } from "@/types/api";

interface TicketsManagerProps {
  eventId?: string;
  initialTickets?: TicketType[];
}

const TICKET_TEMPLATES: {
  id: TicketTemplate;
  name: string;
  tag: string;
  badgeColor: string;
  gradientClass: string;
}[] = [
  {
    id: "GOLD_VIP",
    name: "VIP Golden Luxury",
    tag: "Prestige & Carré Or",
    badgeColor: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    gradientClass: "from-amber-500/15 via-card to-orange-500/5 border-amber-500/30",
  },
  {
    id: "FESTIVAL_WRISTBAND",
    name: "Festival Neon Pass",
    tag: "Concerts & Festivals",
    badgeColor: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    gradientClass: "from-emerald-500/15 via-card to-teal-500/5 border-emerald-500/30",
  },
  {
    id: "CONFERENCE_BADGE",
    name: "Badge Pro / Conférence",
    tag: "B2B & Séminaires",
    badgeColor: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    gradientClass: "from-blue-500/15 via-card to-indigo-500/5 border-blue-500/30",
  },
  {
    id: "NIGHTLIFE_DARK",
    name: "Pass Nuit Électrique",
    tag: "Soirées & Clubbing",
    badgeColor: "bg-purple-500/20 text-purple-500 border-purple-500/30",
    gradientClass: "from-purple-500/15 via-card to-pink-500/5 border-purple-500/30",
  },
  {
    id: "CLASSIC_PASS",
    name: "Billet Standard Classique",
    tag: "Tous événements",
    badgeColor: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    gradientClass: "from-zinc-500/10 via-card to-zinc-500/5 border-border",
  },
];

const DEFAULT_TICKETS: TicketType[] = [
  {
    id: "tt-1",
    eventId: "evt-1",
    name: "Pass Standard (Accès Général)",
    price: 1000000, // 10 000 FCFA
    quantity: 350,
    sold: 142,
    ticketTemplate: "CLASSIC_PASS",
    description: "Accès à la fosse et scène principale.",
  },
  {
    id: "tt-2",
    eventId: "evt-1",
    name: "Pass VIP (Carré Or)",
    price: 2500000, // 25 000 FCFA
    quantity: 100,
    sold: 68,
    ticketTemplate: "GOLD_VIP",
    description: "Cocktail d'accueil offert, place assise réservée et vue plongeante.",
  },
  {
    id: "tt-3",
    eventId: "evt-1",
    name: "Table VVIP Privative (5 Personnes)",
    price: 15000000, // 150 000 FCFA
    quantity: 10,
    sold: 8,
    ticketTemplate: "GOLD_VIP",
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
  const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate>("GOLD_VIP");

  function handleOpenCreate() {
    setName("");
    setPriceFcfa(10000);
    setQuantity(100);
    setDescription("");
    setSelectedTemplate("GOLD_VIP");
    setEditingId(null);
    setIsCreating(true);
  }

  function handleOpenEdit(ticket: TicketType) {
    setName(ticket.name);
    setPriceFcfa(ticket.price / 100);
    setQuantity(ticket.quantity);
    setDescription(ticket.description ?? "");
    setSelectedTemplate(ticket.ticketTemplate ?? "GOLD_VIP");
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
                ticketTemplate: selectedTemplate,
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
        ticketTemplate: selectedTemplate,
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
            {totalSold}{" "}
            <span className="text-sm font-normal text-muted-foreground">/ {totalCapacity}</span>
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalSold / (totalCapacity || 1)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Recettes Mobile Money</span>
          <p className="font-display text-2xl font-bold text-emerald-500 mt-1">
            {totalRevenue.toLocaleString("fr-FR")} FCFA
          </p>
          <span className="text-[11px] text-muted-foreground mt-2 block">
            Airtel Money (72%) • Moov (28%)
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Catégories Actives</span>
          <p className="font-display text-2xl font-bold text-foreground mt-1">
            {tickets.length} Types
          </p>
          <span className="text-xs text-muted-foreground mt-2 block">
            Pass Standard, VIP & VVIP
          </span>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Tarifs & Modèles de Billets
          </h3>
          <p className="text-xs text-muted-foreground">
            Personnalisez vos prix en FCFA, quotas et le design visuel de vos pass QR.
          </p>
        </div>
        {!isCreating && (
          <Button
            onClick={handleOpenCreate}
            className="rounded-xl bg-primary text-white text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="size-4" />
            Ajouter un tarif
          </Button>
        )}
      </div>

      {/* Creation / Edit Form Inline with Ticket Template Picker */}
      {isCreating && (
        <div className="rounded-3xl border border-primary/40 bg-card p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
              <Ticket className="size-4.5 text-primary" />
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

          {/* 1. Ticket Visual Template Selector (Exactly 3 per line) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Modèle Visuel du Pass / Billet (3 modèles au choix)</span>
              <span className="text-[10px] text-muted-foreground">Sélectionnez le design</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Template 1: Pass VIP Golden Luxury */}
              <button
                type="button"
                onClick={() => setSelectedTemplate("GOLD_VIP")}
                className={`group relative flex flex-col justify-between rounded-2xl border-2 p-3 text-left transition-all bg-[#0d0d0d] text-white ${
                  selectedTemplate === "GOLD_VIP"
                    ? "border-amber-400 ring-2 ring-amber-400/50 shadow-xl"
                    : "border-zinc-800 hover:border-amber-400/60 opacity-85 hover:opacity-100"
                }`}
              >
                {selectedTemplate === "GOLD_VIP" && (
                  <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-amber-400 text-black z-20 shadow-md">
                    <Check className="size-2.5 font-bold" />
                  </span>
                )}
                {/* REAL PHYSICAL TICKET MOCKUP */}
                <div className="relative rounded-xl border border-amber-500/40 bg-gradient-to-r from-zinc-950 via-[#1a1508] to-zinc-950 p-3 shadow-inner overflow-hidden">
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5">
                    <span className="font-display font-extrabold text-[9px] text-amber-400 tracking-wider">
                      ★ VIP PASS ★
                    </span>
                    <span className="rounded bg-amber-400/20 px-1 py-0.2 text-[7px] font-mono font-bold text-amber-300">
                      CARRÉ OR
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-1 py-2 items-center">
                    <div className="col-span-8 space-y-1">
                      <p className="font-display font-bold text-[10px] text-white truncate">
                        {name || "Pass VIP Golden"}
                      </p>
                      <p className="text-[8px] text-amber-300/90 truncate flex items-center gap-1">
                        ACCÈS PRIVILÈGE
                      </p>
                      <p className="text-[8px] text-zinc-400 font-mono">
                        {priceFcfa.toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>

                    <div className="col-span-1 flex justify-center h-full">
                      <div className="border-r border-dashed border-amber-500/40 h-10" />
                    </div>

                    <div className="col-span-3 flex flex-col items-center justify-center">
                      <div className="bg-white p-0.5 rounded">
                        <QrCode className="size-6 text-black" />
                      </div>
                      <span className="text-[6px] font-mono text-amber-400/80 mt-0.5">#VIP-9082</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-amber-500/20 flex justify-between items-center text-[7px] text-zinc-400 font-mono">
                    <span>CONTRÔLE GIYA</span>
                    <span>COCKTAIL INCLUS</span>
                  </div>
                </div>

                <div className="mt-2.5">
                  <p className="font-bold text-xs text-amber-400">Billet VIP Golden</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Dorures or, souche détachable et QR code crypté.
                  </p>
                </div>
              </button>

              {/* Template 2: Festival Neon Wristband */}
              <button
                type="button"
                onClick={() => setSelectedTemplate("FESTIVAL_WRISTBAND")}
                className={`group relative flex flex-col justify-between rounded-2xl border-2 p-3 text-left transition-all bg-[#06140e] text-white ${
                  selectedTemplate === "FESTIVAL_WRISTBAND"
                    ? "border-emerald-400 ring-2 ring-emerald-400/50 shadow-xl"
                    : "border-zinc-800 hover:border-emerald-400/60 opacity-85 hover:opacity-100"
                }`}
              >
                {selectedTemplate === "FESTIVAL_WRISTBAND" && (
                  <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-emerald-400 text-black z-20 shadow-md">
                    <Check className="size-2.5 font-bold" />
                  </span>
                )}
                {/* REAL PHYSICAL TICKET MOCKUP */}
                <div className="relative rounded-xl border border-emerald-500/40 bg-gradient-to-r from-zinc-950 via-[#071f15] to-zinc-950 p-3 shadow-inner overflow-hidden">
                  <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1.5">
                    <span className="font-display font-extrabold text-[9px] text-emerald-400 tracking-wider">
                      FESTIVAL PASS
                    </span>
                    <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[7px] font-mono font-bold text-emerald-300">
                      ACCÈS TOTAL
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-1 py-2 items-center">
                    <div className="col-span-8 space-y-1">
                      <p className="font-display font-bold text-[10px] text-white truncate">
                        {name || "Festival Pass"}
                      </p>
                      <p className="text-[8px] text-emerald-300/90 truncate flex items-center gap-1">
                        SCÈNE PRINCIPALE
                      </p>
                      <p className="text-[8px] text-zinc-400 font-mono">
                        {priceFcfa.toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>

                    <div className="col-span-1 flex justify-center h-full">
                      <div className="border-r border-dashed border-emerald-500/40 h-10" />
                    </div>

                    <div className="col-span-3 flex flex-col items-center justify-center">
                      <div className="bg-white p-0.5 rounded">
                        <QrCode className="size-6 text-black" />
                      </div>
                      <span className="text-[6px] font-mono text-emerald-400/80 mt-0.5">SCAN NÉON</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-emerald-500/20 flex justify-between items-center text-[7px] text-zinc-400 font-mono">
                    <span>PASS ILLIMITÉ</span>
                    <span>CONCERT LIVE</span>
                  </div>
                </div>

                <div className="mt-2.5">
                  <p className="font-bold text-xs text-emerald-400">Festival Neon Pass</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Style concert avec scènes et scan rapide.
                  </p>
                </div>
              </button>

              {/* Template 3: Badge Pro Conférence */}
              <button
                type="button"
                onClick={() => setSelectedTemplate("CONFERENCE_BADGE")}
                className={`group relative flex flex-col justify-between rounded-2xl border-2 p-3 text-left transition-all bg-[#081220] text-white ${
                  selectedTemplate === "CONFERENCE_BADGE"
                    ? "border-blue-400 ring-2 ring-blue-400/50 shadow-xl"
                    : "border-zinc-800 hover:border-blue-400/60 opacity-85 hover:opacity-100"
                }`}
              >
                {selectedTemplate === "CONFERENCE_BADGE" && (
                  <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-blue-400 text-black z-20 shadow-md">
                    <Check className="size-2.5 font-bold" />
                  </span>
                )}
                {/* REAL PHYSICAL BADGE MOCKUP */}
                <div className="relative rounded-xl border border-blue-500/40 bg-gradient-to-r from-zinc-950 via-[#0a1b33] to-zinc-950 p-3 shadow-inner overflow-hidden">
                  <div className="flex items-center justify-between border-b border-blue-500/30 pb-1.5">
                    <span className="font-display font-extrabold text-[9px] text-blue-400 tracking-wider">
                      BADGE PRO B2B
                    </span>
                    <span className="rounded bg-blue-500/20 px-1 py-0.2 text-[7px] font-mono font-bold text-blue-300">
                      DÉLÉGUÉ
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-1 py-2 items-center">
                    <div className="col-span-8 space-y-1">
                      <p className="font-display font-bold text-[10px] text-white truncate">
                        {name || "Badge Délégué"}
                      </p>
                      <p className="text-[8px] text-blue-300/90 truncate flex items-center gap-1">
                        ACCRÉDITATION PRO
                      </p>
                      <p className="text-[8px] text-zinc-400 font-mono">
                        {priceFcfa.toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>

                    <div className="col-span-1 flex justify-center h-full">
                      <div className="border-r border-dashed border-blue-500/40 h-10" />
                    </div>

                    <div className="col-span-3 flex flex-col items-center justify-center">
                      <div className="bg-white p-0.5 rounded">
                        <QrCode className="size-6 text-black" />
                      </div>
                      <span className="text-[6px] font-mono text-blue-400/80 mt-0.5">PRO-ACCESS</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-blue-500/20 flex justify-between items-center text-[7px] text-zinc-400 font-mono">
                    <span>PLÉNIÈRES</span>
                    <span>NETWORKING</span>
                  </div>
                </div>

                <div className="mt-2.5">
                  <p className="font-bold text-xs text-blue-400">Badge Conférence Pro</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Format badge officiel tour de cou B2B.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Nom de la catégorie</Label>
              <Input
                placeholder="Ex: Pass VIP Carré Or, Early Bird, Pass 2 Jours..."
                className="h-10 rounded-xl text-xs"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Prix de vente (FCFA)</Label>
              <Input
                type="number"
                placeholder="10000"
                className="h-10 rounded-xl text-xs font-mono"
                value={priceFcfa}
                onChange={(e) => setPriceFcfa(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Quota disponible (Places)</Label>
              <Input
                type="number"
                placeholder="100"
                className="h-10 rounded-xl text-xs font-mono"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Avantages inclus / Description</Label>
              <Input
                placeholder="Ex: Cocktail offert, entrée coupe-file, accès loge privée..."
                className="h-10 rounded-xl text-xs"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
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

      {/* Tickets List with Visual Template Badges */}
      <div className="space-y-3">
        {tickets.map((ticket) => {
          const percent = Math.min(100, Math.round((ticket.sold / (ticket.quantity || 1)) * 100));
          const isSoldOut = ticket.sold >= ticket.quantity;
          const templateMeta =
            TICKET_TEMPLATES.find((t) => t.id === ticket.ticketTemplate) ?? TICKET_TEMPLATES[0];

          return (
            <div
              key={ticket.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border bg-gradient-to-r p-4 sm:p-5 transition-all hover:border-primary/50 shadow-xs ${templateMeta.gradientClass}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card border border-border text-primary shadow-xs">
                  <QrCode className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display font-bold text-base text-foreground">
                      {ticket.name}
                    </h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${templateMeta.badgeColor}`}
                    >
                      {templateMeta.name}
                    </span>
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
                  <p className="text-xs text-muted-foreground mt-1">{ticket.description}</p>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-border/50 pt-3 sm:border-0 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className="font-display text-lg font-bold text-foreground font-mono">
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
                    className="size-8 rounded-xl text-muted-foreground hover:text-foreground"
                    onClick={() => handleOpenEdit(ticket)}
                  >
                    <Edit2 className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-xl text-destructive hover:bg-destructive/10"
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
