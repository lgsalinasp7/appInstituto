import { z } from "zod";

export const createPaymentSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  paymentDate: z.coerce.date(),
  method: z.enum(["BANCOLOMBIA", "NEQUI", "DAVIPLATA", "EFECTIVO", "OTRO"]),
  reference: z.string().optional(),
  comments: z.string().optional(),
  studentId: z.string().min(1, "Debe seleccionar un estudiante"),
  registeredById: z.string().min(1, "Usuario no identificado"),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
