"use client";

import { useApiQuery } from "@/hooks/useApi";
import type { Category, Product } from "@/types/api";

// Lecture publique (vitrine) — GET /v1/tenants/:slug/categories|products.
export function useCategories(tenantSlug: string) {
  return useApiQuery<Category[]>(
    ["categories", tenantSlug],
    `/tenants/${tenantSlug}/categories`
  );
}

export function useProducts(tenantSlug: string) {
  return useApiQuery<Product[]>(["products", tenantSlug], `/tenants/${tenantSlug}/products`);
}

// Lecture admin (authentifiée, inclut les articles désactivés) —
// GET /v1/admin/categories|products.
export function useAdminCategories() {
  return useApiQuery<Category[]>(["admin-categories"], "/admin/categories");
}

export function useAdminProducts() {
  return useApiQuery<Product[]>(["admin-products"], "/admin/products");
}

// Mutations admin : voir hooks/useAdmin.ts (useSaveProduct, useDeleteProduct…).
