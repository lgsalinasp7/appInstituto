/**
 * Admin Service
 * Handles all admin business logic
 */

import prisma from "@/lib/prisma";
import type {
  Role,
  CreateRoleData,
  UpdateRoleData,
  AuditLogsParams,
  AuditLogsResponse,
} from "../types";

export class AdminService {
  // ==========================================
  // ROLES MANAGEMENT
  // ==========================================

  /**
   * Get all roles
   */
  static async getRoles(): Promise<Role[]> {
    const roles = await prisma.role.findMany({
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
    const role = await prisma.role.findUnique({
      where: { id },
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
    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissions,
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
    return prisma.invitation.findMany({
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
    const [usersCount, rolesCount, sessionsCount, logsCount] = await Promise.all([
      prisma.user.count(),
      prisma.role.count(),
      prisma.session.count(),
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
