import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  prisma: {
    lavaderoOrder: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    lavaderoPayment: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
  default: {},
}));

import { prisma } from "@/lib/prisma";
import {
  createPayment,
  getDailySummary,
} from "@/modules/lavadero/services/lavadero-payment.service";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";

type MockedFn = ReturnType<typeof vi.fn>;

describe("LavaderoPaymentService.createPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registra pago parcial sin marcar la orden como DELIVERED", async () => {
    (prisma.lavaderoOrder.findFirst as MockedFn).mockResolvedValue({
      id: "o1",
      tenantId: TENANT_A,
      total: 40000,
      status: "READY",
      payments: [],
    });
    (prisma.lavaderoPayment.create as MockedFn).mockResolvedValue({
      id: "p1",
      amount: 20000,
    });

    await createPayment(
      { orderId: "o1", method: "CASH", amount: 20000 },
      "user-1",
      TENANT_A
    );

    expect(prisma.lavaderoPayment.create).toHaveBeenCalledTimes(1);
    expect(prisma.lavaderoOrder.update).not.toHaveBeenCalled();
  });

  it("marca la orden como DELIVERED cuando el pago completa el total", async () => {
    (prisma.lavaderoOrder.findFirst as MockedFn).mockResolvedValue({
      id: "o1",
      tenantId: TENANT_A,
      total: 40000,
      status: "READY",
      payments: [{ amount: 20000 }],
    });
    (prisma.lavaderoPayment.create as MockedFn).mockResolvedValue({ id: "p2" });
    (prisma.lavaderoOrder.update as MockedFn).mockResolvedValue({});

    await createPayment(
      { orderId: "o1", method: "NEQUI", amount: 20000 },
      "user-1",
      TENANT_A
    );

    expect(prisma.lavaderoOrder.update).toHaveBeenCalledTimes(1);
    const call = (prisma.lavaderoOrder.update as MockedFn).mock.calls[0][0];
    expect(call.data.status).toBe("DELIVERED");
  });

  it("no re-actualiza el estado si la orden ya esta DELIVERED", async () => {
    (prisma.lavaderoOrder.findFirst as MockedFn).mockResolvedValue({
      id: "o1",
      tenantId: TENANT_A,
      total: 40000,
      status: "DELIVERED",
      payments: [{ amount: 20000 }],
    });
    (prisma.lavaderoPayment.create as MockedFn).mockResolvedValue({ id: "p2" });

    await createPayment(
      { orderId: "o1", method: "CASH", amount: 20000 },
      "user-1",
      TENANT_A
    );

    expect(prisma.lavaderoOrder.update).not.toHaveBeenCalled();
  });

  it("rechaza pagos que excedan el saldo pendiente", async () => {
    (prisma.lavaderoOrder.findFirst as MockedFn).mockResolvedValue({
      id: "o1",
      tenantId: TENANT_A,
      total: 40000,
      status: "READY",
      payments: [{ amount: 30000 }],
    });

    await expect(
      createPayment(
        { orderId: "o1", method: "CASH", amount: 20000 },
        "user-1",
        TENANT_A
      )
    ).rejects.toThrow(/excede el saldo/);

    expect(prisma.lavaderoPayment.create).not.toHaveBeenCalled();
  });

  it("rechaza pago si la orden pertenece a otro tenant (aislamiento)", async () => {
    (prisma.lavaderoOrder.findFirst as MockedFn).mockResolvedValue(null);

    await expect(
      createPayment(
        { orderId: "o1", method: "CARD", amount: 5000 },
        "user-1",
        TENANT_B
      )
    ).rejects.toThrow("Orden no encontrada");

    const findCall = (prisma.lavaderoOrder.findFirst as MockedFn).mock
      .calls[0][0];
    expect(findCall.where).toMatchObject({ id: "o1", tenantId: TENANT_B });
    expect(prisma.lavaderoPayment.create).not.toHaveBeenCalled();
  });
});

describe("LavaderoPaymentService.getDailySummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("agrega ingresos por metodo de pago", async () => {
    (prisma.lavaderoPayment.findMany as MockedFn).mockResolvedValue([
      { method: "CASH", amount: 10000 },
      { method: "CASH", amount: 5000 },
      { method: "NEQUI", amount: 20000 },
    ]);

    const summary = await getDailySummary(TENANT_A, new Date("2026-04-27T15:00:00Z"));

    expect(summary.totalRevenue).toBe(35000);
    expect(summary.totalOrders).toBe(3);
    const cash = summary.paymentBreakdown.find((b) => b.method === "CASH");
    const nequi = summary.paymentBreakdown.find((b) => b.method === "NEQUI");
    expect(cash).toEqual({ method: "CASH", total: 15000, count: 2 });
    expect(nequi).toEqual({ method: "NEQUI", total: 20000, count: 1 });
  });

  it("filtra por tenantId y rango del dia", async () => {
    (prisma.lavaderoPayment.findMany as MockedFn).mockResolvedValue([]);

    await getDailySummary(TENANT_A, new Date("2026-04-27T12:00:00Z"));

    const call = (prisma.lavaderoPayment.findMany as MockedFn).mock.calls[0][0];
    expect(call.where.tenantId).toBe(TENANT_A);
    expect(call.where.createdAt.gte).toBeInstanceOf(Date);
    expect(call.where.createdAt.lte).toBeInstanceOf(Date);
  });
});
