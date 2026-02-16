import { describe, it, expect, vi, beforeEach } from "vitest";
import { StudentService } from "@/modules/students/services/student.service";

vi.mock("@/lib/tenant", () => ({
  getCurrentTenantId: vi.fn().mockResolvedValue("tenant-1"),
}));

const mockStudent = {
  id: "s1",
  fullName: "Juan Pérez",
  documentType: "CC",
  documentNumber: "123456",
  email: "juan@test.com",
  status: "MATRICULADO",
  totalProgramValue: 5000000,
  payments: [{ amount: 1000000 }],
  program: { id: "p1", name: "Programa A" },
  advisor: { id: "a1", name: "Asesor", email: "asesor@test.com" },
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    student: {
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

describe("StudentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.student.findMany).mockResolvedValue([mockStudent]);
    vi.mocked(prisma.student.count).mockResolvedValue(1);
  });

  describe("getStudents", () => {
    it("retorna lista paginada de estudiantes", async () => {
      const result = await StudentService.getStudents({
        page: 1,
        limit: 10,
      });

      expect(result.students).toHaveLength(1);
      expect(result.students[0].fullName).toBe("Juan Pérez");
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("calcula remainingBalance correctamente", async () => {
      const result = await StudentService.getStudents({
        page: 1,
        limit: 10,
      });

      expect(result.students[0].totalPaid).toBe(1000000);
      expect(result.students[0].remainingBalance).toBe(4000000);
    });

    it("aplica filtro de búsqueda", async () => {
      await StudentService.getStudents({
        search: "Juan",
      });

      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: "tenant-1",
            OR: expect.any(Array),
          }),
        })
      );
    });
  });

  describe("getStudentById", () => {
    it("retorna estudiante por id", async () => {
      vi.mocked(prisma.student.findFirst).mockResolvedValue(mockStudent);

      const result = await StudentService.getStudentById("s1");

      expect(result).not.toBeNull();
      expect(result?.fullName).toBe("Juan Pérez");
    });

    it("retorna null para id inexistente", async () => {
      vi.mocked(prisma.student.findFirst).mockResolvedValue(null);

      const result = await StudentService.getStudentById("no-existe");

      expect(result).toBeNull();
    });
  });
});
