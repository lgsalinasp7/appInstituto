/**
 * Auth Service
 * Handles all authentication business logic
 */

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { RegisterData, AuthUser } from "../types";

const SALT_ROUNDS = 12;

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
  static async createUser(data: RegisterData & { roleId: string }) {
    const hashedPassword = await this.hashPassword(data.password);

    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
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
      invitationLimit: user.invitationLimit,
    };
  }
}
