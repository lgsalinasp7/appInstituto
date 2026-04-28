import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/tenant-guard", () => ({
  assertTenantContext: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    paymentCommitment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    student: {
      findFirst: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import {
  listPaymentCommitments,
  createPaymentCommitment,
  updatePaymentCommitment,
  cancelPaymentCommitment,
  getPaymentCommitmentById,
} from "@/modules/cartera/services/payment-commitment.service";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";

type MockedFn = ReturnType<typeof vi.fn>;

describe("payment-commitment.service — listPaymentCommitments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filtra por tenantId y aplica paginación", async () => {
    (prisma.paymentCommitment.findMany as MockedFn).mockResolvedValue([
      { id: "c1" },
    ]);
    (prisma.paymentCommitment.count as MockedFn).mockResolvedValue(1);

    const result = await listPaymentCommitments({
      tenantId: TENANT_A,
      page: 2,
      limit: 5,
    });

    const findCall = (prisma.paymentCommitment.findMany as MockedFn).mock
      .calls[0][0];
    expect(findCall.where).toMatchObject({ tenantId: TENANT_A });
    expect(findCall.skip).toBe(5);
    expect(findCall.take).toBe(5);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("aplica filtro de status y studentId", async () => {
    (prisma.paymentCommitment.findMany as MockedFn).mockResolvedValue([]);
    (prisma.paymentCommitment.count as MockedFn).mockResolvedValue(0);

    await listPaymentCommitments({
      tenantId: TENANT_A,
      status: "PENDIENTE",
      studentId: "s1",
    });

    const findCall = (prisma.paymentCommitment.findMany as MockedFn).mock
      .calls[0][0];
    expect(findCall.where).toMatchObject({
      tenantId: TENANT_A,
      status: "PENDIENTE",
      studentId: "s1",
    });
  });
});

describe("payment-commitment.service — createPaymentCommitment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea compromiso si el estudiante pertenece al tenant", async () => {
    (prisma.student.findFirst as MockedFn).mockResolvedValue({ id: "s1" });
    (prisma.paymentCommitment.create as MockedFn).mockResolvedValue({
      id: "c1",
    });

    await createPaymentCommitment(
      {
        studentId: "s1",
        scheduledDate: new Date("2026-05-01"),
        amount: 250000,
        comments: "Confirmado",
      },
      TENANT_A
    );

    const studentCall = (prisma.student.findFirst as MockedFn).mock.calls[0][0];
    expect(studentCall.where).toMatchObject({ id: "s1", tenantId: TENANT_A });
    expect(prisma.paymentCommitment.create).toHaveBeenCalledTimes(1);
  });

  it("rechaza si el estudiante pertenece a otro tenant (aislamiento)", async () => {
    (prisma.student.findFirst as MockedFn).mockResolvedValue(null);

    await expect(
      createPaymentCommitment(
        {
          studentId: "s1",
          scheduledDate: new Date("2026-05-01"),
          amount: 250000,
        },
        TENANT_B
      )
    ).rejects.toThrow(/Estudiante no encontrado/);

    expect(prisma.paymentCommitment.create).not.toHaveBeenCalled();
  });

  it("normaliza comments vacío a null", async () => {
    (prisma.student.findFirst as MockedFn).mockResolvedValue({ id: "s1" });
    (prisma.paymentCommitment.create as MockedFn).mockResolvedValue({
      id: "c1",
    });

    await createPaymentCommitment(
      {
        studentId: "s1",
        scheduledDate: new Date(),
        amount: 100,
        comments: "",
      },
      TENANT_A
    );

    const createCall = (prisma.paymentCommitment.create as MockedFn).mock
      .calls[0][0];
    expect(createCall.data.comments).toBeNull();
  });
});

describe("payment-commitment.service — updatePaymentCommitment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifica pertenencia antes de actualizar (findFirst-then-update)", async () => {
    (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue({
      id: "c1",
    });
    (prisma.paymentCommitment.update as MockedFn).mockResolvedValue({
      id: "c1",
    });

    await updatePaymentCommitment("c1", { status: "PAGADO" }, TENANT_A);

    const findCall = (prisma.paymentCommitment.findFirst as MockedFn).mock
      .calls[0][0];
    expect(findCall.where).toMatchObject({ id: "c1", tenantId: TENANT_A });
    expect(prisma.paymentCommitment.update).toHaveBeenCalledTimes(1);
  });

  it("rechaza update si el compromiso pertenece a otro tenant", async () => {
    (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue(null);

    await expect(
      updatePaymentCommitment("c1", { status: "PAGADO" }, TENANT_B)
    ).rejects.toThrow(/no pertenece/);

    expect(prisma.paymentCommitment.update).not.toHaveBeenCalled();
  });
});

describe("payment-commitment.service — cancelPaymentCommitment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("elimina si pertenece al tenant", async () => {
    (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue({
      id: "c1",
    });
    (prisma.paymentCommitment.delete as MockedFn).mockResolvedValue({});

    const result = await cancelPaymentCommitment("c1", TENANT_A);
    expect(result).toEqual({ id: "c1" });
    expect(prisma.paymentCommitment.delete).toHaveBeenCalledWith({
      where: { id: "c1" },
    });
  });

  it("rechaza cancelar si pertenece a otro tenant", async () => {
    (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue(null);

    await expect(cancelPaymentCommitment("c1", TENANT_B)).rejects.toThrow(
      /no pertenece/
    );
    expect(prisma.paymentCommitment.delete).not.toHaveBeenCalled();
  });
});

describe("payment-commitment.service — getPaymentCommitmentById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filtra por tenantId al buscar por id", async () => {
    (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue({
      id: "c1",
    });

    await getPaymentCommitmentById("c1", TENANT_A);

    const call = (prisma.paymentCommitment.findFirst as MockedFn).mock
      .calls[0][0];
    expect(call.where).toMatchObject({ id: "c1", tenantId: TENANT_A });
  });
});
