import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "@/modules/auth/services/auth.service";

// Mock getCurrentTenantId para métodos que lo usan
vi.mock("@/lib/tenant", () => ({
  getCurrentTenantId: vi.fn().mockResolvedValue("tenant-123"),
}));

// Mock Prisma - debe estar antes del import de AuthService
vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    role: {
      findFirst: vi.fn(),
    },
  },
}));

describe("AuthService", () => {
  describe("hashPassword", () => {
    it("genera hash diferente para la misma contraseña", async () => {
      const password = "TestPassword123!";
      const hash1 = await AuthService.hashPassword(password);
      const hash2 = await AuthService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
      expect(hash1).toMatch(/^\$2[aby]\$/);
      expect(hash2).toMatch(/^\$2[aby]\$/);
    });

    it("genera hash de longitud válida", async () => {
      const hash = await AuthService.hashPassword("password123");
      expect(hash.length).toBeGreaterThan(50);
    });
  });

  describe("verifyPassword", () => {
    it("retorna true para contraseña correcta", async () => {
      const password = "TestPassword123!";
      const hash = await AuthService.hashPassword(password);
      const isValid = await AuthService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("retorna false para contraseña incorrecta", async () => {
      const hash = await AuthService.hashPassword("correct");
      const isValid = await AuthService.verifyPassword("wrong", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("mapToAuthUser", () => {
    it("retorna null para user null", () => {
      expect(AuthService.mapToAuthUser(null)).toBe(null);
    });

    it("mapea usuario con rol correctamente", () => {
      const dbUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        image: null,
        isActive: true,
        tenantId: "tenant-1",
        roleId: "role-1",
        platformRole: null,
        invitationLimit: 0,
        role: {
          id: "role-1",
          name: "Admin",
          permissions: ["read", "write"],
        },
        tenant: {
          id: "tenant-1",
          name: "Test Tenant",
          slug: "test",
        },
      } as any;

      const authUser = AuthService.mapToAuthUser(dbUser);

      expect(authUser).toEqual({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        image: null,
        role: {
          id: "role-1",
          name: "Admin",
          permissions: ["read", "write"],
        },
        platformRole: null,
        invitationLimit: 0,
        tenantId: "tenant-1",
        mustChangePassword: false,
        tenant: {
          id: "tenant-1",
          name: "Test Tenant",
          slug: "test",
        },
      });
    });

    it("mapea usuario sin rol", () => {
      const dbUser = {
        id: "user-2",
        email: "noreply@example.com",
        name: null,
        image: null,
        isActive: true,
        tenantId: null,
        roleId: null,
        platformRole: null,
        invitationLimit: 0,
        role: null,
        tenant: null,
      } as any;

      const authUser = AuthService.mapToAuthUser(dbUser);

      expect(authUser?.role).toBeNull();
      expect(authUser?.tenant).toBeUndefined();
      expect(authUser?.email).toBe("noreply@example.com");
    });
  });
});
