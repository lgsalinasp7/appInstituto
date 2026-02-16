import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommitmentService } from "@/modules/commitments/services/commitment.service";

vi.mock("@/lib/tenant", () => ({
  getCurrentTenantId: vi.fn().mockResolvedValue("tenant-1"),
}));

const mockCommitment = {
  id: "c1",
  scheduledDate: new Date(),
  amount: 500000,
  status: "PENDIENTE",
  studentId: "s1",
  student: { id: "s1", fullName: "Juan", phone: "300" },
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    paymentCommitment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";

describe("CommitmentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.paymentCommitment.findMany).mockResolvedValue([mockCommitment]);
    vi.mocked(prisma.paymentCommitment.count).mockResolvedValue(1);
  });

  describe("getCommitments", () => {
    it("retorna lista paginada de compromisos", async () => {
      const result = await CommitmentService.getCommitments({
        page: 1,
        limit: 10,
      });

      expect(result.commitments).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(prisma.paymentCommitment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: "tenant-1" },
          skip: 0,
          take: 10,
        })
      );
    });

    it("aplica filtro de studentId", async () => {
      await CommitmentService.getCommitments({
        studentId: "s1",
      });

      expect(prisma.paymentCommitment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: "tenant-1",
            studentId: "s1",
          }),
        })
      );
    });
  });

  describe("markAsPaid", () => {
    it("marca compromiso como pagado", async () => {
      vi.mocked(prisma.paymentCommitment.findFirst).mockResolvedValue(mockCommitment);
      vi.mocked(prisma.paymentCommitment.update).mockResolvedValue({
        ...mockCommitment,
        status: "PAGADO",
      } as any);

      const result = await CommitmentService.markAsPaid("c1");

      expect(result.status).toBe("PAGADO");
      expect(prisma.paymentCommitment.update).toHaveBeenCalledWith({
        where: { id: "c1" },
        data: { status: "PAGADO" },
      });
    });

    it("lanza error cuando compromiso no existe", async () => {
      vi.mocked(prisma.paymentCommitment.findFirst).mockResolvedValue(null);

      await expect(CommitmentService.markAsPaid("no-existe")).rejects.toThrow(
        "Compromiso no encontrado"
      );
      expect(prisma.paymentCommitment.update).not.toHaveBeenCalled();
    });
  });

  describe("getOverdueCommitments", () => {
    it("retorna compromisos vencidos", async () => {
      vi.mocked(prisma.paymentCommitment.findMany).mockResolvedValue([mockCommitment]);

      const result = await CommitmentService.getOverdueCommitments();

      expect(result).toHaveLength(1);
      expect(prisma.paymentCommitment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: "tenant-1",
            status: "PENDIENTE",
            scheduledDate: expect.any(Object),
          }),
        })
      );
    });
  });
});
