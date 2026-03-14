/**
 * Tipos del módulo Lavadero Pro
 */
import type {
  LavaderoCustomer,
  LavaderoVehicle,
  LavaderoService,
  LavaderoOrder,
  LavaderoOrderService,
  LavaderoPayment,
  LavaderoVehicleType,
  LavaderoOrderStatus,
  LavaderoPaymentMethod,
} from "@prisma/client";

export type {
  LavaderoCustomer,
  LavaderoVehicle,
  LavaderoService,
  LavaderoOrder,
  LavaderoOrderService,
  LavaderoPayment,
  LavaderoVehicleType,
  LavaderoOrderStatus,
  LavaderoPaymentMethod,
};

export interface LavaderoCustomerWithVehicles extends LavaderoCustomer {
  vehicles: LavaderoVehicle[];
}

export interface LavaderoOrderWithDetails extends LavaderoOrder {
  vehicle: LavaderoVehicle;
  customer: LavaderoCustomer;
  orderServices: (LavaderoOrderService & { service: LavaderoService })[];
  payments: LavaderoPayment[];
  creator: { id: string; name: string | null };
}

export interface LavaderoDashboardMetrics {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  pendingOrders: number;
  todayOrders: number;
  servicePopularity: { name: string; count: number }[];
  paymentBreakdown: { method: string; total: number }[];
}

export interface LavaderoDailySummary {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  paymentBreakdown: { method: string; total: number; count: number }[];
}
