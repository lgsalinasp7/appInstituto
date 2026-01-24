export type StudentStatus = "MATRICULADO" | "EN_OTRA_INSTITUCION" | "PENDIENTE";

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
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  enrollmentDate: Date;
  initialPayment: number;
  totalProgramValue: number;
  status?: StudentStatus;
  programId: string;
  advisorId: string;
}

export interface UpdateStudentData {
  fullName?: string;
  documentType?: string;
  email?: string;
  phone?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  status?: StudentStatus;
  programId?: string;
}

export interface StudentWithRelations {
  id: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  email: string | null;
  phone: string;
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
