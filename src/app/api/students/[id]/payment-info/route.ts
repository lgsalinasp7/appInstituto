import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenantAuth } from "@/lib/api-auth";
import { logApiStart, logApiSuccess, logApiError } from "@/lib/api-logger";

export const GET = withTenantAuth(async (request, user, tenantId, context) => {
  const { id } = await context!.params;
  const ctx = logApiStart(request, "student_payment_info", { params: { id } }, { userId: user.id, tenantId });
  const startedAt = Date.now();

  try {
    const student = await prisma.student.findUnique({
      where: { id, tenantId },
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

    // Minimum payment is the current pending commitment amount
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

    logApiSuccess(ctx, "student_payment_info", { duration: Date.now() - startedAt, resultId: student.id });
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
    logApiError(ctx, "student_payment_info", { error });
    return NextResponse.json(
      { success: false, error: "Error al obtener informacion de pagos" },
      { status: 500 }
    );
  }
});
