/**
 * Auth Service
 * Handles all authentication business logic
 */

import prisma from "@/lib/prisma";
import { getCurrentTenantId } from "@/lib/tenant";
import bcrypt from "bcryptjs";
import type { RegisterData, AuthUser } from "../types";

const SALT_ROUNDS = 12;

export class AuthService {
  /**
   * Find user by email (global - for login across tenants)
   * Usa findFirst con mode insensitive para soportar variaciones de mayúsculas
   */
  static async findUserByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    return prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: "insensitive" },
      },
      include: {
        role: true,
        tenant: true,
      },
    });
  }

  /**
   * Find user by email within current tenant
   */
  static async findUserByEmailInTenant(email: string) {
    const tenantId = await getCurrentTenantId();
    if (!tenantId) return null;

    return prisma.user.findFirst({
      where: { email, tenantId },
      include: {
        role: true,
        tenant: true,
      },
    });
  }

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Create a new user with hashed password
   */
  static async createUser(data: RegisterData & { roleId: string; tenantId?: string }) {
    const hashedPassword = await this.hashPassword(data.password);
    const tenantId = data.tenantId || await getCurrentTenantId();

    if (!tenantId) {
      throw new Error("No se pudo determinar el tenant para crear el usuario. Asegúrese de acceder desde el subdominio correcto.");
    }

    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        roleId: data.roleId,
        tenantId,
      },
      include: {
        role: true,
        tenant: true,
      },
    });
  }

  /**
   * Get default user role for current tenant
   */
  static async getDefaultRole() {
    const tenantId = await getCurrentTenantId();
    return prisma.role.findFirst({
      where: { name: "user", ...(tenantId && { tenantId }) },
    });
  }

  /**
   * Get role by name within tenant
   */
  static async getRoleByName(name: string) {
    const tenantId = await getCurrentTenantId();
    return prisma.role.findFirst({
      where: { name, ...(tenantId && { tenantId }) },
    });
  }

  /**
   * Create a session for user
   */
  static async createSession(userId: string, sessionToken: string, expires: Date) {
    return prisma.session.create({
      data: {
        userId,
        sessionToken,
        expires,
      },
    });
  }

  /**
   * Delete user session
   */
  static async deleteSession(sessionToken: string) {
    return prisma.session.delete({
      where: { sessionToken },
    });
  }

  /**
   * Validate session
   */
  static async validateSession(sessionToken: string) {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!session || session.expires < new Date()) {
      return null;
    }

    return session;
  }

  /**
   * Map database user to AuthUser
   */
  static mapToAuthUser(user: Awaited<ReturnType<typeof this.findUserByEmail>>): AuthUser | null {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            permissions: user.role.permissions,
          }
        : null,
      platformRole: user.platformRole,
      invitationLimit: user.invitationLimit,
      tenantId: user.tenantId,
      mustChangePassword: user.mustChangePassword ?? false,
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
      } : undefined,
    };
  }

  /**
   * Validate user belongs to current tenant
   */
  static async validateUserTenant(userId: string): Promise<boolean> {
    const tenantId = await getCurrentTenantId();
    if (!tenantId) return false;

    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId }
    });

    return !!user;
  }
}
