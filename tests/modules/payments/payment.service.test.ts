import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentService } from "@/modules/payments/services/payment.service";

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    payment: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";

describe("PaymentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateReceiptNumber", () => {
    it("genera número REC-YYYYMM-00001 cuando no hay pagos previos", async () => {
      vi.mocked(prisma.payment.findFirst).mockResolvedValue(null);

      const result = await PaymentService.generateReceiptNumber();

      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, "0");
      expect(result).toMatch(new RegExp(`^REC-${year}${month}-\\d{5}$`));
      expect(result).toContain("00001");
    });

    it("incrementa secuencia cuando hay pagos previos", async () => {
      vi.mocked(prisma.payment.findFirst).mockResolvedValue({
        receiptNumber: "REC-202502-00042",
      } as any);

      const result = await PaymentService.generateReceiptNumber();

      expect(result).toContain("00043");
    });
  });

  describe("getPayments", () => {
    it("retorna lista paginada con tenantId", async () => {
      vi.mocked(prisma.payment.findMany).mockResolvedValue([]);
      vi.mocked(prisma.payment.count).mockResolvedValue(0);

      const result = await PaymentService.getPayments({
        tenantId: "tenant-1",
        page: 1,
        limit: 10,
      });

      expect(result.payments).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(prisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: "tenant-1" },
          skip: 0,
          take: 10,
        })
      );
    });

    it("aplica filtros de fecha", async () => {
      vi.mocked(prisma.payment.findMany).mockResolvedValue([]);
      vi.mocked(prisma.payment.count).mockResolvedValue(0);

      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-31");

      await PaymentService.getPayments({
        tenantId: "tenant-1",
        startDate,
        endDate,
      });

      expect(prisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: "tenant-1",
            paymentDate: expect.objectContaining({
              gte: startDate,
              lte: endDate,
            }),
          }),
        })
      );
    });
  });
});
