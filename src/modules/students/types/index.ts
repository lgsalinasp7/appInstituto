import { StudentStatus, PaymentFrequency, PaymentMethod } from "@prisma/client";

export type { StudentStatus }; // Re-export if needed or just use it

export interface StudentFilters {
  search?: string;
  status?: StudentStatus;
  programId?: string;
  advisorId?: string;
  page?: number;
  limit?: number;
}

export interface CreateStudentData {
  fullName: string;
  documentType: string;
  documentNumber: string;
  email?: string;
  phone: string;
  city?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  enrollmentDate: Date;
  // Configuración de pagos
  paymentFrequency: PaymentFrequency;
  firstCommitmentDate: Date;
  initialPayment: number;
  totalProgramValue: number;
  status?: StudentStatus;
  programId: string;
  advisorId: string;
  // Datos del pago de matrícula
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
}

// Resultado de crear matrícula con pago
export interface CreateStudentResult {
  student: StudentWithRelations;
  payment: {
    id: string;
    amount: number;
    paymentDate: Date;
    method: string;
    reference: string | null;
    paymentType: string;
    receiptNumber: string;
  };
  commitment: {
    id: string;
    amount: number;
    scheduledDate: Date;
    moduleNumber: number;
  };
  program: {
    name: string;
    totalValue: number;
    matriculaValue: number;
    modulesCount: number;
  };
}

export interface UpdateStudentData {
  fullName?: string;
  documentType?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  status?: StudentStatus;
  programId?: string;
  // New fields
  paymentFrequency?: PaymentFrequency;
  firstCommitmentDate?: Date;
}

export interface StudentWithRelations {
  id: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  email: string | null;
  phone: string;
  city: string | null;
  address: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;
  enrollmentDate: Date;
  initialPayment: number;
  totalProgramValue: number;
  status: StudentStatus;
  programId: string;
  advisorId: string;
  createdAt: Date;
  updatedAt: Date;
  // New fields
  paymentFrequency: PaymentFrequency;
  firstCommitmentDate: Date | null;
  currentModule: number;
  matriculaPaid: boolean;
  program: {
    id: string;
    name: string;
  };
  advisor: {
    id: string;
    name: string | null;
    email: string;
  };
  totalPaid: number;
  remainingBalance: number;
}

export interface StudentsListResponse {
  students: StudentWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MatriculaReceiptData {
  student: {
    id: string;
    fullName: string;
    documentType: string;
    documentNumber: string;
    phone: string;
    email: string | null;
    city: string | null;
  };
  payment: {
    id: string;
    amount: number;
    paymentDate: Date;
    method: string;
    reference: string | null;
    paymentType: string;
    receiptNumber: string;
  };
  commitment: {
    amount: number;
    scheduledDate: Date;
    moduleNumber: number;
  };
  program: {
    name: string;
    totalValue: number;
    matriculaValue: number;
    modulesCount: number;
  };
  registeredBy: {
    name: string;
  };
}
