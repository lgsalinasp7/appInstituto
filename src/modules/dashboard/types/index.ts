/**
 * Dashboard Module Types
 * Defines all TypeScript interfaces for the enrollment dashboard
 */

export type DashboardTab = 'dashboard' | 'enrollments' | 'payments' | 'cartera' | 'prospects' | 'reports';

// Payment status
export type PaymentStatus = 'paid' | 'pending' | 'overdue';

// Student status (matches Prisma enum)
export type StudentStatus = 'MATRICULADO' | 'EN_OTRA_INSTITUCION' | 'PENDIENTE';

// Payment methods (matches Prisma enum)
export type PaymentMethod = 'BANCOLOMBIA' | 'NEQUI' | 'DAVIPLATA' | 'EFECTIVO' | 'OTRO';

// Student interface
export interface Student {
  id: string;
  name: string;
  document: string;
  phone?: string;
  email?: string;
  enrollmentDate: string;
  advisor: string;
  status: StudentStatus;
  program: string;
  totalValue: number;
  paidAmount: number;
  remainingBalance: number;
  lastPaymentDate?: string;
  nextPaymentDate: string;
}

// Payment interface
export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference: string;
  advisor: string;
  materialSent: string;
}

// Stats interface for enrollment dashboard
export interface DashboardStats {
  totalRevenue: string;
  activeStudents: string;
  pendingPayments: string;
  conversionRate: string;
}

// Legacy stats interface (for old components)
export interface LegacyDashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
}

// Revenue data for chart
export interface RevenueData {
  name: string;
  total: number;
}

// Advisor performance
export interface AdvisorPerformance {
  name: string;
  sales: number;
  collected: number;
}

// Alert item
export interface AlertItem {
  name: string;
  amount: string;
  date: string;
  type: 'overdue' | 'pending';
}

// Dashboard card props
export interface DashboardCard {
  title: string;
  value: string | number;
  description?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// Recent activity
export interface RecentActivity {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Pending debt row
export interface PendingDebt {
  name: string;
  balance: number;
  due: string;
  advisor: string;
}

// Program distribution
export interface ProgramDistribution {
  name: string;
  value: number;
}
