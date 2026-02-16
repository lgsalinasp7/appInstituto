import { describe, it, expect, vi, beforeEach } from "vitest";
import { CarteraService } from "@/modules/cartera/services/cartera.service";

vi.mock("@/lib/tenant", () => ({
  getCurrentTenantId: vi.fn().mockResolvedValue("tenant-1"),
}));

const mockCommitment = {
  id: "c1",
  scheduledDate: new Date(),
  amount: 500000,
  status: "PENDIENTE",
  studentId: "s1",
  student: { id: "s1", fullName: "Juan", documentNumber: "123" },
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
      aggregate: vi.fn(),
      count: vi.fn(),
    },
    payment: {
      aggregate: vi.fn(),
    },
    student: {
      findMany: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";

describe("CarteraService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.paymentCommitment.findMany).mockResolvedValue([mockCommitment]);
    vi.mocked(prisma.paymentCommitment.count).mockResolvedValue(1);
  });

  describe("getCommitments", () => {
    it("retorna lista paginada de compromisos", async () => {
      const result = await CarteraService.getCommitments({
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

    it("aplica filtro de status", async () => {
      await CarteraService.getCommitments({
        status: "PENDIENTE",
      });

      expect(prisma.paymentCommitment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: "tenant-1",
            status: "PENDIENTE",
          }),
        })
      );
    });
  });
});
