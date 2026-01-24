/**
 * Auth Service
 * Handles all authentication business logic
 */

import prisma from "@/lib/prisma";
import type { LoginCredentials, RegisterData, AuthUser } from "../types";

export class AuthService {
  /**
   * Find user by email
   */
  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  /**
   * Create a new user
   */
  static async createUser(data: RegisterData & { roleId: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password, // Should be hashed before calling this
        name: data.name,
        roleId: data.roleId,
      },
      include: {
        role: true,
      },
    });
  }

  /**
   * Get default user role
   */
  static async getDefaultRole() {
    return prisma.role.findFirst({
      where: { name: "user" },
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
      role: {
        id: user.role.id,
        name: user.role.name,
        permissions: user.role.permissions,
      },
    };
  }
}
