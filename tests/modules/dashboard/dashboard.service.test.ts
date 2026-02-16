import { describe, it, expect, vi, beforeEach } from "vitest";
import { DashboardService } from "@/modules/dashboard/services/dashboard.service";

vi.mock("@/lib/tenant", () => ({
  getCurrentTenantId: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    payment: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    paymentCommitment: {
      aggregate: vi.fn(),
    },
    student: {
      count: vi.fn(),
    },
    systemConfig: {
      findFirst: vi.fn(),
    },
  },
}));

import { getCurrentTenantId } from "@/lib/tenant";
import prisma from "@/lib/prisma";

describe("DashboardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentTenantId).mockResolvedValue("tenant-1");
  });

  it("retorna stats vacías cuando no hay tenantId", async () => {
    vi.mocked(getCurrentTenantId).mockResolvedValue(null);

    const result = await DashboardService.getDashboardStats();

    expect(result.todayRevenue).toBe(0);
    expect(result.monthlyRevenue).toBe(0);
    expect(result.activeStudents).toBe(0);
    expect(result.overdueAmount).toBe(0);
    expect(result.revenueChart).toHaveLength(4);
    expect(prisma.payment.aggregate).not.toHaveBeenCalled();
  });

  it("retorna stats con datos cuando hay tenantId", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    vi.mocked(prisma.payment.aggregate)
      .mockResolvedValueOnce({ _sum: { amount: 500000 } } as any)
      .mockResolvedValueOnce({ _sum: { amount: 5000000 } } as any);
    vi.mocked(prisma.paymentCommitment.aggregate).mockResolvedValue({
      _sum: { amount: 200000 },
    } as any);
    vi.mocked(prisma.student.count).mockResolvedValue(50);
    vi.mocked(prisma.systemConfig.findFirst).mockResolvedValue({
      value: "10000000",
    } as any);
    vi.mocked(prisma.payment.groupBy).mockResolvedValue([
      { method: "EFECTIVO", _sum: { amount: 3000000 }, _count: { id: 10 } },
      { method: "TRANSFERENCIA", _sum: { amount: 2000000 }, _count: { id: 5 } },
    ] as any);
    vi.mocked(prisma.payment.findMany).mockResolvedValue([]);

    const result = await DashboardService.getDashboardStats();

    expect(result.todayRevenue).toBe(500000);
    expect(result.monthlyRevenue).toBe(5000000);
    expect(result.overdueAmount).toBe(200000);
    expect(result.activeStudents).toBe(50);
    expect(result.monthlyGoal).toBe(10000000);
    expect(result.revenueChart).toBeDefined();
    expect(result.methodStats).toHaveLength(2);
  });
});
