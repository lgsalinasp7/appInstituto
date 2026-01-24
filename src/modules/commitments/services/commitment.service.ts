import prisma from "@/lib/prisma";
import { CreateCommitmentData, UpdateCommitmentData, CommitmentFilters } from "../types";
import { Prisma } from "@prisma/client";

export class CommitmentService {
    static async createCommitment(data: CreateCommitmentData) {
        return prisma.paymentCommitment.create({
            data: {
                scheduledDate: data.scheduledDate,
                amount: data.amount,
                studentId: data.studentId,
                moduleNumber: data.moduleNumber,
                status: data.status || "PENDIENTE",
                notificationsSent: {},
            },
        });
    }

    static async updateCommitment(id: string, data: UpdateCommitmentData) {
        return prisma.paymentCommitment.update({
            where: { id },
            data,
        });
    }

    static async getCommitments(filters: CommitmentFilters) {
        const { studentId, status, startDate, endDate, page = 1, limit = 10 } = filters;
        const where: Prisma.PaymentCommitmentWhereInput = {};

        if (studentId) where.studentId = studentId;
        if (status) where.status = status;
        if (startDate || endDate) {
            where.scheduledDate = {};
            if (startDate) where.scheduledDate.gte = startDate;
            if (endDate) where.scheduledDate.lte = endDate;
        }

        const [commitments, total] = await Promise.all([
            prisma.paymentCommitment.findMany({
                where,
                orderBy: { scheduledDate: "asc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    student: {
                        select: { id: true, fullName: true, phone: true },
                    },
                },
            }),
            prisma.paymentCommitment.count({ where }),
        ]);

        return {
            commitments,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    static async markAsPaid(id: string) {
        return prisma.paymentCommitment.update({
            where: { id },
            data: {
                status: "PAGADO",
            },
        });
    }

    static async getOverdueCommitments() {
        const today = new Date();
        return prisma.paymentCommitment.findMany({
            where: {
                status: "PENDIENTE",
                scheduledDate: {
                    lt: today,
                },
            },
            include: {
                student: {
                    select: { id: true, fullName: true, phone: true },
                },
            },
        });
    }
}
