export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ReportFilters {
  advisorId?: string;
  programId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface FinancialReport {
  period: string;
  totalRevenue: number;
  totalPayments: number;
  averagePayment: number;
  pendingAmount: number;
  byMethod: {
    method: string;
    amount: number;
    count: number;
  }[];
  dailyRevenue: {
    date: string;
    amount: number;
    count: number;
  }[];
}

export interface AdvisorReport {
  advisorId: string;
  advisorName: string;
  advisorEmail: string;
  totalStudents: number;
  activeStudents: number;
  totalSales: number;
  totalCollected: number;
  pendingAmount: number;
  collectionRate: number;
  studentsThisMonth: number;
  revenueThisMonth: number;
}

export interface ProgramReport {
  programId: string;
  programName: string;
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  pendingAmount: number;
  averagePaymentProgress: number;
}

export interface DashboardStats {
  todayRevenue: number;
  monthlyRevenue: number;
  revenueChange: number; // Porcentaje comparado con mes anterior
  activeStudents: number;
  studentsChange: number;
  pendingPaymentsCount: number; // Cantidad de compromisos pendientes
  overdueAmount: number; // Monto total en mora
  pendingChange: number;
  conversionRate: number;
}

export interface AgingBracket {
  label: string;
  amount: number;
  count: number;
}

export interface PortfolioAgingReport {
  brackets: AgingBracket[];
  totalOverdue: number;
}

export interface RevenueChartData {
  name: string;
  total: number;
}

export type ReportPeriod = "month" | "3months" | "year";

export interface CarteraUserReport {
  userId: string;
  userName: string;
  userEmail: string;
  totalPaymentsRegistered: number;
  totalAmountCollected: number;
  paymentsThisPeriod: number;
  amountThisPeriod: number;
}
