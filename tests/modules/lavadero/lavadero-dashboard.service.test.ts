import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  prisma: {
    lavaderoPayment: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    lavaderoOrder: {
      count: vi.fn(),
    },
    lavaderoOrderService: {
      groupBy: vi.fn(),
    },
    lavaderoService: {
      findMany: vi.fn(),
    },
  },
  default: {},
}));

import { prisma } from "@/lib/prisma";
import { getDashboardMetrics } from "@/modules/lavadero/services/lavadero-dashboard.service";

const TENANT_A = "tenant-a";

type MockedFn = ReturnType<typeof vi.fn>;

describe("LavaderoDashboardService.getDashboardMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("suma correctamente ingresos hoy/semana/mes y mapea popularidad de servicios", async () => {
    (prisma.lavaderoPayment.findMany as MockedFn)
      .mockResolvedValueOnce([{ amount: 10000 }, { amount: 5000 }]) // today
      .mockResolvedValueOnce([{ amount: 50000 }]) // week
      .mockResolvedValueOnce([{ amount: 200000 }]); // month

    (prisma.lavaderoOrder.count as MockedFn)
      .mockResolvedValueOnce(3) // pendingOrders
      .mockResolvedValueOnce(5); // todayOrders

    (prisma.lavaderoOrderService.groupBy as MockedFn).mockResolvedValue([
      { serviceId: "s1", _count: { serviceId: 8 } },
      { serviceId: "s2", _count: { serviceId: 3 } },
    ]);

    (prisma.lavaderoPayment.groupBy as MockedFn).mockResolvedValue([
      { method: "CASH", _sum: { amount: 150000 } },
      { method: "NEQUI", _sum: { amount: 50000 } },
    ]);

    (prisma.lavaderoService.findMany as MockedFn).mockResolvedValue([
      { id: "s1", name: "Lavado completo" },
      { id: "s2", name: "Lavado express" },
    ]);

    const result = await getDashboardMetrics(TENANT_A);

    expect(result.todayRevenue).toBe(15000);
    expect(result.weekRevenue).toBe(50000);
    expect(result.monthRevenue).toBe(200000);
    expect(result.pendingOrders).toBe(3);
    expect(result.todayOrders).toBe(5);
    expect(result.servicePopularity).toEqual([
      { name: "Lavado completo", count: 8 },
      { name: "Lavado express", count: 3 },
    ]);
    expect(result.paymentBreakdown).toEqual([
      { method: "CASH", total: 150000 },
      { method: "NEQUI", total: 50000 },
    ]);
  });

  it("filtra todas las queries por tenantId (aislamiento multi-tenant)", async () => {
    (prisma.lavaderoPayment.findMany as MockedFn).mockResolvedValue([]);
    (prisma.lavaderoOrder.count as MockedFn).mockResolvedValue(0);
    (prisma.lavaderoOrderService.groupBy as MockedFn).mockResolvedValue([]);
    (prisma.lavaderoPayment.groupBy as MockedFn).mockResolvedValue([]);
    (prisma.lavaderoService.findMany as MockedFn).mockResolvedValue([]);

    await getDashboardMetrics(TENANT_A);

    const paymentCalls = (prisma.lavaderoPayment.findMany as MockedFn).mock.calls;
    expect(paymentCalls).toHaveLength(3);
    paymentCalls.forEach((c) => {
      expect(c[0].where.tenantId).toBe(TENANT_A);
    });

    const orderCountCalls = (prisma.lavaderoOrder.count as MockedFn).mock.calls;
    orderCountCalls.forEach((c) => {
      expect(c[0].where.tenantId).toBe(TENANT_A);
    });

    const orderServiceCall = (prisma.lavaderoOrderService.groupBy as MockedFn)
      .mock.calls[0][0];
    expect(orderServiceCall.where.order.tenantId).toBe(TENANT_A);
  });

  it("usa 'Desconocido' cuando un servicio no se encuentra en el catalogo", async () => {
    (prisma.lavaderoPayment.findMany as MockedFn).mockResolvedValue([]);
    (prisma.lavaderoOrder.count as MockedFn).mockResolvedValue(0);
    (prisma.lavaderoOrderService.groupBy as MockedFn).mockResolvedValue([
      { serviceId: "missing-service", _count: { serviceId: 2 } },
    ]);
    (prisma.lavaderoPayment.groupBy as MockedFn).mockResolvedValue([]);
    (prisma.lavaderoService.findMany as MockedFn).mockResolvedValue([]);

    const result = await getDashboardMetrics(TENANT_A);

    expect(result.servicePopularity).toEqual([
      { name: "Desconocido", count: 2 },
    ]);
  });
});
