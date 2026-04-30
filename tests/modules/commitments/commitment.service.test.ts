import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommitmentService } from "@/modules/commitments/services/commitment.service";

const assertTenantContextMock = vi.fn();

vi.mock("@/lib/tenant-guard", () => ({
  assertTenantContext: (tenantId: string) => assertTenantContextMock(tenantId),
}));

const mockCommitment = {
  id: "c1",
  scheduledDate: new Date(),
  amount: 500000,
  status: "PENDIENTE",
  studentId: "s1",
  student: { id: "s1", fullName: "Juan", phone: "300" },
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    paymentCommitment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";

type MockedFn = ReturnType<typeof vi.fn>;

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";

describe("CommitmentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assertTenantContextMock.mockReset();
    (prisma.paymentCommitment.findMany as MockedFn).mockResolvedValue([
      mockCommitment,
    ]);
    (prisma.paymentCommitment.count as MockedFn).mockResolvedValue(1);
  });

  describe("getCommitments", () => {
    it("retorna lista paginada de compromisos", async () => {
      const result = await CommitmentService.getCommitments({
        tenantId: TENANT_A,
        page: 1,
        limit: 10,
      });

      expect(result.commitments).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(prisma.paymentCommitment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: TENANT_A },
          skip: 0,
          take: 10,
        })
      );
    });

    it("aplica filtro de studentId", async () => {
      await CommitmentService.getCommitments({
        tenantId: TENANT_A,
        studentId: "s1",
      });

      expect(prisma.paymentCommitment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: TENANT_A,
            studentId: "s1",
          }),
        })
      );
    });

    it("aplica filtros de status y fechas combinados", async () => {
      const startDate = new Date("2026-01-01");
      const endDate = new Date("2026-12-31");

      await CommitmentService.getCommitments({
        tenantId: TENANT_A,
        status: "PENDIENTE",
        startDate,
        endDate,
      });

      const call = (prisma.paymentCommitment.findMany as MockedFn).mock
        .calls[0][0];
      expect(call.where).toMatchObject({
        tenantId: TENANT_A,
        status: "PENDIENTE",
        scheduledDate: { gte: startDate, lte: endDate },
      });
    });

    it("siempre invoca assertTenantContext con el tenantId", async () => {
      await CommitmentService.getCommitments({ tenantId: TENANT_A });

      expect(assertTenantContextMock).toHaveBeenCalledWith(TENANT_A);
    });
  });

  describe("createCommitment — tenant guard", () => {
    it("inyecta tenantId al crear el compromiso", async () => {
      (prisma.paymentCommitment.create as MockedFn).mockResolvedValue({
        id: "c-new",
      });

      await CommitmentService.createCommitment(
        {
          studentId: "s1",
          scheduledDate: new Date("2026-06-01"),
          amount: 250000,
          moduleNumber: 2,
          status: "PENDIENTE",
        },
        TENANT_A
      );

      const call = (prisma.paymentCommitment.create as MockedFn).mock
        .calls[0][0];
      expect(call.data.tenantId).toBe(TENANT_A);
      expect(call.data.studentId).toBe("s1");
      expect(call.data.moduleNumber).toBe(2);
      expect(assertTenantContextMock).toHaveBeenCalledWith(TENANT_A);
    });

    it("usa status PENDIENTE por defecto si no se especifica", async () => {
      (prisma.paymentCommitment.create as MockedFn).mockResolvedValue({
        id: "c-new",
      });

      await CommitmentService.createCommitment(
        {
          studentId: "s1",
          scheduledDate: new Date(),
          amount: 100000,
          moduleNumber: 1,
        },
        TENANT_A
      );

      const call = (prisma.paymentCommitment.create as MockedFn).mock
        .calls[0][0];
      expect(call.data.status).toBe("PENDIENTE");
    });

    it("propaga error si assertTenantContext falla (tenantId vacio)", async () => {
      assertTenantContextMock.mockImplementationOnce(() => {
        throw new Error("Tenant context invalido");
      });

      await expect(
        CommitmentService.createCommitment(
          {
            studentId: "s1",
            scheduledDate: new Date(),
            amount: 100000,
            moduleNumber: 1,
          },
          ""
        )
      ).rejects.toThrow(/Tenant context/);

      expect(prisma.paymentCommitment.create).not.toHaveBeenCalled();
    });
  });

  describe("updateCommitment — aislamiento multi-tenant", () => {
    it("verifica pertenencia al tenant antes de actualizar", async () => {
      (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue({
        id: "c1",
      });
      (prisma.paymentCommitment.update as MockedFn).mockResolvedValue({
        id: "c1",
      });

      await CommitmentService.updateCommitment(
        "c1",
        { status: "PAGADO" },
        TENANT_A
      );

      const findCall = (prisma.paymentCommitment.findFirst as MockedFn).mock
        .calls[0][0];
      expect(findCall.where).toMatchObject({ id: "c1", tenantId: TENANT_A });
      expect(prisma.paymentCommitment.update).toHaveBeenCalledTimes(1);
    });

    it("rechaza update cuando el compromiso pertenece a otro tenant", async () => {
      (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue(null);

      await expect(
        CommitmentService.updateCommitment(
          "c1",
          { status: "PAGADO" },
          TENANT_B
        )
      ).rejects.toThrow(/no pertenece/);

      expect(prisma.paymentCommitment.update).not.toHaveBeenCalled();
    });
  });

  describe("markAsPaid", () => {
    it("marca compromiso como pagado verificando tenant", async () => {
      (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue(
        mockCommitment
      );
      (prisma.paymentCommitment.update as MockedFn).mockResolvedValue({
        ...mockCommitment,
        status: "PAGADO",
      });

      const result = await CommitmentService.markAsPaid("c1", TENANT_A);

      expect(result.status).toBe("PAGADO");
      const findCall = (prisma.paymentCommitment.findFirst as MockedFn).mock
        .calls[0][0];
      expect(findCall.where).toMatchObject({ id: "c1", tenantId: TENANT_A });
      expect(prisma.paymentCommitment.update).toHaveBeenCalledWith({
        where: { id: "c1" },
        data: { status: "PAGADO" },
      });
    });

    it("lanza error cuando compromiso no existe (o pertenece a otro tenant)", async () => {
      (prisma.paymentCommitment.findFirst as MockedFn).mockResolvedValue(null);

      await expect(
        CommitmentService.markAsPaid("no-existe", TENANT_B)
      ).rejects.toThrow(/no pertenece/);
      expect(prisma.paymentCommitment.update).not.toHaveBeenCalled();
    });
  });

  describe("getOverdueCommitments — multi-tenant", () => {
    it("retorna compromisos vencidos filtrados por tenantId", async () => {
      (prisma.paymentCommitment.findMany as MockedFn).mockResolvedValue([
        mockCommitment,
      ]);

      const result = await CommitmentService.getOverdueCommitments(TENANT_A);

      expect(result).toHaveLength(1);
      const call = (prisma.paymentCommitment.findMany as MockedFn).mock
        .calls[0][0];
      expect(call.where).toMatchObject({
        tenantId: TENANT_A,
        status: "PENDIENTE",
      });
      expect(call.where.scheduledDate).toBeDefined();
      expect(assertTenantContextMock).toHaveBeenCalledWith(TENANT_A);
    });
  });
});
