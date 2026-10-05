"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { Role } from "@/lib/constants";
import type { Category, Product, Table, Tenant } from "@/types/api";

// Ressources /admin/* génériques (docs/API_CONTRACT.md §2, §3, §4, §11–§13).
// Toutes les réponses sont enveloppées { success, data, meta? }.

async function get<T>(url: string) {
  const { data } = await api.get<ApiResponse<T>>(url);
  return data.data as T;
}

async function getPage<T>(url: string) {
  const { data } = await api.get<ApiResponse<T[]>>(url);
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0 } };
}

function useInvalidate(...keys: string[]) {
  const qc = useQueryClient();
  return () =>
    Promise.all(
      keys.map((k) => qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === k }))
    );
}

// ---------- Tenant ----------

export function useAdminTenantInfo() {
  return useQuery({ queryKey: ["admin-tenant"], queryFn: () => get<Tenant>("/admin/tenant") });
}

export type TenantUpdate = {
  name?: string;
  description?: string;
  phone?: string;
  address?: string;
  taxRate?: number; // points de base : 1800 = 18 %
  taxIncluded?: boolean;
};

export function useUpdateTenant() {
  const invalidate = useInvalidate("admin-tenant");
  return useMutation({
    mutationFn: (body: TenantUpdate) => api.patch("/admin/tenant", body),
    onSuccess: invalidate,
  });
}

// ---------- Catégories ----------

export type CategoryInput = { name: string; description?: string; sortOrder?: number; imageUrl?: string };

export function useSaveCategory() {
  const invalidate = useInvalidate("admin-categories", "categories");
  return useMutation({
    mutationFn: ({ id, ...body }: CategoryInput & { id?: string }) =>
      id ? api.patch(`/admin/categories/${id}`, body) : api.post("/admin/categories", body),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidate("admin-categories", "categories");
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: invalidate,
  });
}

// ---------- Articles ----------

export type ProductInput = {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isAvailable?: boolean;
  stock?: number | null;
  stockAlert?: number | null;
};

export function useSaveProduct() {
  const invalidate = useInvalidate("admin-products", "products", "dashboard-kpis");
  return useMutation({
    mutationFn: ({ id, ...body }: ProductInput & { id?: string }) =>
      id
        ? api.patch<ApiResponse<Product>>(`/admin/products/${id}`, body)
        : api.post<ApiResponse<Product>>("/admin/products", body),
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidate("admin-products", "products");
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: invalidate,
  });
}

// ---------- Stock ----------

export type StockMovement = {
  id: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  reason: string | null;
  createdAt: string;
};

export function useStockMovements(productId: string | null) {
  return useQuery({
    queryKey: ["stock-movements", productId],
    queryFn: () => get<StockMovement[]>(`/admin/products/${productId}/stock-movements`),
    enabled: !!productId,
  });
}

export function useStockMovement() {
  const invalidate = useInvalidate("admin-products", "stock-movements", "dashboard-kpis");
  return useMutation({
    mutationFn: ({
      productId,
      ...body
    }: {
      productId: string;
      type: "IN" | "ADJUSTMENT";
      quantity: number;
      reason?: string;
    }) => api.post(`/admin/products/${productId}/stock`, body),
    onSuccess: invalidate,
  });
}

// ---------- Tables ----------

export function useAdminTables() {
  return useQuery({ queryKey: ["admin-tables"], queryFn: () => get<Table[]>("/admin/tables") });
}

export function useSaveTable() {
  const invalidate = useInvalidate("admin-tables");
  return useMutation({
    mutationFn: ({ id, ...body }: { id?: string; number?: number; capacity?: number; status?: Table["status"] }) =>
      id ? api.patch(`/admin/tables/${id}`, body) : api.post("/admin/tables", body),
    onSuccess: invalidate,
  });
}

export function useDeleteTable() {
  const invalidate = useInvalidate("admin-tables");
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/tables/${id}`),
    onSuccess: invalidate,
  });
}

// ---------- Équipe ----------

export type MemberRole = Exclude<Role, "OWNER">;

export type Member = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export function useMembers(enabled = true) {
  return useQuery({
    queryKey: ["admin-members"],
    queryFn: () => get<Member[]>("/admin/users"),
    enabled,
  });
}

export function useCreateMember() {
  const invalidate = useInvalidate("admin-members");
  return useMutation({
    mutationFn: (body: {
      fullName: string;
      email?: string;
      phone?: string;
      role: MemberRole;
      temporaryPassword: string;
    }) => api.post("/admin/users", body),
    onSuccess: invalidate,
  });
}

export function useUpdateMember() {
  const invalidate = useInvalidate("admin-members");
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; role?: MemberRole; isActive?: boolean }) =>
      api.patch(`/admin/users/${id}`, body),
    onSuccess: invalidate,
  });
}

export function useResetMemberPassword() {
  return useMutation({
    mutationFn: ({ id, temporaryPassword }: { id: string; temporaryPassword: string }) =>
      api.post(`/admin/users/${id}/reset-password`, { temporaryPassword }),
  });
}

// ---------- Clients ----------

export type Customer = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  tags: string[];
  createdAt: string;
};

export function useCustomers(search: string, page: number, limit = 20) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search.trim()) qs.set("search", search.trim());
  return useQuery({
    queryKey: ["admin-customers", search.trim(), page],
    queryFn: () => getPage<Customer>(`/admin/customers?${qs}`),
    placeholderData: keepPreviousData,
  });
}

// ---------- Journal d'audit ----------

export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; fullName: string | null; role: string } | null;
};

export function useAuditLogs(page: number, actions?: string) {
  const qs = new URLSearchParams({ page: String(page), limit: "30" });
  if (actions) qs.set("actions", actions);
  return useQuery({
    queryKey: ["admin-audit", page, actions ?? ""],
    queryFn: () => getPage<AuditLog>(`/admin/audit-logs?${qs}`),
    placeholderData: keepPreviousData,
  });
}

export type { Category, Product };
