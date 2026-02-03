import { PaymentMethod, PaymentType } from "@prisma/client";

export type { PaymentMethod };

export interface PaymentFilters {
  studentId?: string;
  advisorId?: string;
  search?: string;
  method?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  tenantId?: string;
}

export interface CreatePaymentData {
  amount: number;
  paymentDate: Date;
  method: PaymentMethod;
  reference?: string;
  comments?: string;
  studentId: string;
  registeredById: string;
  tenantId: string;
}

export interface UpdatePaymentData {
  amount?: number;
  paymentDate?: Date;
  method?: PaymentMethod;
  reference?: string;
  comments?: string;
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
    phone: string | null;
    program: {
      name: string;
    };
  };
  registeredBy: {
    id: string;
    name: string | null;
    email: string;
  };
  paymentType: PaymentType;
  moduleNumber: number | null;
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
