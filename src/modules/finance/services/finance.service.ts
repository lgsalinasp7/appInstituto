import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { assertTenantContext } from "@/lib/tenant-guard";
import type {
  CohortProfitabilityReport,
  CohortProfitabilityRow,
  FinanceDateRange,
  FinanceExecutiveKpis,
  SaasRevenueReport,
  SaasSaleRow,
} from "../types";

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  return Number(value ?? 0);
}

function getRangeLabel({ startDate, endDate }: FinanceDateRange): string {
  if (!startDate && !endDate) {
    return "Todo el tiempo";
  }
  const start = startDate ? startDate.toLocaleDateString("es-CO") : "Inicio";
  const end = endDate ? endDate.toLocaleDateString("es-CO") : "Hoy";
  return `${start} - ${end}`;
}

function buildSaleDateWhere(range: FinanceDateRange): Prisma.SoftwareSaleWhereInput {
  if (!range.startDate && !range.endDate) {
    return {};
  }

  return {
    saleDate: {
      ...(range.startDate ? { gte: range.startDate } : {}),
      ...(range.endDate ? { lte: range.endDate } : {}),
    },
  };
}

function buildScheduleWhere(range: FinanceDateRange): Prisma.SoftwareRevenueScheduleWhereInput {
  if (!range.startDate && !range.endDate) {
    return {};
  }

  if (range.startDate && range.endDate) {
    return {
      OR: [
        {
          periodStart: {
            lte: range.endDate,
          },
          periodEnd: {
            gte: range.startDate,
          },
        },
      ],
    };
  }

  if (range.startDate) {
    return {
      periodEnd: {
        gte: range.startDate,
      },
    };
  }

  return {
    periodStart: {
      lte: range.endDate,
    },
  };
}

export class FinanceService {
  static async getSaasRevenue(
    tenantId: string,
    range: FinanceDateRange = {}
  ): Promise<SaasRevenueReport> {
    assertTenantContext(tenantId);

    const baseWhere: Prisma.SoftwareSaleWhereInput = {
      tenantId,
      status: "CLOSED_WON",
      ...buildSaleDateWhere(range),
    };

    const [sales, cashAgg, proratedAgg] = await Promise.all([
      prisma.softwareSale.findMany({
        where: baseWhere,
        orderBy: { saleDate: "desc" },
      }),
      prisma.softwareSale.aggregate({
        where: baseWhere,
        _sum: { collectedAmountCop: true },
      }),
      prisma.softwareRevenueSchedule.aggregate({
        where: {
          tenantId,
          mode: "PRORATED",
          sale: {
            status: "CLOSED_WON",
          },
          ...buildScheduleWhere(range),
        },
        _sum: { recognizedAmountCop: true },
      }),
    ]);

    const rows: SaasSaleRow[] = sales.map((sale) => ({
      id: sale.id,
      customerName: sale.customerName,
      productName: sale.productName,
      planName: sale.planName,
      saleDate: sale.saleDate.toISOString(),
      contractStartDate: sale.contractStartDate.toISOString(),
      contractEndDate: sale.contractEndDate.toISOString(),
      amountCop: toNumber(sale.amountCop),
      collectedAmountCop: toNumber(sale.collectedAmountCop),
      status: sale.status,
      paymentStatus: sale.paymentStatus,
    }));

    return {
      rangeLabel: getRangeLabel(range),
      cashIn: toNumber(cashAgg._sum.collectedAmountCop),
      prorated: toNumber(proratedAgg._sum.recognizedAmountCop),
      totalClosedSales: rows.length,
      sales: rows,
    };
  }

  static async getCohortProfitability(
    tenantId: string,
    range: FinanceDateRange = {}
  ): Promise<CohortProfitabilityReport> {
    assertTenantContext(tenantId);

    const where: Prisma.AcademyCohortWhereInput = {
      tenantId,
      ...(range.startDate || range.endDate
        ? {
            startDate: {
              ...(range.startDate ? { gte: range.startDate } : {}),
              ...(range.endDate ? { lte: range.endDate } : {}),
            },
          }
        : {}),
    };

    const cohorts = await prisma.academyCohort.findMany({
      where,
      orderBy: { startDate: "desc" },
      include: {
        course: {
          select: { title: true },
        },
        enrollments: {
          select: {
            id: true,
            netRevenueCop: true,
            paidAmountCop: true,
            status: true,
          },
        },
        costAllocations: {
          select: {
            amountCop: true,
            category: true,
          },
        },
      },
    });

    const rows: CohortProfitabilityRow[] = cohorts.map((cohort) => {
      const students = cohort.enrollments.length;
      const totalRevenue = cohort.enrollments.reduce(
        (acc, enrollment) => acc + toNumber(enrollment.netRevenueCop),
        0
      );
      const paidRevenue = cohort.enrollments.reduce(
        (acc, enrollment) => acc + toNumber(enrollment.paidAmountCop),
        0
      );
      const totalCost = cohort.costAllocations.reduce(
        (acc, allocation) => acc + toNumber(allocation.amountCop),
        0
      );
      const adsCost = cohort.costAllocations
        .filter((allocation) => allocation.category === "ADS")
        .reduce((acc, allocation) => acc + toNumber(allocation.amountCop), 0);

      const grossMargin = totalRevenue - totalCost;
      const marginPct = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;
      const cac = students > 0 ? adsCost / students : 0;
      const roi = totalCost > 0 ? grossMargin / totalCost : 0;

      return {
        cohortId: cohort.id,
        cohortName: cohort.name,
        courseTitle: cohort.course.title,
        status: cohort.status,
        students,
        totalRevenue,
        paidRevenue,
        totalCost,
        adsCost,
        grossMargin,
        marginPct,
        cac,
        roi,
      };
    });

    const totals = rows.reduce(
      (acc, row) => {
        acc.revenue += row.totalRevenue;
        acc.cost += row.totalCost;
        acc.margin += row.grossMargin;
        return acc;
      },
      { revenue: 0, cost: 0, margin: 0 }
    );

    return {
      rangeLabel: getRangeLabel(range),
      cohorts: rows,
      totals,
    };
  }

  static async getExecutiveKpis(
    tenantId: string,
    range: FinanceDateRange = {}
  ): Promise<FinanceExecutiveKpis> {
    assertTenantContext(tenantId);

    const [saas, cohorts] = await Promise.all([
      this.getSaasRevenue(tenantId, range),
      this.getCohortProfitability(tenantId, range),
    ]);

    const academyAdsCost = cohorts.cohorts.reduce((acc, row) => acc + row.adsCost, 0);
    const academyRevenue = cohorts.totals.revenue;
    const academyCost = cohorts.totals.cost;
    const totalRevenue = saas.cashIn + academyRevenue;
    const totalCost = academyCost;
    const grossMarginPct = totalRevenue > 0 ? (totalRevenue - totalCost) / totalRevenue * 100 : 0;

    return {
      totalRevenue,
      totalCost,
      grossMargin: totalRevenue - totalCost,
      grossMarginPct,
      softwareRevenueCashIn: saas.cashIn,
      softwareRevenueProrated: saas.prorated,
      academyRevenue,
      academyCost,
      academyAdsCost,
      activeCohorts: cohorts.cohorts.filter((cohort) => cohort.status === "ACTIVE").length,
    };
  }
}
