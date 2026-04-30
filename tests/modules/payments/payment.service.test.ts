import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentService } from "@/modules/payments/services/payment.service";

vi.mock("@/lib/tenant-guard", () => ({
  assertTenantContext: vi.fn(),
}));

vi.mock("@/lib/prisma", () => {
  const tx = {
    student: { update: vi.fn(), findFirst: vi.fn() },
    paymentCommitment: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    payment: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  };
  const $transaction = vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx));
  return {
    __esModule: true,
    default: {
      payment: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        aggregate: vi.fn(),
        groupBy: vi.fn(),
      },
      paymentCommitment: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        aggregate: vi.fn(),
      },
      student: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      $transaction,
      __tx: tx,
    },
  };
});

import prisma from "@/lib/prisma";

const txMock = (prisma as unknown as {
  __tx: {
    student: {
      update: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
    paymentCommitment: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    payment: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
}).__tx;

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";

type MockedFn = ReturnType<typeof vi.fn>;

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
      } as never);

      const result = await PaymentService.generateReceiptNumber();

      expect(result).toContain("00043");
    });
  });

  describe("getPayments", () => {
    it("retorna lista paginada con tenantId", async () => {
      vi.mocked(prisma.payment.findMany).mockResolvedValue([]);
      vi.mocked(prisma.payment.count).mockResolvedValue(0);

      const result = await PaymentService.getPayments({
        tenantId: TENANT_A,
        page: 1,
        limit: 10,
      });

      expect(result.payments).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(prisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: TENANT_A },
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
        tenantId: TENANT_A,
        startDate,
        endDate,
      });

      expect(prisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: TENANT_A,
            paymentDate: expect.objectContaining({
              gte: startDate,
              lte: endDate,
            }),
          }),
        })
      );
    });

    it("aplica filtro studentId + advisorId + method", async () => {
      vi.mocked(prisma.payment.findMany).mockResolvedValue([]);
      vi.mocked(prisma.payment.count).mockResolvedValue(0);

      await PaymentService.getPayments({
        tenantId: TENANT_A,
        studentId: "s1",
        advisorId: "advisor-1",
        method: "EFECTIVO",
      });

      const findCall = (prisma.payment.findMany as MockedFn).mock.calls[0][0];
      expect(findCall.where).toMatchObject({
        tenantId: TENANT_A,
        studentId: "s1",
        registeredById: "advisor-1",
        method: "EFECTIVO",
      });
    });
  });

  describe("getPaymentById — aislamiento multi-tenant", () => {
    it("filtra por id + tenantId al buscar", async () => {
      (prisma.payment.findFirst as MockedFn).mockResolvedValue(null);

      await PaymentService.getPaymentById("p1", TENANT_A);

      const call = (prisma.payment.findFirst as MockedFn).mock.calls[0][0];
      expect(call.where).toMatchObject({ id: "p1", tenantId: TENANT_A });
    });

    it("retorna null si el payment pertenece a otro tenant", async () => {
      (prisma.payment.findFirst as MockedFn).mockResolvedValue(null);

      const result = await PaymentService.getPaymentById("p1", TENANT_B);
      expect(result).toBeNull();
    });
  });

  describe("createPayment (legacy) — happy path", () => {
    it("crea Payment + crea primer compromiso si MATRICULA queda pagada", async () => {
      // Estudiante sin matrícula pagada
      (prisma.student.findFirst as MockedFn).mockResolvedValue({
        id: "s1",
        tenantId: TENANT_A,
        matriculaPaid: false,
        currentModule: 0,
        firstCommitmentDate: null,
        city: "Bogota",
        program: {
          id: "prog-1",
          totalValue: 3000000,
          matriculaValue: 500000,
          modulesCount: 5,
        },
      });
      vi.mocked(prisma.payment.findFirst).mockResolvedValue(null);
      txMock.payment.create.mockResolvedValue({
        id: "p1",
        amount: 500000,
      });
      txMock.paymentCommitment.create.mockResolvedValue({ id: "c1" });
      txMock.student.update.mockResolvedValue({ id: "s1" });

      const result = await PaymentService.createPayment({
        tenantId: TENANT_A,
        studentId: "s1",
        amount: 500000,
        paymentDate: new Date(),
        method: "EFECTIVO",
        registeredById: "user-1",
      });

      expect(result.id).toBe("p1");
      // Marca matrícula pagada
      expect(txMock.student.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "s1" },
          data: { matriculaPaid: true },
        })
      );
      // Crea primer compromiso
      expect(txMock.paymentCommitment.create).toHaveBeenCalledTimes(1);
      const commitArg = txMock.paymentCommitment.create.mock.calls[0][0];
      expect(commitArg.data.tenantId).toBe(TENANT_A);
      expect(commitArg.data.moduleNumber).toBe(1);
      // Crea Payment con tenantId correcto
      const payArg = txMock.payment.create.mock.calls[0][0];
      expect(payArg.data.tenantId).toBe(TENANT_A);
      expect(payArg.data.paymentType).toBe("MATRICULA");
    });

    it("crea pago tipo MODULO cuando matrícula ya está pagada", async () => {
      (prisma.student.findFirst as MockedFn).mockResolvedValue({
        id: "s1",
        tenantId: TENANT_A,
        matriculaPaid: true,
        currentModule: 1,
        paymentFrequency: "MENSUAL",
        firstCommitmentDate: new Date(),
        city: "Bogota",
        program: {
          totalValue: 3000000,
          matriculaValue: 500000,
          modulesCount: 5,
        },
      });
      vi.mocked(prisma.payment.findFirst).mockResolvedValue(null);
      txMock.paymentCommitment.findFirst.mockResolvedValue({
        id: "c1",
        amount: 500000,
        moduleNumber: 1,
        scheduledDate: new Date(),
      });
      txMock.paymentCommitment.update.mockResolvedValue({ id: "c1" });
      txMock.student.update.mockResolvedValue({ id: "s1" });
      txMock.payment.create.mockResolvedValue({
        id: "p2",
        paymentType: "MODULO",
      });

      const result = await PaymentService.createPayment({
        tenantId: TENANT_A,
        studentId: "s1",
        amount: 500000,
        paymentDate: new Date(),
        method: "BANCOLOMBIA",
        registeredById: "user-1",
      });

      expect(result.id).toBe("p2");
      const payArg = txMock.payment.create.mock.calls[0][0];
      expect(payArg.data.paymentType).toBe("MODULO");
      expect(payArg.data.moduleNumber).toBe(1);
    });

    it("aislamiento: rechaza si el estudiante no pertenece al tenant", async () => {
      (prisma.student.findFirst as MockedFn).mockResolvedValue(null);

      await expect(
        PaymentService.createPayment({
          tenantId: TENANT_B,
          studentId: "s1",
          amount: 500000,
          paymentDate: new Date(),
          method: "EFECTIVO",
          registeredById: "user-1",
        })
      ).rejects.toThrow(/Estudiante no encontrado/);

      // El findFirst debe filtrar por tenantId
      const studentCall = (prisma.student.findFirst as MockedFn).mock.calls[0][0];
      expect(studentCall.where).toMatchObject({
        id: "s1",
        tenantId: TENANT_B,
      });
      expect(txMock.payment.create).not.toHaveBeenCalled();
    });
  });

  describe("getPaymentStats — tenant guard + filtros", () => {
    it("siempre filtra por tenantId en aggregate", async () => {
      (prisma.payment.aggregate as MockedFn).mockResolvedValue({
        _sum: { amount: 1000000 },
        _count: 5,
        _avg: { amount: 200000 },
      });
      (prisma.payment.groupBy as MockedFn).mockResolvedValue([
        { method: "EFECTIVO", _sum: { amount: 1000000 } },
      ]);

      const result = await PaymentService.getPaymentStats({
        tenantId: TENANT_A,
      });

      expect(result.totalCollected).toBe(1000000);
      expect(result.paymentsCount).toBe(5);
      expect(result.byMethod.EFECTIVO).toBe(1000000);

      const aggCall = (prisma.payment.aggregate as MockedFn).mock.calls[0][0];
      expect(aggCall.where).toMatchObject({ tenantId: TENANT_A });
    });

    it("aplica filtro advisorId + rangos de fechas", async () => {
      (prisma.payment.aggregate as MockedFn).mockResolvedValue({
        _sum: { amount: 0 },
        _count: 0,
        _avg: { amount: 0 },
      });
      (prisma.payment.groupBy as MockedFn).mockResolvedValue([]);

      const startDate = new Date("2026-01-01");
      const endDate = new Date("2026-12-31");

      await PaymentService.getPaymentStats({
        tenantId: TENANT_A,
        advisorId: "advisor-1",
        startDate,
        endDate,
      });

      const aggCall = (prisma.payment.aggregate as MockedFn).mock.calls[0][0];
      expect(aggCall.where).toMatchObject({
        tenantId: TENANT_A,
        registeredById: "advisor-1",
        paymentDate: { gte: startDate, lte: endDate },
      });
    });
  });

  describe("updatePayment — aislamiento multi-tenant", () => {
    it("rechaza update si el pago pertenece a otro tenant", async () => {
      txMock.payment.findFirst.mockResolvedValue(null);

      await expect(
        PaymentService.updatePayment(
          "p1",
          { amount: 100, paymentDate: new Date(), method: "EFECTIVO" },
          TENANT_B
        )
      ).rejects.toThrow(/Pago no encontrado/);

      // El findFirst dentro de la transacción filtra por tenantId
      const call = txMock.payment.findFirst.mock.calls[0][0];
      expect(call.where).toMatchObject({ id: "p1", tenantId: TENANT_B });
      expect(txMock.payment.update).not.toHaveBeenCalled();
    });

    it("actualiza pago si pertenece al tenant", async () => {
      txMock.payment.findFirst.mockResolvedValue({ studentId: "s1" });
      txMock.payment.update.mockResolvedValue({ id: "p1" });

      await PaymentService.updatePayment(
        "p1",
        { amount: 200, paymentDate: new Date(), method: "EFECTIVO" },
        TENANT_A
      );

      expect(txMock.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "p1" } })
      );
    });
  });
});
