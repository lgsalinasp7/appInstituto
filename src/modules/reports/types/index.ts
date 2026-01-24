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
  totalRevenue: number;
  revenueChange: number;
  activeStudents: number;
  studentsChange: number;
  pendingPayments: number;
  pendingChange: number;
  conversionRate: number;
  conversionChange: number;
}

export interface RevenueChartData {
  name: string;
  total: number;
}
