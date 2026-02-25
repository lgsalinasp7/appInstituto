/**
 * Masterclass Schemas
 * Validaciones Zod para masterclasses y captura de leads
 */

import { z } from 'zod';

export const createMasterclassSchema = z.object({
  title: z.string().min(5, 'Título mínimo 5 caracteres'),
  description: z.string().optional().nullable(),
  scheduledAt: z.coerce.date(),
  duration: z.number().int().positive().default(60),
  meetingUrl: z.string().url('URL inválida').optional().nullable(),
  slug: z.string().min(3, 'Slug mínimo 3 caracteres').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  isActive: z.boolean().default(true),
});

export const updateMasterclassSchema = createMasterclassSchema.partial();

export const publicLeadCaptureSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  phone: z.string().min(7, 'Teléfono requerido'),
  email: z.string().email('Email inválido'),
  programId: z.string().optional(),
  masterclassSlug: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),

  // Filtering fields
  studyStatus: z.string().optional(),
  programmingLevel: z.string().optional(),
  saasInterest: z.string().optional(),
  investmentReady: z.string().optional(),
});
