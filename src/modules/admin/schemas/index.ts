/**
 * Admin Module Schemas
 * Zod validation schemas for admin functionality
 */

import { z } from "zod";

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(/^[a-z_]+$/, "El nombre solo puede contener letras minúsculas y guiones bajos"),
  description: z.string().max(200, "La descripción no puede exceder 200 caracteres").optional(),
  permissions: z.array(z.string()).min(1, "Debe seleccionar al menos un permiso"),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(/^[a-z_]+$/, "El nombre solo puede contener letras minúsculas y guiones bajos")
    .optional(),
  description: z.string().max(200, "La descripción no puede exceder 200 caracteres").optional(),
  permissions: z.array(z.string()).optional(),
});

export const auditLogsParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  action: z.string().optional(),
  entity: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;
export type AuditLogsParamsData = z.infer<typeof auditLogsParamsSchema>;
