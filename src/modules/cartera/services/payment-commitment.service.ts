import "server-only";

import prisma from "@/lib/prisma";
import { assertTenantContext } from "@/lib/tenant-guard";
import { Prisma } from "@prisma/client";
import type {
  CreatePaymentCommitmentInput,
  UpdatePaymentCommitmentInput,
} from "../schemas";
import type { CommitmentStatus } from "../types";

const studentInclude = {
  student: {
    select: {
      id: true,
      fullName: true,
      documentNumber: true,
      phone: true,
      email: true,
      advisor: {
        select: { id: true, name: true, email: true },
      },
    },
  },
} satisfies Prisma.PaymentCommitmentInclude;

interface ListFilters {
  tenantId: string;
  studentId?: string;
  status?: CommitmentStatus;
  page?: number;
  limit?: number;
}

/**
 * Lista compromisos del tenant. Siempre filtra por tenantId.
 */
export async function listPaymentCommitments(filters: ListFilters) {
  const { tenantId, studentId, status, page = 1, limit = 20 } = filters;
  assertTenantContext(tenantId);

  const where: Prisma.PaymentCommitmentWhereInput = { tenantId };
  if (studentId) where.studentId = studentId;
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.paymentCommitment.findMany({
      where,
      include: studentInclude,
      orderBy: { scheduledDate: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.paymentCommitment.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPaymentCommitmentById(id: string, tenantId: string) {
  assertTenantContext(tenantId);
  return prisma.paymentCommitment.findFirst({
    where: { id, tenantId },
    include: studentInclude,
  });
}

/**
 * Crea un compromiso. Verifica que el estudiante pertenezca al tenant
 * antes de insertar (multi-tenant guard).
 */
export async function createPaymentCommitment(
  data: CreatePaymentCommitmentInput,
  tenantId: string
) {
  assertTenantContext(tenantId);

  const student = await prisma.student.findFirst({
    where: { id: data.studentId, tenantId },
    select: { id: true },
  });
  if (!student) {
    throw new Error("Estudiante no encontrado en este tenant");
  }

  const createInput: Prisma.PaymentCommitmentCreateInput = {
    scheduledDate: data.scheduledDate,
    amount: new Prisma.Decimal(data.amount),
    comments: data.comments && data.comments.length > 0 ? data.comments : null,
    moduleNumber: data.moduleNumber ?? 1,
    student: { connect: { id: data.studentId } },
    tenant: { connect: { id: tenantId } },
  };

  return prisma.paymentCommitment.create({
    data: createInput,
    include: studentInclude,
  });
}

/**
 * Actualiza un compromiso. Patrón findFirst-antes-de-update para garantizar
 * aislamiento multi-tenant.
 */
export async function updatePaymentCommitment(
  id: string,
  data: UpdatePaymentCommitmentInput,
  tenantId: string
) {
  assertTenantContext(tenantId);

  const existing = await prisma.paymentCommitment.findFirst({
    where: { id, tenantId },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Compromiso no encontrado o no pertenece a este tenant");
  }

  const updateInput: Prisma.PaymentCommitmentUpdateInput = {};
  if (data.scheduledDate !== undefined)
    updateInput.scheduledDate = data.scheduledDate;
  if (data.amount !== undefined)
    updateInput.amount = new Prisma.Decimal(data.amount);
  if (data.status !== undefined) updateInput.status = data.status;
  if (data.rescheduledDate !== undefined)
    updateInput.rescheduledDate = data.rescheduledDate;
  if (data.comments !== undefined) updateInput.comments = data.comments;

  return prisma.paymentCommitment.update({
    where: { id },
    data: updateInput,
    include: studentInclude,
  });
}

/**
 * "Cancela" un compromiso vía SOFT-DELETE: cambia status a CANCELADO en
 * lugar de borrar el registro. Mantiene historial auditable.
 */
export async function cancelPaymentCommitment(id: string, tenantId: string) {
  assertTenantContext(tenantId);

  const existing = await prisma.paymentCommitment.findFirst({
    where: { id, tenantId },
    select: { id: true, status: true },
  });
  if (!existing) {
    throw new Error("Compromiso no encontrado o no pertenece a este tenant");
  }
  if (existing.status === "PAGADO") {
    throw new Error("No se puede cancelar un compromiso ya pagado");
  }

  const updated = await prisma.paymentCommitment.update({
    where: { id },
    data: { status: "CANCELADO" satisfies CommitmentStatus },
    select: { id: true, status: true },
  });
  return updated;
}

/**
 * Registra un abono (Payment) vinculado lógicamente a un PaymentCommitment.
 * Reglas:
 *  - Tenant guard.
 *  - El monto debe ser exactamente igual al del compromiso.
 *  - Crea Payment + actualiza commitment.status a PAGADO en una transacción.
 */
export async function recordPaymentForCommitment(
  input: {
    commitmentId: string;
    amount: number;
    method: "BANCOLOMBIA" | "NEQUI" | "DAVIPLATA" | "EFECTIVO" | "OTRO";
    reference?: string;
    paidAt?: Date;
  },
  tenantId: string,
  registeredById: string
) {
  assertTenantContext(tenantId);

  const commitment = await prisma.paymentCommitment.findFirst({
    where: { id: input.commitmentId, tenantId },
    select: {
      id: true,
      amount: true,
      status: true,
      studentId: true,
      moduleNumber: true,
    },
  });
  if (!commitment) {
    throw new Error("Compromiso no encontrado o no pertenece a este tenant");
  }
  if (commitment.status === "PAGADO") {
    throw new Error("El compromiso ya está pagado");
  }
  if (commitment.status === "CANCELADO") {
    throw new Error("No se puede pagar un compromiso cancelado");
  }

  const commitmentAmount = new Prisma.Decimal(commitment.amount);
  const paymentAmount = new Prisma.Decimal(input.amount);

  if (!commitmentAmount.equals(paymentAmount)) {
    throw new Error(
      `El monto del abono ($${paymentAmount.toString()}) debe ser exactamente igual al monto del compromiso ($${commitmentAmount.toString()}). Pagos parciales no permitidos.`
    );
  }

  const receiptNumber = `REC-${Date.now()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        amount: paymentAmount,
        paymentDate: input.paidAt ?? new Date(),
        method: input.method,
        reference: input.reference ?? null,
        receiptNumber,
        paymentType: "MODULO",
        moduleNumber: commitment.moduleNumber,
        student: { connect: { id: commitment.studentId } },
        registeredBy: { connect: { id: registeredById } },
        tenant: { connect: { id: tenantId } },
      },
    });

    const updated = await tx.paymentCommitment.update({
      where: { id: commitment.id },
      data: { status: "PAGADO" satisfies CommitmentStatus },
      include: studentInclude,
    });

    return { payment, commitment: updated };
  });

  return result;
}
