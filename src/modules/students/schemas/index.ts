import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  documentType: z.string().default("CC"),
  documentNumber: z.string().min(5, "El documento debe tener al menos 5 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(7, "El teléfono debe tener al menos 7 dígitos"),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email("Email del acudiente inválido").optional().or(z.literal("")),
  enrollmentDate: z.coerce.date(),
  initialPayment: z.coerce.number().min(0, "El pago inicial no puede ser negativo"),
  totalProgramValue: z.coerce.number().min(0, "El valor total no puede ser negativo"),
  status: z.enum(["MATRICULADO", "EN_OTRA_INSTITUCION", "PENDIENTE"]).default("MATRICULADO"),
  programId: z.string().min(1, "Debe seleccionar un programa"),
  advisorId: z.string().min(1, "Debe asignar un asesor"),
});

export const updateStudentSchema = z.object({
  fullName: z.string().min(3).optional(),
  documentType: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(7).optional(),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email().optional().or(z.literal("")),
  status: z.enum(["MATRICULADO", "EN_OTRA_INSTITUCION", "PENDIENTE"]).optional(),
  programId: z.string().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
