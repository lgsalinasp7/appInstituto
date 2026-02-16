import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProgramService } from "@/modules/programs/services/program.service";

vi.mock("@/lib/tenant", () => ({
  getCurrentTenantId: vi.fn().mockResolvedValue("tenant-1"),
}));

const mockProgram = {
  id: "p1",
  name: "Programa A",
  description: "Descripción",
  totalValue: 5000000,
  matriculaValue: 500000,
  modulesCount: 10,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { students: 5, prospects: 3 },
} as any;

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    program: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import { getCurrentTenantId } from "@/lib/tenant";

describe("ProgramService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentTenantId).mockResolvedValue("tenant-1");
    vi.mocked(prisma.program.findMany).mockResolvedValue([mockProgram]);
    vi.mocked(prisma.program.count).mockResolvedValue(1);
    vi.mocked(prisma.program.findFirst).mockResolvedValue(mockProgram);
  });

  describe("getPrograms", () => {
    it("retorna lista vacía cuando no hay tenantId", async () => {
      vi.mocked(getCurrentTenantId).mockResolvedValue(null);

      const result = await ProgramService.getPrograms();

      expect(result.programs).toEqual([]);
      expect(result.total).toBe(0);
      expect(prisma.program.findMany).not.toHaveBeenCalled();
    });

    it("retorna programas activos por defecto", async () => {
      const result = await ProgramService.getPrograms();

      expect(result.programs).toHaveLength(1);
      expect(result.programs[0].name).toBe("Programa A");
      expect(prisma.program.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true, tenantId: "tenant-1" },
        })
      );
    });

    it("incluye inactivos cuando includeInactive es true", async () => {
      await ProgramService.getPrograms(true);

      expect(prisma.program.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: "tenant-1" },
        })
      );
    });
  });

  describe("getProgramById", () => {
    it("retorna programa por id", async () => {
      vi.mocked(prisma.program.findFirst).mockResolvedValue(mockProgram);

      const result = await ProgramService.getProgramById("p1");

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Programa A");
    });

    it("retorna null para id inexistente", async () => {
      vi.mocked(prisma.program.findFirst).mockResolvedValue(null);

      const result = await ProgramService.getProgramById("no-existe");

      expect(result).toBeNull();
    });
  });
});
