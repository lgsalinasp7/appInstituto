import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/tenant-guard", () => ({
  assertTenantContext: vi.fn(),
}));

vi.mock("@/lib/prisma", () => {
  const tx = {
    payment: { create: vi.fn() },
    paymentCommitment: { update: vi.fn() },
  };
  const $transaction = vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx));
  return {
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
      payment: {
        create: vi.fn(),
      },
      student: {
        findFirst: vi.fn(),
      },
      $transaction,
      __tx: tx,
    },
  };
});

import prisma from "@/lib/prisma";
import {
  listPaymentCommitments,
  createPaymentCommitment,
  updatePaymentCommitment,
  cancelPaymentCommitment,
  getPaymentCommitmentById,
  recordPaymentForCommitment,
} from "@/modules/cartera/services/payment-commitment.service";

// Acceso al transaction-mock interno (Tx con payment.create + paymentCommitment.update).
const txMock = (prisma as unknown as {
  __tx: {
    payment: { create: ReturnType<typeof vi.fn> };
    paymentCommitment: { update: ReturnType<typeof vi.fn> };
  };
}).__tx;

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

describe("payment-commitment.service — cancelPaymentCommitment (soft-delete)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hace SOFT-DELETE: cambia status a CANCELADO sin borrar", async () => {
    (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue({
      id: "c1",
      status: "PENDIENTE",
    });
    (prisma.paymentCommitment.update as MockedFn).mockResolvedValue({
      id: "c1",
      status: "CANCELADO",
    });

    const result = await cancelPaymentCommitment("c1", TENANT_A);
    expect(result).toEqual({ id: "c1", status: "CANCELADO" });
    expect(prisma.paymentCommitment.update).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: { status: "CANCELADO" },
      select: { id: true, status: true },
    });
    // critico: NO se llama a delete (no hard-delete)
    expect(prisma.paymentCommitment.delete).not.toHaveBeenCalled();
  });

  it("rechaza cancelar si pertenece a otro tenant", async () => {
    (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue(null);

    await expect(cancelPaymentCommitment("c1", TENANT_B)).rejects.toThrow(
      /no pertenece/
    );
    expect(prisma.paymentCommitment.update).not.toHaveBeenCalled();
    expect(prisma.paymentCommitment.delete).not.toHaveBeenCalled();
  });

  it("rechaza cancelar un compromiso ya PAGADO", async () => {
    (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue({
      id: "c1",
      status: "PAGADO",
    });

    await expect(cancelPaymentCommitment("c1", TENANT_A)).rejects.toThrow(
      /ya pagado/
    );
    expect(prisma.paymentCommitment.update).not.toHaveBeenCalled();
  });
});

describe("payment-commitment.service — recordPaymentForCommitment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("happy path: crea Payment + marca commitment como PAGADO", async () => {
    (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue({
      id: "c1",
      amount: 250000,
      status: "PENDIENTE",
      studentId: "s1",
      moduleNumber: 2,
    });
    txMock.payment.create.mockResolvedValue({ id: "p1" });
    txMock.paymentCommitment.update.mockResolvedValue({
      id: "c1",
      status: "PAGADO",
    });

    const result = await recordPaymentForCommitment(
      {
        commitmentId: "c1",
        amount: 250000,
        method: "EFECTIVO",
        reference: "ref-001",
      },
      TENANT_A,
      "user-1"
    );

    expect(txMock.payment.create).toHaveBeenCalledTimes(1);
    expect(txMock.paymentCommitment.update).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: { status: "PAGADO" },
      include: expect.any(Object),
    });
    expect(result.payment.id).toBe("p1");
  });

  it("rechaza si el monto no es exactamente igual al del compromiso", async () => {
    (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue({
      id: "c1",
      amount: 250000,
      status: "PENDIENTE",
      studentId: "s1",
      moduleNumber: 1,
    });

    await expect(
      recordPaymentForCommitment(
        { commitmentId: "c1", amount: 100000, method: "EFECTIVO" },
        TENANT_A,
        "user-1"
      )
    ).rejects.toThrow(/exactamente igual/);

    expect(txMock.payment.create).not.toHaveBeenCalled();
  });

  it("rechaza commitment de otro tenant (cross-tenant)", async () => {
    (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue(null);

    await expect(
      recordPaymentForCommitment(
        { commitmentId: "c1", amount: 250000, method: "EFECTIVO" },
        TENANT_B,
        "user-1"
      )
    ).rejects.toThrow(/no pertenece/);

    expect(txMock.payment.create).not.toHaveBeenCalled();
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
