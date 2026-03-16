import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withPlatformAdmin } from "@/lib/api-auth";
import { FinanceService } from "@/modules/finance";

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

async function resolveAcademyTenantId(): Promise<string> {
  const academyTenant = await prisma.tenant.findUnique({
    where: { slug: "kaledacademy" },
    select: { id: true },
  });

  if (!academyTenant) {
    throw new Error("Tenant kaledacademy no encontrado para reportes financieros.");
  }

  return academyTenant.id;
}

export const GET = withPlatformAdmin(["SUPER_ADMIN"], async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const startDate = parseDate(searchParams.get("startDate"));
  const endDate = parseDate(searchParams.get("endDate"));
  const academyTenantId = await resolveAcademyTenantId();

  const data = await FinanceService.getCohortProfitability(academyTenantId, { startDate, endDate });

  return NextResponse.json({
    success: true,
    data,
  });
});
