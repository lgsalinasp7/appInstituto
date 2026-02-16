import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReportsService } from "@/modules/reports/services/reports.service";

vi.mock("@/lib/tenant", () => ({
  getCurrentTenantId: vi.fn().mockResolvedValue("tenant-1"),
}));

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    payment: {
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    paymentCommitment: {
      aggregate: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";

describe("ReportsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.payment.aggregate).mockResolvedValue({
      _sum: { amount: 5000000 },
      _count: 20,
      _avg: { amount: 250000 },
    } as any);
    vi.mocked(prisma.payment.groupBy).mockResolvedValue([
      { method: "EFECTIVO", _sum: { amount: 3000000 }, _count: 10 },
      { method: "TRANSFERENCIA", _sum: { amount: 2000000 }, _count: 10 },
    ] as any);
    vi.mocked(prisma.paymentCommitment.aggregate).mockResolvedValue({
      _sum: { amount: 1000000 },
    } as any);
  });

  describe("getFinancialReport", () => {
    it("retorna reporte financiero con datos", async () => {
      vi.mocked(prisma.payment.groupBy)
        .mockResolvedValueOnce([
          { method: "EFECTIVO", _sum: { amount: 3000000 }, _count: 10 },
        ] as any)
        .mockResolvedValueOnce([
          {
            paymentDate: new Date("2025-01-15"),
            _sum: { amount: 500000 },
            _count: 2,
          },
        ] as any);

      const result = await ReportsService.getFinancialReport({});

      expect(result.totalRevenue).toBe(5000000);
      expect(result.totalPayments).toBe(20);
      expect(result.averagePayment).toBe(250000);
      expect(result.pendingAmount).toBe(1000000);
      expect(result.byMethod).toHaveLength(1);
    });

    it("aplica filtros de fecha", async () => {
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-31");

      vi.mocked(prisma.payment.groupBy)
        .mockResolvedValueOnce([] as any)
        .mockResolvedValueOnce([] as any);

      const result = await ReportsService.getFinancialReport({
        startDate,
        endDate,
      });

      expect(result.period).toContain("2025");
      expect(result.period).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });
});
