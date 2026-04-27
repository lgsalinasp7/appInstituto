import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  prisma: {
    lavaderoOrder: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    lavaderoService: {
      findMany: vi.fn(),
    },
  },
  default: {},
}));

import { prisma } from "@/lib/prisma";
import {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from "@/modules/lavadero/services/lavadero-order.service";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";

type MockedFn = ReturnType<typeof vi.fn>;

describe("LavaderoOrderService.createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calcula el total sumando precios de los servicios snapshotados", async () => {
    (prisma.lavaderoService.findMany as MockedFn).mockResolvedValue([
      { id: "s1", price: 15000, tenantId: TENANT_A, active: true },
      { id: "s2", price: 25000, tenantId: TENANT_A, active: true },
    ]);
    (prisma.lavaderoOrder.create as MockedFn).mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => ({ id: "o1", ...data })
    );

    const result = await createOrder(
      {
        vehicleId: "v1",
        customerId: "c1",
        serviceIds: ["s1", "s2"],
        notes: "rapida",
      },
      "user-1",
      TENANT_A
    );

    expect((result as { total: number }).total).toBe(40000);
    expect(prisma.lavaderoOrder.create).toHaveBeenCalledTimes(1);
    const callArg = (prisma.lavaderoOrder.create as MockedFn).mock.calls[0][0];
    expect(callArg.data.tenantId).toBe(TENANT_A);
    expect(callArg.data.createdBy).toBe("user-1");
  });

  it("filtra servicios por tenantId (aislamiento multi-tenant)", async () => {
    (prisma.lavaderoService.findMany as MockedFn).mockResolvedValue([
      { id: "s1", price: 15000, tenantId: TENANT_A, active: true },
    ]);
    (prisma.lavaderoOrder.create as MockedFn).mockResolvedValue({ id: "o1" });

    await createOrder(
      { vehicleId: "v1", customerId: "c1", serviceIds: ["s1"] },
      "user-1",
      TENANT_A
    );

    const findManyCall = (prisma.lavaderoService.findMany as MockedFn).mock
      .calls[0][0];
    expect(findManyCall.where.tenantId).toBe(TENANT_A);
    expect(findManyCall.where.active).toBe(true);
  });

  it("lanza error si algun servicio no existe o no esta activo", async () => {
    (prisma.lavaderoService.findMany as MockedFn).mockResolvedValue([
      { id: "s1", price: 15000, tenantId: TENANT_A, active: true },
    ]);

    await expect(
      createOrder(
        { vehicleId: "v1", customerId: "c1", serviceIds: ["s1", "s2"] },
        "user-1",
        TENANT_A
      )
    ).rejects.toThrow(/no estan disponibles|no están disponibles/);

    expect(prisma.lavaderoOrder.create).not.toHaveBeenCalled();
  });
});

describe("LavaderoOrderService.updateOrderStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("actualiza el estado kanban cuando la orden existe en el tenant", async () => {
    (prisma.lavaderoOrder.findFirst as MockedFn).mockResolvedValue({
      id: "o1",
      tenantId: TENANT_A,
      status: "RECEIVED",
    });
    (prisma.lavaderoOrder.update as MockedFn).mockResolvedValue({
      id: "o1",
      status: "WASHING",
    });

    const result = await updateOrderStatus("o1", "WASHING", TENANT_A);

    expect((result as { status: string }).status).toBe("WASHING");
    const findCall = (prisma.lavaderoOrder.findFirst as MockedFn).mock
      .calls[0][0];
    expect(findCall.where).toEqual({ id: "o1", tenantId: TENANT_A });
  });

  it("rechaza la actualizacion si la orden pertenece a otro tenant", async () => {
    (prisma.lavaderoOrder.findFirst as MockedFn).mockResolvedValue(null);

    await expect(
      updateOrderStatus("o1", "DELIVERED", TENANT_B)
    ).rejects.toThrow("Orden no encontrada");

    expect(prisma.lavaderoOrder.update).not.toHaveBeenCalled();
  });
});

describe("LavaderoOrderService.listOrders / getOrderById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listOrders aplica tenantId y paginacion por defecto", async () => {
    (prisma.lavaderoOrder.findMany as MockedFn).mockResolvedValue([]);
    (prisma.lavaderoOrder.count as MockedFn).mockResolvedValue(0);

    const result = await listOrders(TENANT_A);

    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(0);
    const findCall = (prisma.lavaderoOrder.findMany as MockedFn).mock
      .calls[0][0];
    expect(findCall.where.tenantId).toBe(TENANT_A);
    expect(findCall.skip).toBe(0);
    expect(findCall.take).toBe(50);
  });

  it("listOrders aplica filtros por estado y customerId", async () => {
    (prisma.lavaderoOrder.findMany as MockedFn).mockResolvedValue([]);
    (prisma.lavaderoOrder.count as MockedFn).mockResolvedValue(0);

    await listOrders(TENANT_A, {
      status: "WASHING",
      customerId: "c1",
      page: 2,
      limit: 10,
    });

    const findCall = (prisma.lavaderoOrder.findMany as MockedFn).mock
      .calls[0][0];
    expect(findCall.where.status).toBe("WASHING");
    expect(findCall.where.customerId).toBe("c1");
    expect(findCall.skip).toBe(10);
    expect(findCall.take).toBe(10);
  });

  it("getOrderById filtra por id + tenantId (no leak entre tenants)", async () => {
    (prisma.lavaderoOrder.findFirst as MockedFn).mockResolvedValue(null);

    const result = await getOrderById("o1", TENANT_B);

    expect(result).toBeNull();
    const call = (prisma.lavaderoOrder.findFirst as MockedFn).mock.calls[0][0];
    expect(call.where).toEqual({ id: "o1", tenantId: TENANT_B });
  });
});
