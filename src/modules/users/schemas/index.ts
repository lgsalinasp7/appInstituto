/**
 * Users Module Schemas
 * Zod validation schemas for user management
 */

import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  image: z.string().url("URL de imagen inválida").optional(),
});

export const updateProfileSchema = z.object({
  bio: z.string().max(500, "La biografía no puede exceder 500 caracteres").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export const usersListParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  roleId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type UsersListParamsData = z.infer<typeof usersListParamsSchema>;
