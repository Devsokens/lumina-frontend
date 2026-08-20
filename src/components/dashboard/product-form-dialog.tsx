"use client";

import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useCreateProduct } from "@/hooks/useMenu";
import type { Category } from "@/types/api";

const productSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  priceXAF: z.number().min(0),
  categoryId: z.string().uuid("Choisissez une catégorie"),
});

type ProductFormInput = z.infer<typeof productSchema>;

export function ProductFormDialog({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const createProduct = useCreateProduct();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormInput>({ resolver: zodResolver(productSchema) });

  async function onSubmit(values: ProductFormInput) {
    try {
      await createProduct.mutateAsync({
        name: values.name,
        description: values.description ?? null,
        price: Math.round(values.priceXAF * 100),
        categoryId: values.categoryId,
        imageUrl: null,
        isAvailable: true,
        stock: null,
        stockAlert: null,
      });
      toast.success("Article ajouté");
      reset();
      setOpen(false);
    } catch {
      toast.error("Impossible d'ajouter l'article");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Ajouter un article
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Nouvel article</DialogTitle>
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
              <Input
                id="priceXAF"
                type="number"
                min={0}
                {...register("priceXAF", { valueAsNumber: true })}
              />
              {errors.priceXAF && (
                <p className="text-sm text-destructive">{errors.priceXAF.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <Select onValueChange={(v) => setValue("categoryId", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createProduct.isPending}>
              {createProduct.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
