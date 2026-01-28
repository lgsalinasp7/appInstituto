import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                program: {
                    select: {
                        id: true,
                        name: true,
                        totalValue: true,
                        matriculaValue: true,
                        modulesCount: true,
                    },
                },
                commitments: {
                    where: { status: "PENDIENTE" },
                    orderBy: { moduleNumber: "asc" },
                    select: {
                        id: true,
                        moduleNumber: true,
                        amount: true,
                        scheduledDate: true,
                        status: true,
                    },
                },
                payments: {
                    select: {
                        id: true,
                        amount: true,
                        paymentDate: true,
                        paymentType: true,
                        moduleNumber: true,
                        receiptNumber: true,
                    },
                    orderBy: { paymentDate: "desc" },
                },
            },
        });

        if (!student) {
            return NextResponse.json(
                { success: false, error: "Estudiante no encontrado" },
                { status: 404 }
            );
        }

        const program = student.program;

        // Calculate module value
        const moduleValue =
            (Number(program.totalValue) - Number(program.matriculaValue)) /
            program.modulesCount;

        // Minimum payment is the current pending commitment amount (or moduleValue if none exists)
        // Effectively this is the "Suggested Payment" to cover the full module/debt.
        const currentCommitment = student.commitments[0];
        const minimumPayment = currentCommitment
            ? Number(currentCommitment.amount)
            : moduleValue;

        // Calculate remaining balance
        const totalPaid = student.payments.reduce(
            (sum, p) => sum + Number(p.amount),
            0
        );
        const remainingBalance = Number(program.totalValue) - totalPaid;

        return NextResponse.json({
            success: true,
            data: {
                studentId: student.id,
                studentName: student.fullName,
                programName: program.name,
                moduleValue,
                minimumPayment,
                remainingBalance,
                currentModule: student.currentModule,
                modulesCount: program.modulesCount,
                matriculaPaid: student.matriculaPaid,
                pendingCommitments: student.commitments.map((c) => ({
                    id: c.id,
                    moduleNumber: c.moduleNumber,
                    amount: Number(c.amount),
                    scheduledDate: c.scheduledDate,
                    status: c.status,
                })),
                paymentHistory: student.payments.map((p) => ({
                    id: p.id,
                    amount: Number(p.amount),
                    paymentDate: p.paymentDate,
                    paymentType: p.paymentType,
                    moduleNumber: p.moduleNumber,
                    receiptNumber: p.receiptNumber,
                })),
            },
        });
    } catch (error) {
        console.error("Error fetching student payment info:", error);
        return NextResponse.json(
            { success: false, error: "Error al obtener información de pagos" },
            { status: 500 }
        );
    }
}
