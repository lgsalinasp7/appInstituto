export type FinanceLine = "SOFTWARE" | "ACADEMIA";

export interface FinanceDateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface FinanceExecutiveKpis {
  totalRevenue: number;
  totalCost: number;
  grossMargin: number;
  grossMarginPct: number;
  softwareRevenueCashIn: number;
  softwareRevenueProrated: number;
  academyRevenue: number;
  academyCost: number;
  academyAdsCost: number;
  activeCohorts: number;
}

export interface SaasSaleRow {
  id: string;
  customerName: string;
  productName: string;
  planName: string | null;
  saleDate: string;
  contractStartDate: string;
  contractEndDate: string;
  amountCop: number;
  collectedAmountCop: number;
  status: string;
  paymentStatus: string;
}

export interface SaasRevenueReport {
  rangeLabel: string;
  cashIn: number;
  prorated: number;
  totalClosedSales: number;
  sales: SaasSaleRow[];
}

export interface CohortProfitabilityRow {
  cohortId: string;
  cohortName: string;
  courseTitle: string;
  status: string;
  students: number;
  totalRevenue: number;
  paidRevenue: number;
  totalCost: number;
  adsCost: number;
  grossMargin: number;
  marginPct: number;
  cac: number;
  roi: number;
}

export interface CohortProfitabilityReport {
  rangeLabel: string;
  cohorts: CohortProfitabilityRow[];
  totals: {
    revenue: number;
    cost: number;
    margin: number;
  };
}
