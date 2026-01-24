/**
 * Dashboard Mock Data
 * Sample data for development and testing
 */

import type {
  Student,
  Payment,
  DashboardStats,
  RevenueData,
  AdvisorPerformance,
  AlertItem,
  PendingDebt,
  ProgramDistribution,
} from '../types';

// Mock Students
export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    document: '10203040',
    enrollmentDate: '2024-01-15',
    advisor: 'María García',
    status: 'MATRICULADO',
    program: 'Bachillerato Acelerado',
    totalValue: 650,
    paidAmount: 200,
    remainingBalance: 450,
    nextPaymentDate: '2024-05-15',
  },
  {
    id: '2',
    name: 'Ana Rodríguez',
    document: '95847362',
    enrollmentDate: '2024-02-10',
    advisor: 'Fulana López',
    status: 'MATRICULADO',
    program: 'Inglés Técnico',
    totalValue: 650,
    paidAmount: 650,
    remainingBalance: 0,
    nextPaymentDate: '2024-06-10',
  },
  {
    id: '3',
    name: 'Carlos Ruiz',
    document: '11223344',
    enrollmentDate: '2024-03-05',
    advisor: 'María García',
    status: 'MATRICULADO',
    program: 'Bachillerato Acelerado',
    totalValue: 650,
    paidAmount: 150,
    remainingBalance: 500,
    nextPaymentDate: '2024-04-15',
  },
  {
    id: '4',
    name: 'Laura Martínez',
    document: '55667788',
    enrollmentDate: '2024-03-20',
    advisor: 'Ricardo S.',
    status: 'MATRICULADO',
    program: 'Sistemas',
    totalValue: 800,
    paidAmount: 400,
    remainingBalance: 400,
    nextPaymentDate: '2024-05-20',
  },
];

// Mock Payments
export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    studentId: '1',
    studentName: 'Juan Pérez',
    amount: 100,
    date: '2024-04-16',
    method: 'BANCOLOMBIA',
    reference: 'REF-88221',
    advisor: 'María García',
    materialSent: 'Biología (Exámenes Posáceos)',
  },
  {
    id: 'p2',
    studentId: '2',
    studentName: 'Ana Rodríguez',
    amount: 150,
    date: '2024-04-18',
    method: 'OTRO',
    reference: 'REF-99102',
    advisor: 'Fulana López',
    materialSent: 'Español (Módulo 2)',
  },
];

// Dashboard Stats
export const DASHBOARD_STATS: DashboardStats = {
  totalRevenue: '$16,100',
  activeStudents: '124',
  pendingPayments: '18',
  conversionRate: '68%',
};

// Revenue Chart Data
export const REVENUE_DATA: RevenueData[] = [
  { name: 'Semana 1', total: 4500 },
  { name: 'Semana 2', total: 3200 },
  { name: 'Semana 3', total: 5100 },
  { name: 'Semana 4', total: 2800 },
];

// Advisor Performance
export const ADVISOR_PERFORMANCE: AdvisorPerformance[] = [
  { name: 'María García', sales: 12, collected: 7800 },
  { name: 'Fulana López', sales: 8, collected: 5200 },
  { name: 'Ricardo S.', sales: 5, collected: 3100 },
];

// Alerts
export const ALERTS: AlertItem[] = [
  { name: 'Juan Pérez', amount: '$150', date: 'Hoy', type: 'overdue' },
  { name: 'Carlos Ruiz', amount: '$100', date: 'Mañana', type: 'pending' },
  { name: 'Sofía Díaz', amount: '$200', date: 'En 2 días', type: 'pending' },
];

// Pending Debts
export const PENDING_DEBTS: PendingDebt[] = [
  { name: 'Mateo Valencia', balance: 500, due: '2024-05-15', advisor: 'María García' },
  { name: 'Juliana Castro', balance: 350, due: '2024-05-20', advisor: 'Fulana López' },
  { name: 'Kevin Moreno', balance: 650, due: '2024-05-10', advisor: 'Ricardo S.' },
];

// Program Distribution
export const PROGRAM_DISTRIBUTION: ProgramDistribution[] = [
  { name: 'Bachillerato', value: 65 },
  { name: 'Inglés', value: 25 },
  { name: 'Sistemas', value: 10 },
];

// Chart Colors (using institutional palette)
export const CHART_COLORS = {
  primary: '#1e3a5f',
  primaryLight: '#2d4a6f',
  secondary: '#64748b',
  accent: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};
