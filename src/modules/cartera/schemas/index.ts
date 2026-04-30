/**
 * Schemas Zod para Cartera / PaymentCommitment
 */
import { z } from "zod";

export const commitmentStatusSchema = z.enum([
  "PAGADO",
  "PENDIENTE",
  "EN_COMPROMISO",
  "CANCELADO",
  "VENCIDO",
]);

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Schema para creación de compromiso de pago.
 * Regla: si allowPastDate=false (default), scheduledDate >= startOfDay(today).
 */
export const createPaymentCommitmentSchema = z
  .object({
    studentId: z.string().min(1, "Estudiante requerido"),
    scheduledDate: z.coerce.date({ message: "Fecha inválida" }),
    amount: z.coerce
      .number()
      .positive("El monto debe ser mayor a 0")
      .max(1_000_000_000, "Monto excede el límite permitido"),
    comments: z.string().max(1000).optional().or(z.literal("")),
    moduleNumber: z.coerce.number().int().min(1).max(100).optional(),
    allowPastDate: z.coerce.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (data.allowPastDate) return true;
      return data.scheduledDate.getTime() >= startOfToday().getTime();
    },
    {
      message:
        "La fecha del compromiso no puede ser anterior a hoy (use allowPastDate=true para permitir)",
      path: ["scheduledDate"],
    }
  );

export const updatePaymentCommitmentSchema = z
  .object({
    scheduledDate: z.coerce.date().optional(),
    amount: z.coerce.number().positive().optional(),
    status: commitmentStatusSchema.optional(),
    rescheduledDate: z.coerce.date().optional().nullable(),
    comments: z.string().max(1000).optional().nullable(),
    allowPastDate: z.coerce.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (data.allowPastDate) return true;
      if (!data.scheduledDate) return true;
      return data.scheduledDate.getTime() >= startOfToday().getTime();
    },
    {
      message:
        "La fecha del compromiso no puede ser anterior a hoy (use allowPastDate=true para permitir)",
      path: ["scheduledDate"],
    }
  );

export type CreatePaymentCommitmentInput = z.infer<
  typeof createPaymentCommitmentSchema
>;
export type UpdatePaymentCommitmentInput = z.infer<
  typeof updatePaymentCommitmentSchema
>;

/**
 * Schema para registrar un abono (Payment) sobre un PaymentCommitment.
 */
export const recordCommitmentPaymentSchema = z.object({
  commitmentId: z.string().min(1, "commitmentId requerido"),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  method: z
    .enum(["BANCOLOMBIA", "NEQUI", "DAVIPLATA", "EFECTIVO", "OTRO"])
    .default("EFECTIVO"),
  reference: z.string().max(200).optional(),
  paidAt: z.coerce.date().optional(),
});

export type RecordCommitmentPaymentInput = z.infer<
  typeof recordCommitmentPaymentSchema
>;
