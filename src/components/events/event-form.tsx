"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Calendar, MapPin, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Event } from "@/types/api";

interface EventFormProps {
  initialData?: Partial<Event>;
  onSuccess?: (event: Partial<Event>) => void;
  onCancel?: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venueName: string;
  location: string;
  capacity: number;
}

export function EventForm({ initialData, onSuccess, onCancel }: EventFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      startDate: initialData?.startDate ? initialData.startDate.split("T")[0] : "",
      startTime: "19:00",
      endDate: initialData?.endDate ? initialData.endDate.split("T")[0] : "",
      endTime: "23:30",
      venueName: initialData?.venueName ?? "",
      location: initialData?.location ?? "Libreville, Gabon",
      capacity: initialData?.capacity ?? 500,
    },
  });

  const titleValue = watch("title");

  function handleGenerateAiDescription() {
    if (!titleValue) {
      toast.error("Veuillez d'abord saisir un titre pour l'événement");
      return;
    }
    setGeneratingAi(true);
    setTimeout(() => {
      setValue(
        "description",
        `Rejoignez-nous pour ${titleValue} ! Une soirée d'exception avec artistes en live, espace VIP exclusif, sécurité maximale et animations non-stop. Billetterie sécurisée et entrées scannées instantanément par QR Code.`
      );
      setGeneratingAi(false);
      toast.success("Description générée par l'Assistant Giya !");
    }, 800);
  }

  async function onSubmit(values: EventFormData) {
    setSubmitting(true);
    try {
      // Simulation or API call
      const payload: Partial<Event> = {
        title: values.title,
        description: values.description,
        startDate: `${values.startDate}T${values.startTime}:00Z`,
        endDate: values.endDate ? `${values.endDate}T${values.endTime}:00Z` : null,
        venueName: values.venueName,
        location: values.location,
        capacity: Number(values.capacity),
        status: "PUBLISHED",
      };

      toast.success(initialData?.id ? "Événement mis à jour" : "Événement créé avec succès !");
      onSuccess?.(payload);
    } catch {
      toast.error("Erreur lors de l'enregistrement de l'événement");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title & AI Assistant */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-semibold">
          Titre de l&apos;événement <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ex: Festival Afro Vibes 2026, Soirée Blanche VIP..."
          className="h-11 rounded-xl"
          {...register("title", { required: "Le titre est requis" })}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      {/* Description & AI Generator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description" className="text-sm font-semibold">
            Description & Programme
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary hover:text-primary/80 gap-1.5"
            onClick={handleGenerateAiDescription}
            disabled={generatingAi}
          >
            <Sparkles className="size-3.5" />
            {generatingAi ? "Rédaction IA..." : "Rédiger avec Giya IA"}
          </Button>
        </div>
        <Textarea
          id="description"
          rows={4}
          placeholder="Décrivez le programme, les artistes, le dress-code..."
          className="rounded-xl resize-none"
          {...register("description")}
        />
      </div>

      {/* Dates & Hours Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Calendar className="size-4 text-primary" />
            Date et heure de début <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              type="date"
              className="h-11 rounded-xl flex-1"
              {...register("startDate", { required: "Date requise" })}
            />
            <Input
              type="time"
              className="h-11 rounded-xl w-28"
              {...register("startTime")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Calendar className="size-4 text-muted-foreground" />
            Date et heure de fin
          </Label>
          <div className="flex gap-2">
            <Input type="date" className="h-11 rounded-xl flex-1" {...register("endDate")} />
            <Input type="time" className="h-11 rounded-xl w-28" {...register("endTime")} />
          </div>
        </div>
      </div>

      {/* Lieu & Capacité */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="venueName" className="text-sm font-semibold flex items-center gap-1.5">
            <MapPin className="size-4 text-primary" />
            Nom du lieu / Salle <span className="text-destructive">*</span>
          </Label>
          <Input
            id="venueName"
            placeholder="Ex: Palais des Sports, Hôtel Radisson, Jardin Botanique"
            className="h-11 rounded-xl"
            {...register("venueName", { required: "Le lieu est requis" })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity" className="text-sm font-semibold">
            Capacité maximale (Jauge de sécurité)
          </Label>
          <Input
            id="capacity"
            type="number"
            placeholder="Ex: 500"
            className="h-11 rounded-xl"
            {...register("capacity", { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Visual / Flyer Upload Simulation */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Affiche / Flyer officiel</Label>
        <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors bg-muted/20 cursor-pointer">
          <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">
            Glissez votre affiche ici ou <span className="text-primary underline">parcourez vos fichiers</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou WEBP jusqu&apos;à 10 Mo</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" className="rounded-xl" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          className="rounded-xl bg-primary text-white font-semibold shadow-md shadow-primary/20"
          disabled={submitting}
        >
          {submitting ? "Enregistrement..." : initialData?.id ? "Mettre à jour" : "Publier l'événement"}
        </Button>
      </div>
    </form>
  );
}
