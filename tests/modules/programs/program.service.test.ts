import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProgramService } from "@/modules/programs/services/program.service";

vi.mock("@/lib/tenant-guard", () => ({
  assertTenantContext: vi.fn((id: string | null | undefined) => {
    if (!id) throw new Error("Contexto de tenant requerido. El tenantId no puede ser null o undefined.");
  }),
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mock fixture matches Prisma include shape
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

describe("ProgramService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.program.findMany).mockResolvedValue([mockProgram]);
    vi.mocked(prisma.program.count).mockResolvedValue(1);
    vi.mocked(prisma.program.findFirst).mockResolvedValue(mockProgram);
  });

  describe("getPrograms", () => {
    it("lanza error cuando tenantId es inválido", async () => {
      await expect(
        ProgramService.getPrograms(false, "" as unknown as string)
      ).rejects.toThrow(/Contexto de tenant requerido/);
    });

    it("retorna programas activos por defecto", async () => {
      const result = await ProgramService.getPrograms(false, "tenant-1");

      expect(result.programs).toHaveLength(1);
      expect(result.programs[0].name).toBe("Programa A");
      expect(prisma.program.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true, tenantId: "tenant-1" },
        })
      );
    });

    it("incluye inactivos cuando includeInactive es true", async () => {
      await ProgramService.getPrograms(true, "tenant-1");

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

      const result = await ProgramService.getProgramById("p1", "tenant-1");

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Programa A");
    });

    it("retorna null para id inexistente", async () => {
      vi.mocked(prisma.program.findFirst).mockResolvedValue(null);

      const result = await ProgramService.getProgramById("no-existe", "tenant-1");

      expect(result).toBeNull();
    });
  });
});
