/**
 * Tenant Module Types
 * Types for super-admin tenant management
 */

export type TenantStatus = 'ACTIVO' | 'PENDIENTE' | 'SUSPENDIDO' | 'CANCELADO';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  status: TenantStatus;
  plan: string;
  email: string | null;
  subscriptionEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    users: number;
    students: number;
    payments: number;
  };
}

export interface TenantWithDetails extends Tenant {
  users: TenantUser[];
  adminUser: TenantUser | null;
}

export interface TenantUser {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  role: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

export interface CreateTenantData {
  name: string;
  slug: string;
  email: string;
  plan?: string;
  adminName?: string;
  adminPassword?: string;
  subscriptionEndsAt?: Date;
}

export interface UpdateTenantData {
  name?: string;
  slug?: string;
  domain?: string;
  status?: TenantStatus;
  plan?: string;
  email?: string;
  subscriptionEndsAt?: Date;
}

export interface TenantFilters {
  search?: string;
  status?: TenantStatus;
  plan?: string;
  page?: number;
  limit?: number;
}

export interface TenantsListResponse {
  tenants: Tenant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TenantStats {
  total: number;
  activos: number;
  pendientes: number;
  suspendidos: number;
  cancelados: number;
}
