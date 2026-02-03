/**
 * Users Service
 * Handles all user management business logic
 */

import prisma from "@/lib/prisma";
import { getCurrentTenantId } from "@/lib/tenant";
import type {
  User,
  UpdateUserData,
  UpdateProfileData,
  UsersListParams,
  UsersListResponse,
} from "../types";

export class UsersService {
  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    const tenantId = await getCurrentTenantId() as string;
    const user = await prisma.user.findFirst({
      where: { id, tenantId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        profile: true,
      },
    });

    return user as User | null;
  }

  /**
   * Get paginated list of users
   */
  static async getUsers(params: UsersListParams): Promise<UsersListResponse> {
    const { page = 1, limit = 10, search, roleId, isActive } = params;
    const skip = (page - 1) * limit;
    const tenantId = await getCurrentTenantId() as string;

    const where = {
      tenantId,
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(roleId && { roleId }),
      ...(typeof isActive === "boolean" && { isActive }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          profile: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users as User[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update user basic information
   */
  static async updateUser(id: string, data: UpdateUserData): Promise<User | null> {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar pertenencia al tenant
    const existing = await prisma.user.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new Error("Usuario no encontrado o no pertenece a este instituto");
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        profile: true,
      },
    });

    return user as User;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: UpdateProfileData): Promise<User | null> {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar pertenencia al tenant
    const existing = await prisma.user.findFirst({
      where: { id: userId, tenantId }
    });

    if (!existing) {
      throw new Error("Usuario no encontrado o no pertenece a este instituto");
    }

    // Upsert profile (create if doesn't exist, update if exists)
    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return this.getUserById(userId);
  }

  /**
   * Deactivate user (soft delete)
   */
  static async deactivateUser(id: string): Promise<User | null> {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar pertenencia
    const existing = await prisma.user.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new Error("Usuario no encontrado o no pertenece a este instituto");
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        profile: true,
      },
    });

    return user as User;
  }

  /**
   * Activate user
   */
  static async activateUser(id: string): Promise<User | null> {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar pertenencia
    const existing = await prisma.user.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new Error("Usuario no encontrado o no pertenece a este instituto");
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        profile: true,
      },
    });

    return user as User;
  }

  /**
   * Delete user permanently
   */
  static async deleteUser(id: string): Promise<void> {
    const tenantId = await getCurrentTenantId() as string;

    // Verificar pertenencia
    const existing = await prisma.user.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new Error("Usuario no encontrado o no pertenece a este instituto");
    }

    await prisma.user.delete({
      where: { id },
    });
  }
}
