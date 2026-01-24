export type CommitmentStatus = "PAGADO" | "PENDIENTE" | "EN_COMPROMISO";

export interface PaymentCommitmentData {
  id: string;
  scheduledDate: Date;
  amount: number;
  status: CommitmentStatus;
  rescheduledDate: Date | null;
  comments: string | null;
  studentId: string;
  createdAt: Date;
  updatedAt: Date;
  student: {
    id: string;
    fullName: string;
    documentNumber: string;
    phone: string;
    email: string | null;
    advisor: {
      id: string;
      name: string | null;
      email: string;
    };
  };
}

export interface CreateCommitmentData {
  scheduledDate: Date;
  amount: number;
  comments?: string;
  studentId: string;
}

export interface UpdateCommitmentData {
  scheduledDate?: Date;
  amount?: number;
  status?: CommitmentStatus;
  rescheduledDate?: Date;
  comments?: string;
}

export interface CarteraFilters {
  advisorId?: string;
  status?: CommitmentStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface CarteraAlert {
  id: string;
  type: "overdue" | "today" | "upcoming";
  studentName: string;
  studentPhone: string;
  amount: number;
  dueDate: Date;
  daysOverdue?: number;
  advisorName: string;
  studentId: string;
}

export interface CarteraSummary {
  totalPendingAmount: number;
  overdueCount: number;
  overdueAmount: number;
  todayCount: number;
  todayAmount: number;
  upcomingCount: number;
  upcomingAmount: number;
}

export interface StudentDebt {
  studentId: string;
  studentName: string;
  documentNumber: string;
  phone: string;
  email: string | null;
  programName: string;
  advisorName: string;
  totalProgramValue: number;
  totalPaid: number;
  remainingBalance: number;
  lastPaymentDate: Date | null;
  daysSinceLastPayment: number | null;
  commitments: PaymentCommitmentData[];
}
