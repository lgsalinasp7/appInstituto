import { z } from 'zod'

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  phone: z.string().min(7, 'Teléfono requerido'),
  email: z.string().email('Email inválido').optional().nullable(),
  source: z.enum(['LANDING_PAGE', 'WHATSAPP', 'REFERIDO', 'REDES_SOCIALES', 'LLAMADA', 'EMAIL', 'OTRO']).default('OTRO'),
  sourceDetail: z.string().optional().nullable(),
  programId: z.string().optional().nullable(),
  advisorId: z.string().optional(),
  city: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  utmContent: z.string().optional().nullable(),
})

export const updateLeadSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  email: z.string().email().optional().nullable(),
  temperature: z.enum(['FRIO', 'TIBIO', 'CALIENTE']).optional(),
  observations: z.string().optional().nullable(),
  programId: z.string().optional().nullable(),
  advisorId: z.string().optional(),
  city: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  nextFollowUpAt: z.string().datetime().optional().nullable(),
  lostReason: z.string().optional().nullable(),
})

export const moveStageSchema = z.object({
  newStage: z.enum([
    'NUEVO', 'CONTACTADO', 'INTERESADO',
    'MASTERCLASS_REGISTRADO', 'MASTERCLASS_ASISTIO',
    'APLICACION', 'LLAMADA_AGENDADA', 'LLAMADA_REALIZADA',
    'NEGOCIACION', 'MATRICULADO', 'PERDIDO'
  ]),
  reason: z.string().optional(),
})

export const pipelineFiltersSchema = z.object({
  stage: z.enum([
    'NUEVO', 'CONTACTADO', 'INTERESADO',
    'MASTERCLASS_REGISTRADO', 'MASTERCLASS_ASISTIO',
    'APLICACION', 'LLAMADA_AGENDADA', 'LLAMADA_REALIZADA',
    'NEGOCIACION', 'MATRICULADO', 'PERDIDO'
  ]).optional(),
  temperature: z.enum(['FRIO', 'TIBIO', 'CALIENTE']).optional(),
  source: z.enum(['LANDING_PAGE', 'WHATSAPP', 'REFERIDO', 'REDES_SOCIALES', 'LLAMADA', 'EMAIL', 'OTRO']).optional(),
  advisorId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

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
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type MoveStageInput = z.infer<typeof moveStageSchema>
export type PipelineFiltersInput = z.infer<typeof pipelineFiltersSchema>
export type PublicLeadCaptureInput = z.infer<typeof publicLeadCaptureSchema>
