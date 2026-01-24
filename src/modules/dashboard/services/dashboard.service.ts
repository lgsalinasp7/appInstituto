/**
 * Dashboard Service
 * Handles all dashboard business logic and statistics
 * Note: Currently uses mock Prisma client. Connect to real DB for production.
 */

import prisma from "@/lib/prisma";
import type { LegacyDashboardStats, RecentActivity } from "../types";
import type { Prisma } from "@prisma/client";

export class DashboardService {
  /**
   * Get dashboard statistics (legacy - for old dashboard components)
   */
  static async getStats(): Promise<LegacyDashboardStats> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalUsers, activeUsers, newUsersToday, newUsersThisMonth] = await Promise.all([
        prisma.user.count(),
        prisma.user.count(),
        prisma.user.count(),
        prisma.user.count(),
      ]);

      return {
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisMonth,
      };
    } catch {
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        newUsersThisMonth: 0,
      };
    }
  }

  /**
   * Get recent activity from audit logs
   * Note: Returns empty array when using mock client
   */
  static async getRecentActivity(_limit: number = 10): Promise<RecentActivity[]> {
    try {
      const logs = await prisma.auditLog.findMany();
      return logs as unknown as RecentActivity[];
    } catch {
      return [];
    }
  }

  /**
   * Log an action to audit log
   * Note: No-op when using mock client
   */
  static async logAction(_params: {
    action: string;
    entity: string;
    entityId?: string;
    userId?: string;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await prisma.auditLog.create();
    } catch {
      console.warn("Audit logging not available (mock client)");
    }
  }
}
