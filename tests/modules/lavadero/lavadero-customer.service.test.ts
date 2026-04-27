import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  prisma: {
    lavaderoCustomer: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  default: {},
}));

import { prisma } from "@/lib/prisma";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer,
} from "@/modules/lavadero/services/lavadero-customer.service";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";

type MockedFn = ReturnType<typeof vi.fn>;

describe("LavaderoCustomerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createCustomer fuerza tenantId del parametro (no del input)", async () => {
    (prisma.lavaderoCustomer.create as MockedFn).mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => ({ id: "c1", ...data })
    );

    const result = await createCustomer(
      { name: "Juan", phone: "3001234567" },
      TENANT_A
    );

    const call = (prisma.lavaderoCustomer.create as MockedFn).mock.calls[0][0];
    expect(call.data.tenantId).toBe(TENANT_A);
    expect((result as { name: string }).name).toBe("Juan");
  });

  it("listCustomers aplica filtro de busqueda en nombre y telefono", async () => {
    (prisma.lavaderoCustomer.findMany as MockedFn).mockResolvedValue([]);
    (prisma.lavaderoCustomer.count as MockedFn).mockResolvedValue(0);

    await listCustomers(TENANT_A, "juan");

    const call = (prisma.lavaderoCustomer.findMany as MockedFn).mock.calls[0][0];
    expect(call.where.tenantId).toBe(TENANT_A);
    expect(Array.isArray(call.where.OR)).toBe(true);
    expect(call.where.OR[0].name.contains).toBe("juan");
  });

  it("listCustomers no agrega OR cuando no hay search", async () => {
    (prisma.lavaderoCustomer.findMany as MockedFn).mockResolvedValue([]);
    (prisma.lavaderoCustomer.count as MockedFn).mockResolvedValue(0);

    await listCustomers(TENANT_A);

    const call = (prisma.lavaderoCustomer.findMany as MockedFn).mock.calls[0][0];
    expect(call.where.OR).toBeUndefined();
  });

  it("getCustomerById filtra por tenantId (no leak)", async () => {
    (prisma.lavaderoCustomer.findFirst as MockedFn).mockResolvedValue(null);

    await getCustomerById("c1", TENANT_B);

    const call = (prisma.lavaderoCustomer.findFirst as MockedFn).mock.calls[0][0];
    expect(call.where).toEqual({ id: "c1", tenantId: TENANT_B });
  });

  it("updateCustomer rechaza si el cliente pertenece a otro tenant (no aplica update)", async () => {
    (prisma.lavaderoCustomer.findFirst as MockedFn).mockResolvedValue(null);

    await expect(
      updateCustomer("c1", { name: "Nuevo" }, TENANT_B)
    ).rejects.toThrow("Cliente no encontrado");

    expect(prisma.lavaderoCustomer.update).not.toHaveBeenCalled();
  });

  it("updateCustomer aplica update cuando el cliente pertenece al tenant", async () => {
    (prisma.lavaderoCustomer.findFirst as MockedFn).mockResolvedValue({
      id: "c1",
      tenantId: TENANT_A,
      name: "Viejo",
    });
    (prisma.lavaderoCustomer.update as MockedFn).mockResolvedValue({
      id: "c1",
      tenantId: TENANT_A,
      name: "Nuevo",
    });

    const result = await updateCustomer("c1", { name: "Nuevo" }, TENANT_A);

    const findCall = (prisma.lavaderoCustomer.findFirst as MockedFn).mock.calls[0][0];
    expect(findCall.where).toEqual({ id: "c1", tenantId: TENANT_A });
    expect(prisma.lavaderoCustomer.update).toHaveBeenCalled();
    expect((result as { name: string }).name).toBe("Nuevo");
  });

  it("deleteCustomer rechaza si el cliente pertenece a otro tenant", async () => {
    (prisma.lavaderoCustomer.findFirst as MockedFn).mockResolvedValue(null);

    await expect(deleteCustomer("c1", TENANT_B)).rejects.toThrow(
      "Cliente no encontrado"
    );

    expect(prisma.lavaderoCustomer.delete).not.toHaveBeenCalled();
  });
});
