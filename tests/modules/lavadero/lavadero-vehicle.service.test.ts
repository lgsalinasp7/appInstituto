import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  prisma: {
    lavaderoVehicle: {
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
  createVehicle,
  findByPlate,
  updateVehicle,
  deleteVehicle,
} from "@/modules/lavadero/services/lavadero-vehicle.service";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";

type MockedFn = ReturnType<typeof vi.fn>;

describe("LavaderoVehicleService.createVehicle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normaliza la placa a mayusculas y asocia al tenant + cliente", async () => {
    (prisma.lavaderoVehicle.create as MockedFn).mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => ({ id: "v1", ...data })
    );

    const result = await createVehicle(
      {
        plate: "abc123",
        type: "CAR",
        color: "rojo",
        brand: "Mazda",
        customerId: "c1",
      },
      TENANT_A
    );

    expect((result as { plate: string }).plate).toBe("ABC123");
    const call = (prisma.lavaderoVehicle.create as MockedFn).mock.calls[0][0];
    expect(call.data.tenantId).toBe(TENANT_A);
    expect(call.data.customerId).toBe("c1");
  });
});

describe("LavaderoVehicleService.findByPlate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("busca por placa en mayusculas y filtra por tenantId", async () => {
    (prisma.lavaderoVehicle.findFirst as MockedFn).mockResolvedValue(null);

    await findByPlate("xyz789", TENANT_A);

    const call = (prisma.lavaderoVehicle.findFirst as MockedFn).mock.calls[0][0];
    expect(call.where).toMatchObject({ plate: "XYZ789", tenantId: TENANT_A });
  });
});

describe("LavaderoVehicleService.updateVehicle / deleteVehicle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updateVehicle rechaza vehiculo de otro tenant", async () => {
    (prisma.lavaderoVehicle.findFirst as MockedFn).mockResolvedValue(null);

    await expect(
      updateVehicle("v1", { plate: "abc999" }, TENANT_B)
    ).rejects.toThrow("Vehículo no encontrado");

    expect(prisma.lavaderoVehicle.update).not.toHaveBeenCalled();
  });

  it("updateVehicle uppercases la placa cuando se actualiza", async () => {
    (prisma.lavaderoVehicle.findFirst as MockedFn).mockResolvedValue({
      id: "v1",
      tenantId: TENANT_A,
    });
    (prisma.lavaderoVehicle.update as MockedFn).mockResolvedValue({
      id: "v1",
      plate: "ABC999",
    });

    await updateVehicle("v1", { plate: "abc999" }, TENANT_A);

    const call = (prisma.lavaderoVehicle.update as MockedFn).mock.calls[0][0];
    expect(call.data.plate).toBe("ABC999");
  });

  it("deleteVehicle no permite borrar de otro tenant", async () => {
    (prisma.lavaderoVehicle.findFirst as MockedFn).mockResolvedValue(null);

    await expect(deleteVehicle("v1", TENANT_B)).rejects.toThrow(
      "Vehículo no encontrado"
    );

    expect(prisma.lavaderoVehicle.delete).not.toHaveBeenCalled();
  });
});
