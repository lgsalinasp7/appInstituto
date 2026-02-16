import { describe, it, expect, vi, beforeEach } from "vitest";
import { TenantsService } from "@/modules/tenants/services/tenants.service";

const mockTenant = {
  id: "tenant-1",
  name: "Test Tenant",
  slug: "test-tenant",
  email: "admin@test.com",
  status: "ACTIVO",
  plan: "BASICO",
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { users: 1, students: 0, payments: 0 },
};

const mockTenants = [mockTenant];

vi.mock("@/lib/prisma", () => ({
  prisma: {
    tenant: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    role: {
      create: vi.fn(),
    },
    user: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

describe("TenantsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("retorna lista paginada de tenants", async () => {
      vi.mocked(prisma.tenant.findMany).mockResolvedValue(mockTenants as any);
      vi.mocked(prisma.tenant.count).mockResolvedValue(1);

      const result = await TenantsService.getAll({ page: 1, limit: 10 });

      expect(result.tenants).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(prisma.tenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: { createdAt: "desc" },
        })
      );
    });

    it("aplica filtros de búsqueda", async () => {
      vi.mocked(prisma.tenant.findMany).mockResolvedValue([]);
      vi.mocked(prisma.tenant.count).mockResolvedValue(0);

      await TenantsService.getAll({ search: "edutec" });

      expect(prisma.tenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.any(Object) }),
              expect.objectContaining({ slug: expect.any(Object) }),
              expect.objectContaining({ email: expect.any(Object) }),
            ]),
          }),
        })
      );
    });

    it("aplica filtro de status", async () => {
      vi.mocked(prisma.tenant.findMany).mockResolvedValue([]);
      vi.mocked(prisma.tenant.count).mockResolvedValue(0);

      await TenantsService.getAll({ status: "ACTIVO" });

      expect(prisma.tenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "ACTIVO" }),
        })
      );
    });
  });

  describe("getBySlug", () => {
    it("retorna tenant por slug", async () => {
      vi.mocked(prisma.tenant.findUnique).mockResolvedValue(mockTenant as any);

      const result = await TenantsService.getBySlug("test-tenant");

      expect(result).toEqual(mockTenant);
      expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { slug: "test-tenant" },
        include: expect.any(Object),
      });
    });

    it("retorna null para slug inexistente", async () => {
      vi.mocked(prisma.tenant.findUnique).mockResolvedValue(null);

      const result = await TenantsService.getBySlug("no-existe");

      expect(result).toBeNull();
    });
  });

  describe("isSlugAvailable", () => {
    it("retorna true cuando slug está disponible", async () => {
      vi.mocked(prisma.tenant.findFirst).mockResolvedValue(null);

      const result = await TenantsService.isSlugAvailable("nuevo-tenant");

      expect(result).toBe(true);
    });

    it("retorna false cuando slug ya existe", async () => {
      vi.mocked(prisma.tenant.findFirst).mockResolvedValue(mockTenant as any);

      const result = await TenantsService.isSlugAvailable("test-tenant");

      expect(result).toBe(false);
    });

    it("excluye id al verificar disponibilidad", async () => {
      vi.mocked(prisma.tenant.findFirst).mockResolvedValue(null);

      await TenantsService.isSlugAvailable("test-tenant", "tenant-1");

      expect(prisma.tenant.findFirst).toHaveBeenCalledWith({
        where: expect.objectContaining({
          slug: "test-tenant",
          NOT: { id: "tenant-1" },
        }),
      });
    });
  });

  describe("getStats", () => {
    it("retorna estadísticas de tenants", async () => {
      vi.mocked(prisma.tenant.count)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(7)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);

      const result = await TenantsService.getStats();

      expect(result).toEqual({
        total: 10,
        activos: 7,
        pendientes: 1,
        suspendidos: 1,
        cancelados: 1,
      });
    });
  });

  describe("suspend, activate, cancel", () => {
    it("suspend llama update con status SUSPENDIDO", async () => {
      vi.mocked(prisma.tenant.update).mockResolvedValue({
        ...mockTenant,
        status: "SUSPENDIDO",
      } as any);

      const result = await TenantsService.suspend("tenant-1");

      expect(result.status).toBe("SUSPENDIDO");
      expect(prisma.tenant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "tenant-1" },
          data: { status: "SUSPENDIDO" },
        })
      );
    });

    it("activate llama update con status ACTIVO", async () => {
      vi.mocked(prisma.tenant.update).mockResolvedValue({
        ...mockTenant,
        status: "ACTIVO",
      } as any);

      const result = await TenantsService.activate("tenant-1");

      expect(result.status).toBe("ACTIVO");
    });
  });
});
