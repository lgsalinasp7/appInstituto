/**
 * ExportService tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExportService } from "@/modules/reports/services/export.service";

const mockPayments = [
  {
    receiptNumber: "REC-001",
    paymentDate: new Date("2025-01-15"),
    student: {
      fullName: "Juan Pérez",
      documentNumber: "123456789",
      program: { name: "Ingeniería" },
    },
    registeredBy: { name: "María López", email: "maria@test.com" },
    amount: 500000,
    method: "BANCOLOMBIA",
    reference: "REF-001",
    paymentType: "MATRICULA",
  },
];

const mockFindMany = vi.hoisted(() => vi.fn());
vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    payment: { findMany: mockFindMany },
  },
}));

describe("ExportService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue(mockPayments);
  });

  it("exportPaymentsToExcel retorna Buffer con datos", async () => {
    const buffer = await ExportService.exportPaymentsToExcel({});

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("aplica filtro de fechas cuando se proporcionan", async () => {
    const start = new Date("2025-01-01");
    const end = new Date("2025-01-31");

    await ExportService.exportPaymentsToExcel({ startDate: start, endDate: end });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          paymentDate: {
            gte: start,
            lte: end,
          },
        },
      })
    );
  });

  it("aplica filtro de método cuando se proporciona", async () => {
    await ExportService.exportPaymentsToExcel({ method: "NEQUI" });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ method: "NEQUI" }),
      })
    );
  });

  it("incluye student, program y registeredBy en la query", async () => {
    await ExportService.exportPaymentsToExcel({});

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          student: { include: { program: true } },
          registeredBy: true,
        },
      })
    );
  });
});
