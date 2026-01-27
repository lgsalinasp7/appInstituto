import { z } from "zod";

export const createProspectSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  phone: z.string().min(7, "El teléfono debe tener al menos 7 dígitos"),
  email: z.email("Email inválido").optional().or(z.literal("")),
  status: z.enum(["CONTACTADO", "EN_SEGUIMIENTO", "CERRADO", "PERDIDO"]).default("CONTACTADO"),
  observations: z.string().optional(),
  programId: z.string().optional(),
  advisorId: z.string().min(1, "Debe asignar un asesor"),
});

export const updateProspectSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().min(7).optional(),
  email: z.email().optional().or(z.literal("")),
  status: z.enum(["CONTACTADO", "EN_SEGUIMIENTO", "CERRADO", "PERDIDO"]).optional(),
  observations: z.string().optional(),
  programId: z.string().optional().nullable(),
});

export type CreateProspectInput = z.infer<typeof createProspectSchema>;
export type UpdateProspectInput = z.infer<typeof updateProspectSchema>;
