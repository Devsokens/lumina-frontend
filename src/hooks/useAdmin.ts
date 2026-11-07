"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { Role } from "@/lib/constants";
import type { Category, Product, Table, Tenant } from "@/types/api";
import type { ShowcaseContent } from "@/stores/useShowcaseStore";
import type { SiteConfig } from "@/lib/site";
import type { StaySiteConfig } from "@/lib/stay-site";

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
  logoUrl?: string; // https ou data URL ; "" = retirer
  contactEmail?: string; // "" = retirer
  legalName?: string;
  nif?: string;
  rccm?: string;
};

// ---------- E-mails et messages (Tenant.settings.emails) ----------

export type MessageKind = "ticket" | "certificate" | "reminder" | "survey";
export type MessageTemplate = { subject: string; body: string; cta: string; enabled: boolean };
export type EmailSettings = {
  senderName: string;
  replyTo: string;
  templates: Partial<Record<MessageKind, MessageTemplate>>;
};

export function useSaveEmailSettings() {
  const invalidate = useInvalidate("admin-tenant");
  return useMutation({
    mutationFn: (body: EmailSettings) => api.put("/admin/tenant/emails", body),
    onSuccess: invalidate,
  });
}

export function useTestEmail() {
  return useMutation({
    mutationFn: async (kind: MessageKind) => {
      const { data } = await api.post<ApiResponse<{ sentTo: string }>>("/admin/tenant/emails/test", { kind });
      return data.data?.sentTo ?? "";
    },
  });
}

// ---------- Comptes de versement (Tenant.settings.payouts) ----------

export type PayoutOperator = "AIRTEL" | "MOOV";
export type PayoutAccount = { operator: PayoutOperator; phone: string; holderName: string; verifiedAt: string | null };
export type Payouts = { frequency: "AFTER_EVENT" | "WEEKLY"; accounts: PayoutAccount[] };

export function useSavePayouts() {
  const invalidate = useInvalidate("admin-tenant");
  return useMutation({
    mutationFn: (body: { frequency: Payouts["frequency"]; accounts: Omit<PayoutAccount, "verifiedAt">[] }) =>
      api.put("/admin/tenant/payouts", body),
    onSuccess: invalidate,
  });
}

export function usePayoutCode() {
  return useMutation({
    mutationFn: async (operator: PayoutOperator) => {
      const { data } = await api.post<ApiResponse<{ sentTo: string }>>("/admin/tenant/payouts/verify", { operator });
      return data.data?.sentTo ?? "";
    },
  });
}

export function useConfirmPayout() {
  const invalidate = useInvalidate("admin-tenant");
  return useMutation({
    mutationFn: (body: { operator: PayoutOperator; code: string }) => api.post("/admin/tenant/payouts/confirm", body),
    onSuccess: invalidate,
  });
}

export function useUpdateTenant() {
  const invalidate = useInvalidate("admin-tenant");
  return useMutation({
    mutationFn: (body: TenantUpdate) => api.patch("/admin/tenant", body),
    onSuccess: invalidate,
  });
}

// Vitrine publique (tenant.config.showcase) — PUT /admin/tenant/showcase.
export function useSaveShowcase() {
  const invalidate = useInvalidate("admin-tenant");
  return useMutation({
    mutationFn: (body: ShowcaseContent) => api.put("/admin/tenant/showcase", body),
    onSuccess: invalidate,
  });
}

// Site restaurant / boutique (tenant.config.site) — PUT /admin/tenant/site.
export function useSaveSite() {
  const invalidate = useInvalidate("admin-tenant", "public-tenant");
  return useMutation({
    mutationFn: (body: SiteConfig) => api.put("/admin/tenant/site", body),
    onSuccess: invalidate,
  });
}

export function useSaveStaySite() {
  const invalidate = useInvalidate("admin-tenant", "public-tenant");
  return useMutation({
    mutationFn: (body: StaySiteConfig) => api.put("/admin/tenant/stay-site", body, { timeout: 60_000 }),
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
  // Événements accessibles (vide = tous) ; invitation par lien non activée.
  eventIds: string[];
  invitePending: boolean;
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
    // invite: lien d'invitation (le membre choisit son mot de passe) ;
    // sinon mot de passe temporaire. eventIds vide = tous les événements.
    mutationFn: async (body: {
      fullName: string;
      email?: string;
      phone?: string;
      role: MemberRole;
      temporaryPassword?: string;
      invite?: boolean;
      eventIds?: string[];
    }) => {
      const { data } = await api.post<ApiResponse<Member & { inviteUrl?: string }>>("/admin/users", body);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useResendInvite() {
  const invalidate = useInvalidate("admin-members");
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiResponse<{ inviteUrl: string }>>(`/admin/users/${id}/invite`);
      return data.data?.inviteUrl ?? "";
    },
    onSuccess: invalidate,
  });
}

export function useUpdateMember() {
  const invalidate = useInvalidate("admin-members");
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; role?: MemberRole; isActive?: boolean; eventIds?: string[] }) =>
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
