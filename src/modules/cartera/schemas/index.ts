/**
 * Schemas Zod para Cartera / PaymentCommitment
 */
import { z } from "zod";

export const commitmentStatusSchema = z.enum([
  "PAGADO",
  "PENDIENTE",
  "EN_COMPROMISO",
]);

/**
 * Schema para creación de compromiso de pago.
 * `scheduledDate` se acepta como string ISO o Date.
 */
export const createPaymentCommitmentSchema = z.object({
  studentId: z.string().min(1, "Estudiante requerido"),
  scheduledDate: z.coerce.date({ message: "Fecha inválida" }),
  amount: z.coerce
    .number()
    .positive("El monto debe ser mayor a 0")
    .max(1_000_000_000, "Monto excede el límite permitido"),
  comments: z.string().max(1000).optional().or(z.literal("")),
  moduleNumber: z.coerce.number().int().min(1).max(100).optional(),
});

export const updatePaymentCommitmentSchema = z.object({
  scheduledDate: z.coerce.date().optional(),
  amount: z.coerce.number().positive().optional(),
  status: commitmentStatusSchema.optional(),
  rescheduledDate: z.coerce.date().optional().nullable(),
  comments: z.string().max(1000).optional().nullable(),
});

export type CreatePaymentCommitmentInput = z.infer<
  typeof createPaymentCommitmentSchema
>;
export type UpdatePaymentCommitmentInput = z.infer<
  typeof updatePaymentCommitmentSchema
>;
