import prisma from "@/lib/prisma";
import { getCurrentTenantId } from "@/lib/tenant";
import { CreateCommitmentData, UpdateCommitmentData, CommitmentFilters } from "../types";
import { Prisma } from "@prisma/client";

export class CommitmentService {
    static async createCommitment(data: CreateCommitmentData) {
        const tenantId = await getCurrentTenantId() as string;
        return prisma.paymentCommitment.create({
            data: {
                scheduledDate: data.scheduledDate,
                amount: data.amount,
                studentId: data.studentId,
                moduleNumber: data.moduleNumber,
                status: data.status || "PENDIENTE",
                notificationsSent: {},
                tenantId,
            },
        });
    }

    static async updateCommitment(id: string, data: UpdateCommitmentData) {
        const tenantId = await getCurrentTenantId() as string;

        // Verificar pertenencia al tenant
        const existing = await prisma.paymentCommitment.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            throw new Error("Compromiso no encontrado o no pertenece a este instituto");
        }

        return prisma.paymentCommitment.update({
            where: { id },
            data,
        });
    }

    static async getCommitments(filters: CommitmentFilters) {
        const { studentId, status, startDate, endDate, page = 1, limit = 10 } = filters;
        const tenantId = await getCurrentTenantId() as string;
        const where: Prisma.PaymentCommitmentWhereInput = { tenantId };

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
        const tenantId = await getCurrentTenantId() as string;

        // Verificar pertenencia
        const existing = await prisma.paymentCommitment.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            throw new Error("Compromiso no encontrado o no pertenece a este instituto");
        }

        return prisma.paymentCommitment.update({
            where: { id },
            data: {
                status: "PAGADO",
            },
        });
    }

    static async getOverdueCommitments() {
        const today = new Date();
        const tenantId = await getCurrentTenantId() as string;

        return prisma.paymentCommitment.findMany({
            where: {
                tenantId,
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
