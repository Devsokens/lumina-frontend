"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
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

function invalidateProductQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] === "products" || query.queryKey[0] === "admin-products",
  });
}

// Mutations admin (authentifiées) — POST/PATCH/DELETE /v1/admin/products.
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useApiMutation<Omit<Product, "id">, Product>("post", "/admin/products", {
    onSuccess: () => invalidateProductQueries(queryClient),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useApiMutation<Partial<Product> & { id: string }, Product>(
    "patch",
    (input) => `/admin/products/${input.id}`,
    { onSuccess: () => invalidateProductQueries(queryClient) }
  );
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useApiMutation<{ id: string }, void>(
    "delete",
    (input) => `/admin/products/${input.id}`,
    { onSuccess: () => invalidateProductQueries(queryClient) }
  );
}
