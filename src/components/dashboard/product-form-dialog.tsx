"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveProduct } from "@/hooks/useAdmin";
import { apiError } from "@/lib/api";
import type { Category, Product } from "@/types/api";

const productSchema = z
  .object({
    name: z.string().trim().min(2, "2 caractères minimum").max(120),
    description: z.string().max(1000).optional(),
    priceXAF: z.number({ invalid_type_error: "Prix requis" }).min(0).max(1_000_000),
    categoryId: z.string().uuid("Choisissez une catégorie"),
    imageUrl: z.string().url("URL invalide (https://…)").optional().or(z.literal("")),
    trackStock: z.boolean(),
    stockAlert: z.number().int().min(0).optional(),
  })
  .refine((v) => !v.trackStock || v.stockAlert !== undefined, {
    message: "Seuil d'alerte requis",
    path: ["stockAlert"],
  });

type ProductFormInput = z.infer<typeof productSchema>;

// Création ou modification d'un article (docs/API_CONTRACT.md §3). Prix
// saisi en FCFA, envoyé en centimes. Le niveau de stock se règle ensuite
// par des mouvements (page Stock), jamais par écrasement ici.
export function ProductFormDialog({
  categories,
  product,
  open,
  onOpenChange,
}: {
  categories: Category[];
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const save = useSaveProduct();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormInput>({ resolver: zodResolver(productSchema) });

  useEffect(() => {
    if (!open) return;
    reset({
      name: product?.name ?? "",
      description: product?.description ?? "",
      priceXAF: product ? product.price / 100 : (undefined as unknown as number),
      categoryId: product?.categoryId ?? categories[0]?.id ?? "",
      imageUrl: product?.imageUrl ?? "",
      trackStock: product ? product.stock !== null : false,
      stockAlert: product?.stockAlert ?? undefined,
    });
  }, [open, product, categories, reset]);

  const trackStock = watch("trackStock");

  async function onSubmit(values: ProductFormInput) {
    setSubmitting(true);
    try {
      await save.mutateAsync({
        ...(product ? { id: product.id } : {}),
        name: values.name,
        ...(values.description ? { description: values.description } : {}),
        price: Math.round(values.priceXAF * 100),
        categoryId: values.categoryId,
        ...(values.imageUrl ? { imageUrl: values.imageUrl } : {}),
        // Suivi activé : stock initial 0 à la création, conservé sinon.
        stock: values.trackStock ? (product?.stock ?? 0) : null,
        stockAlert: values.trackStock ? values.stockAlert ?? 0 : null,
      });
      toast.success(product ? "Article modifié" : "Article ajouté");
      onOpenChange(false);
    } catch (err) {
      toast.error(apiError(err, "Enregistrement impossible"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">{product ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="priceXAF">Prix (FCFA)</Label>
              <Input id="priceXAF" type="number" min={0} step={5} {...register("priceXAF", { valueAsNumber: true })} />
              {errors.priceXAF && <p className="text-sm text-destructive">{errors.priceXAF.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Catégorie</Label>
              <select
                id="categoryId"
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                {...register("categoryId")}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">Photo (URL https, optionnelle)</Label>
            <Input id="imageUrl" type="url" placeholder="https://…" {...register("imageUrl")} />
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("trackStock")} />
            Suivre le stock de cet article
          </label>
          {trackStock && (
            <div className="space-y-1.5">
              <Label htmlFor="stockAlert">Seuil d&apos;alerte</Label>
              <Input
                id="stockAlert"
                type="number"
                min={0}
                {...register("stockAlert", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              />
              {errors.stockAlert && <p className="text-sm text-destructive">{errors.stockAlert.message}</p>}
              {!product && (
                <p className="text-xs text-muted-foreground">
                  Stock initial 0 : enregistrez la réception dans la page Stock.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={submitting || categories.length === 0}>
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
