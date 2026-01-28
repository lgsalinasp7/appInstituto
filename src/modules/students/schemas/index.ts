import { z } from "zod";
import { StudentStatus, PaymentFrequency, PaymentMethod } from "@prisma/client";

// Métodos de pago disponibles
export const PAYMENT_METHODS = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "NEQUI", label: "Nequi" },
  { value: "BANCOLOMBIA", label: "Bancolombia" },
  { value: "DAVIPLATA", label: "Daviplata" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
] as const;

export const createStudentSchema = z.object({
  // Datos personales
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  documentType: z.string().default("CC"),
  documentNumber: z.string().min(5, "El documento debe tener al menos 5 caracteres"),
  email: z.email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(7, "El teléfono debe tener al menos 7 dígitos"),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.email("Email del acudiente inválido").optional().or(z.literal("")),

  // Datos académicos
  enrollmentDate: z.coerce.date(),
  initialPayment: z.coerce.number().min(0, "El pago inicial no puede ser negativo"),
  totalProgramValue: z.coerce.number().min(0, "El valor total no puede ser negativo"),
  status: z.nativeEnum(StudentStatus).default(StudentStatus.MATRICULADO),
  programId: z.string().min(1, "Debe seleccionar un programa"),
  advisorId: z.string().min(1, "Debe asignar un asesor"),
  paymentFrequency: z.nativeEnum(PaymentFrequency),
  firstCommitmentDate: z.coerce.date(),

  // Datos del pago de matrícula (NUEVO)
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: "Debe seleccionar un método de pago" }),
  }),
  paymentReference: z.string().optional(),
});

export const updateStudentSchema = z.object({
  fullName: z.string().min(3).optional(),
  documentType: z.string().optional(),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().min(7).optional(),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.email().optional().or(z.literal("")),
  status: z.nativeEnum(StudentStatus).optional(),
  programId: z.string().optional(),
  advisorId: z.string().optional(),
  enrollmentDate: z.coerce.date().optional(),
  initialPayment: z.coerce.number().min(0).optional(),
  totalProgramValue: z.coerce.number().min(0).optional(),
  paymentFrequency: z.nativeEnum(PaymentFrequency).optional(),
  firstCommitmentDate: z.coerce.date().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
