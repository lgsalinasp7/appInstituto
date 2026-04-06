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

// nullish() = .nullable().optional() → accepts string | null | undefined
export const publicLeadCaptureSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  phone: z.string().min(7, 'Teléfono requerido'),
  email: z.email('Email inválido'),
  city: z.string().trim().min(2, 'Ciudad inválida').nullish(),
  programId: z.string().nullish(),
  masterclassSlug: z.string().nullish(),
  utmSource: z.string().nullish(),
  utmMedium: z.string().nullish(),
  utmCampaign: z.string().nullish(),
  utmContent: z.string().nullish(),
  fbclid: z.string().nullish(),
  gclid: z.string().nullish(),
  ttclid: z.string().nullish(),

  // Filtering fields
  studyStatus: z.string().nullish(),
  programmingLevel: z.string().nullish(),
  saasInterest: z.string().nullish(),
  investmentReady: z.string().nullish(),
});
