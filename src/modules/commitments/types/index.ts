import { CommitmentStatus } from "@prisma/client";

export interface CreateCommitmentData {
    scheduledDate: Date;
    amount: number;
    studentId: string;
    moduleNumber: number;
    status?: CommitmentStatus;
}

export interface UpdateCommitmentData {
    scheduledDate?: Date;
    amount?: number;
    status?: CommitmentStatus;
    rescheduledDate?: Date;
    comments?: string;
    notificationsSent?: Record<string, boolean>;
}

export interface CommitmentFilters {
    studentId?: string;
    status?: CommitmentStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}
