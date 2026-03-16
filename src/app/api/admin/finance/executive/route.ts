import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withPlatformAdmin } from "@/lib/api-auth";
import { resolveKaledTenantId } from "@/lib/kaled-tenant";
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

  const [kaledTenantId, academyTenantId] = await Promise.all([
    resolveKaledTenantId(),
    resolveAcademyTenantId(),
  ]);

  const [saas, cohorts] = await Promise.all([
    FinanceService.getSaasRevenue(kaledTenantId, { startDate, endDate }),
    FinanceService.getCohortProfitability(academyTenantId, { startDate, endDate }),
  ]);

  const academyAdsCost = cohorts.cohorts.reduce((acc, row) => acc + row.adsCost, 0);
  const academyRevenue = cohorts.totals.revenue;
  const academyCost = cohorts.totals.cost;
  const totalRevenue = saas.cashIn + academyRevenue;
  const totalCost = academyCost;
  const grossMargin = totalRevenue - totalCost;
  const grossMarginPct = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

  return NextResponse.json({
    success: true,
    data: {
      totalRevenue,
      totalCost,
      grossMargin,
      grossMarginPct,
      softwareRevenueCashIn: saas.cashIn,
      softwareRevenueProrated: saas.prorated,
      academyRevenue,
      academyCost,
      academyAdsCost,
      activeCohorts: cohorts.cohorts.filter((cohort) => cohort.status === "ACTIVE").length,
    },
  });
});
