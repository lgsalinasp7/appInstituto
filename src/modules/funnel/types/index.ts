import type { FunnelStage, LeadTemperature, LeadSource, InteractionType, AgentType } from '@prisma/client'

export interface PipelineView {
  stages: PipelineStage[]
  totalLeads: number
  totalValue: number // Valor potencial si todos se matriculan
}

export interface PipelineStage {
  stage: FunnelStage
  label: string
  count: number
  leads: PipelineLead[]
}

export interface PipelineLead {
  id: string
  name: string
  phone: string
  email: string | null
  funnelStage: FunnelStage
  temperature: LeadTemperature
  score: number
  source: LeadSource
  programName: string | null
  advisorName: string | null
  lastContactAt: Date | null
  nextFollowUpAt: Date | null
  createdAt: Date
}

export interface LeadTimeline {
  prospectId: string
  interactions: TimelineItem[]
}

export interface TimelineItem {
  id: string
  type: InteractionType
  content: string
  metadata: Record<string, unknown> | null
  advisorName: string | null
  agentType: AgentType | null
  createdAt: Date
}

export interface FunnelMetrics {
  period: string
  stageConversions: StageConversion[]
  overallConversionRate: number // NUEVO -> MATRICULADO
  averageDaysToClose: number
  costPerLead: number
  costPerSale: number
}

export interface StageConversion {
  fromStage: FunnelStage
  toStage: FunnelStage
  count: number
  rate: number // porcentaje
  averageDays: number
}

export interface LeadScoreFactors {
  emailProvided: boolean      // +10
  phoneVerified: boolean      // +10
  programSelected: boolean    // +15
  masterclassRegistered: boolean // +20
  masterclassAttended: boolean   // +25
  applicationSubmitted: boolean  // +30
  respondedFollowUp: boolean    // +15
  recentActivity: boolean       // +10 (ultimas 48h)
  interactionCount: number      // +5 por cada
}

// Labels en espanol para las etapas del embudo
export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  NUEVO: 'Nuevo',
  CONTACTADO: 'Contactado',
  INTERESADO: 'Interesado',
  MASTERCLASS_REGISTRADO: 'Masterclass Registrado',
  MASTERCLASS_ASISTIO: 'Masterclass Asistió',
  APLICACION: 'Aplicación',
  LLAMADA_AGENDADA: 'Llamada Agendada',
  LLAMADA_REALIZADA: 'Llamada Realizada',
  NEGOCIACION: 'Negociación',
  MATRICULADO: 'Matriculado',
  PERDIDO: 'Perdido',
}

export const TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  FRIO: 'Frío',
  TIBIO: 'Tibio',
  CALIENTE: 'Caliente',
}

export const SOURCE_LABELS: Record<LeadSource, string> = {
  LANDING_PAGE: 'Landing Page',
  WHATSAPP: 'WhatsApp',
  REFERIDO: 'Referido',
  REDES_SOCIALES: 'Redes Sociales',
  LLAMADA: 'Llamada',
  EMAIL: 'Email',
  OTRO: 'Otro',
}
