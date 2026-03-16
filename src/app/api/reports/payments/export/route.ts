import { NextRequest, NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import { ExportService } from "@/modules/reports/services/export.service";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;
  const rawMethod = searchParams.get("method");
  const allowedMethods: PaymentMethod[] = [
    "BANCOLOMBIA",
    "NEQUI",
    "DAVIPLATA",
    "EFECTIVO",
    "OTRO",
  ];

  const method =
    rawMethod && allowedMethods.includes(rawMethod as PaymentMethod)
      ? (rawMethod as PaymentMethod)
      : undefined;

  const filters = {
    tenantId,
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined,
    method,
  };

  const buffer = await ExportService.exportPaymentsToExcel(filters);
  const fileBytes = new Uint8Array(buffer);

  return new NextResponse(fileBytes, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Reporte_Pagos_${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
});
