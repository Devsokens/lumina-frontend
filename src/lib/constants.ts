export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "lumina.ga";

// Rôles RBAC — voir LUMINA_Document_Maitre_v2.md section 12.
export const ROLES = ["OWNER", "MANAGER", "STAFF", "KITCHEN", "CASHIER"] as const;
export type Role = (typeof ROLES)[number];

export const SECTORS = ["RESTAURANT", "EVENT", "SHOP"] as const;
export type Sector = (typeof SECTORS)[number];
