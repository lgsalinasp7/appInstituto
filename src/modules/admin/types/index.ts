/**
 * Admin Module Types
 * Defines all TypeScript interfaces for admin functionality
 */

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    users: number;
  };
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  userId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface AuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Predefined permissions
export const PERMISSIONS = {
  // User permissions
  USERS_READ: "users:read",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  
  // Role permissions
  ROLES_READ: "roles:read",
  ROLES_CREATE: "roles:create",
  ROLES_UPDATE: "roles:update",
  ROLES_DELETE: "roles:delete",
  
  // Audit permissions
  AUDIT_READ: "audit:read",
  
  // Admin permissions
  ADMIN_ACCESS: "admin:access",
  ADMIN_FULL: "admin:full",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
