import type { PaymentMethod } from "@prisma/client";

export type { PaymentMethod };

export interface PaymentFilters {
  studentId?: string;
  advisorId?: string;
  method?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface CreatePaymentData {
  amount: number;
  paymentDate: Date;
  method: PaymentMethod;
  reference?: string;
  comments?: string;
  studentId: string;
  registeredById: string;
}

export interface PaymentWithRelations {
  id: string;
  amount: number;
  paymentDate: Date;
  method: PaymentMethod;
  reference: string | null;
  receiptNumber: string;
  comments: string | null;
  studentId: string;
  registeredById: string;
  createdAt: Date;
  student: {
    id: string;
    fullName: string;
    documentNumber: string;
  };
  registeredBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface PaymentsListResponse {
  payments: PaymentWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentStats {
  totalCollected: number;
  paymentsCount: number;
  averagePayment: number;
  byMethod: Record<PaymentMethod, number>;
}
