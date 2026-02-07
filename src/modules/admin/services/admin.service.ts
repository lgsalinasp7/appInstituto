/**
 * Admin Service
 * Handles all admin business logic
 */

import prisma from "@/lib/prisma";
import { getCurrentTenantId } from "@/lib/tenant";
import { cache } from "react";
import type {
  Role,
  CreateRoleData,
  UpdateRoleData,
  AuditLogsParams,
  AuditLogsResponse,
} from "../types";

// Const types pattern (typescript skill)
const PLAN_PRICES = {
  BASICO: 49,
  PROFESIONAL: 149,
  EMPRESARIAL: 499,
} as const;

type PlanName = keyof typeof PLAN_PRICES;

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  cancelledTenants: number;
  totalUsers: number;
  mrr: number;
  churnRate: number;
  tenantsByPlan: { plan: string; count: number }[];
  recentTenants: { id: string; name: string; plan: string; status: string; createdAt: Date }[];
}

export class AdminService {
  // ==========================================
  // PLATFORM STATS (SaaS Metrics)
  // ==========================================

  /**
   * Get platform-wide SaaS statistics
   * React.cache() for deduplication within same request (server-cache-react)
   */
  static getPlatformStats = cache(async (): Promise<PlatformStats> => {
    // Promise.all for parallel queries (async-parallel)
    const [
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
      cancelledTenants,
      totalUsers,
      tenantsByPlan,
      recentTenants,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: "ACTIVO" } }),
      prisma.tenant.count({ where: { status: "PENDIENTE" } }),
      prisma.tenant.count({ where: { status: "SUSPENDIDO" } }),
      prisma.tenant.count({ where: { status: "CANCELADO" } }),
      prisma.user.count(),
      prisma.tenant.groupBy({ by: ["plan"], _count: true }),
      prisma.tenant.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, plan: true, status: true, createdAt: true },
      }),
    ]);

    // Calculate MRR from active tenants by plan
    const mrr = tenantsByPlan.reduce((sum, group) => {
      const price = PLAN_PRICES[group.plan as PlanName] ?? 0;
      return sum + price * group._count;
    }, 0);

    const churnRate =
      totalTenants > 0
        ? Math.round((cancelledTenants / totalTenants) * 100)
        : 0;

    return {
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
      cancelledTenants,
      totalUsers,
      mrr,
      churnRate,
      tenantsByPlan: tenantsByPlan.map((g) => ({ plan: g.plan, count: g._count })),
      recentTenants,
    };
  });

  // ==========================================
  // ROLES MANAGEMENT
  // ==========================================

  /**
   * Get all roles
   */
  static async getRoles(): Promise<Role[]> {
    const tenantId = await getCurrentTenantId() as string;

    const roles = await prisma.role.findMany({
      where: {
        ...(tenantId && { tenantId }),
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return roles as Role[];
  }

  /**
   * Get role by ID
   */
  static async getRoleById(id: string): Promise<Role | null> {
    const tenantId = await getCurrentTenantId() as string;

    const role = await prisma.role.findFirst({
      where: {
        id,
        ...(tenantId && { tenantId })
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return role as Role | null;
  }

  /**
   * Create a new role
   */
  static async createRole(data: CreateRoleData): Promise<Role> {
    const tenantId = await getCurrentTenantId() as string;

    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissions,
        tenantId,
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return role as Role;
  }

  /**
   * Update an existing role
   */
  static async updateRole(id: string, data: UpdateRoleData): Promise<Role | null> {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar pertenencia
    const existing = await prisma.role.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new Error("Rol no encontrado o no pertenece a este instituto");
    }

    const role = await prisma.role.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return role as Role;
  }

  /**
   * Delete a role
   */
  static async deleteRole(id: string): Promise<void> {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar pertenencia
    const existing = await prisma.role.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new Error("Rol no encontrado o no pertenece a este instituto");
    }

    await prisma.role.delete({
      where: { id },
    });
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================

  /**
   * Get paginated audit logs
   */
  static async getAuditLogs(params: AuditLogsParams): Promise<AuditLogsResponse> {
    const { page = 1, limit = 20, action, entity, userId, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where = {
      ...(action && { action }),
      ...(entity && { entity }),
      ...(userId && { userId }),
      ...(startDate || endDate
        ? {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map((log) => ({
        ...log,
        metadata: log.metadata as Record<string, unknown> | null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==========================================
  // INVITATIONS MANAGEMENT
  // ==========================================

  /**
   * Get all invitations
   */
  static async getInvitations() {
    const tenantId = await getCurrentTenantId();

    return prisma.invitation.findMany({
      where: {
        ...(tenantId && { tenantId }),
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ==========================================
  // USER MANAGEMENT (Admin)
  // ==========================================

  /**
   * Change user role
   */
  static async changeUserRole(userId: string, roleId: string) {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar que el usuario pertenece al tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId }
    });

    if (!user) {
      throw new Error("Usuario no encontrado o no pertenece a este instituto");
    }

    // Verificar que el rol pertenece al tenant
    const role = await prisma.role.findFirst({
      where: { id: roleId, tenantId }
    });

    if (!role) {
      throw new Error("Rol no encontrado o no pertenece a este instituto");
    }

    return prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: {
        role: true,
      },
    });
  }

  /**
   * Get system statistics for admin
   */
  static async getSystemStats() {
    const tenantId = await getCurrentTenantId();

    // Si no hay tenant (SUPERADMIN sin subdominio), mostrar stats globales
    const tenantFilter = {
      ...(tenantId && { tenantId })
    };
    const userTenantFilter = {
      ...(tenantId && { user: { tenantId } })
    };

    const [usersCount, rolesCount, sessionsCount, logsCount] = await Promise.all([
      prisma.user.count({ where: tenantFilter }),
      prisma.role.count({ where: tenantFilter }),
      prisma.session.count({ where: userTenantFilter }),
      prisma.auditLog.count(),
    ]);

    return {
      usersCount,
      rolesCount,
      sessionsCount,
      logsCount,
    };
  }
}
