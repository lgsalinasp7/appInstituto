import type {
  KaledLead,
  KaledLeadInteraction,
  KaledCampaign,
  KaledEmailTemplate,
  KaledEmailSequence,
  KaledEmailSequenceStep,
  KaledEmailLog,
  KaledInteractionType,
  KaledCampaignStatus,
  KaledTriggerType,
  User,
} from '@prisma/client';

// ============================================
// Lead Types
// ============================================

export interface LeadWithRelations extends KaledLead {
  campaign?: KaledCampaign | null;
  interactions?: InteractionWithUser[];
  emailLogs?: EmailLogWithTemplate[];
  _count?: {
    interactions: number;
    emailLogs: number;
  };
}

export interface LeadMetrics {
  id: string;
  name: string;
  email: string;
  status: string;
  daysActive: number;
  totalInteractions: number;
  emailsSent: number;
  interactionStats: Record<KaledInteractionType, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadSearchParams {
  search?: string;
  status?: string;
  campaignId?: string;
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}

export interface LeadSearchResult {
  leads: LeadWithRelations[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================
// Interaction Types
// ============================================

export interface InteractionWithUser extends KaledLeadInteraction {
  user?: Pick<User, 'id' | 'name' | 'email' | 'image'> | null;
}

export interface CreateInteractionData {
  type: KaledInteractionType;
  content: string;
  metadata?: Record<string, any>;
  kaledLeadId: string;
  userId?: string;
}

export interface InteractionStats {
  [KaledInteractionType.NOTA]: number;
  [KaledInteractionType.CORREO]: number;
  [KaledInteractionType.WHATSAPP]: number;
  [KaledInteractionType.LLAMADA]: number;
  [KaledInteractionType.REUNION]: number;
  [KaledInteractionType.CAMBIO_ESTADO]: number;
  [KaledInteractionType.TAREA]: number;
}

// ============================================
// Campaign Types
// ============================================

export interface CampaignWithRelations extends KaledCampaign {
  templates?: KaledEmailTemplate[];
  sequences?: KaledEmailSequence[];
  leads?: KaledLead[];
  _count?: {
    leads: number;
    templates: number;
    sequences: number;
  };
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  timeline?: CampaignTimeline;
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {
  status?: KaledCampaignStatus;
}

export interface CampaignTimeline {
  phases: CampaignPhase[];
}

export interface CampaignPhase {
  name: string;
  durationDays: number;
  description?: string;
  goals?: string[];
}

export interface CampaignMetrics {
  id: string;
  name: string;
  status: KaledCampaignStatus;
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  averageTimeToConversion: number; // days
  emailsSent: number;
  emailsOpened: number;
  emailOpenRate: number;
  startDate?: Date;
  endDate?: Date;
}

// ============================================
// Email Template Types
// ============================================

export interface TemplateWithRelations extends KaledEmailTemplate {
  campaign?: KaledCampaign | null;
  emailLogs?: KaledEmailLog[];
  sequenceSteps?: KaledEmailSequenceStep[];
}

export interface CreateTemplateData {
  name: string;
  subject: string;
  htmlContent: string;
  variables?: string[];
  category?: string;
  campaignId?: string;
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {
  isActive?: boolean;
}

export interface RenderTemplateData {
  templateId: string;
  variables: Record<string, string>;
}

export interface RenderedTemplate {
  subject: string;
  htmlContent: string;
}

// ============================================
// Email Sequence Types
// ============================================

export interface SequenceWithRelations extends KaledEmailSequence {
  campaign?: KaledCampaign | null;
  steps?: SequenceStepWithTemplate[];
}

export interface SequenceStepWithTemplate extends KaledEmailSequenceStep {
  template?: KaledEmailTemplate;
}

export interface CreateSequenceData {
  name: string;
  triggerType: KaledTriggerType;
  triggerConfig: TriggerConfig;
  campaignId?: string;
  steps?: CreateSequenceStepData[];
}

export interface CreateSequenceStepData {
  templateId: string;
  orderIndex: number;
  delayHours: number;
  conditions?: Record<string, any>;
}

export interface TriggerConfig {
  // Para TIME_BASED
  delayHours?: number;

  // Para ACTION_BASED
  action?: 'MASTERCLASS_REGISTERED' | 'STATUS_CHANGE' | 'EMAIL_OPENED';

  // Para STAGE_BASED
  status?: string;
  fromStatus?: string;
  toStatus?: string;
}

// ============================================
// Email Log Types
// ============================================

export interface EmailLogWithTemplate extends KaledEmailLog {
  template?: KaledEmailTemplate | null;
  kaledLead?: KaledLead | null;
}

export interface CreateEmailLogData {
  to: string;
  subject: string;
  templateId?: string;
  kaledLeadId?: string;
  requiresApproval?: boolean;
  metadata?: Record<string, any>;
}

export interface SendEmailData {
  leadId: string;
  templateId: string;
  variables?: Record<string, string>;
  isAutomatic?: boolean;
  requiresApproval?: boolean;
}

export interface ApproveEmailData {
  emailLogId: string;
  userId: string;
}

// ============================================
// Analytics Types
// ============================================

export interface OverviewMetrics {
  totalLeads: number;
  newLeadsThisMonth: number;
  conversionRate: number;
  averageTimeToConversion: number; // days
  averageResponseTime: number; // hours
  activeLeads: number;
  convertedLeads: number;
  lostLeads: number;
  emailsSentThisMonth: number;
  emailOpenRate: number;
}

export interface ConversionMetrics {
  totalLeads: number;
  converted: number;
  conversionRate: number;
  averageTimeToConversion: number; // days
  medianTimeToConversion: number; // days
  minTimeToConversion: number; // days
  maxTimeToConversion: number; // days
  conversionByStage: Record<string, number>;
  conversionByCampaign: Array<{
    campaignId: string;
    campaignName: string;
    totalLeads: number;
    converted: number;
    rate: number;
  }>;
}

export interface ActivityMetrics {
  userId?: string;
  userName?: string;
  totalInteractions: number;
  interactionsByType: Record<KaledInteractionType, number>;
  leadsContacted: number;
  leadsConverted: number;
  averageResponseTime: number; // hours
  lastActivity?: Date;
}

export interface SalesCycleMetrics {
  averageCycleDays: number;
  medianCycleDays: number;
  byStage: Array<{
    stage: string;
    averageDays: number;
    leadsCount: number;
  }>;
}

export interface FunnelValidationMetrics {
  leadsThisWeek: number;
  contactRate24h: number;
  contactToDemoRate: number;
  demoToClosedRate: number;
  whatsappResponse48hRate: number;
  averageHoursToFirstContact: number;
  appointmentsBookedThisWeek: number;
  conversionsThisWeek: number;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardData {
  overview: OverviewMetrics;
  recentLeads: LeadWithRelations[];
  pendingApprovals: EmailLogWithTemplate[];
  upcomingTasks: InteractionWithUser[];
  topCampaigns: Array<{
    campaign: KaledCampaign;
    metrics: CampaignMetrics;
  }>;
}

// ============================================
// Form Types
// ============================================

export interface LeadFormData {
  name: string;
  email: string;
  phone?: string;
  status?: string;
  observations?: string;
  filteringData?: Record<string, any>;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  campaignId?: string;
}

export interface NoteFormData {
  content: string;
}

export interface CallFormData {
  content: string;
  duration?: number;
}

export interface MeetingFormData {
  content: string;
  date: Date;
  duration?: number;
}

export interface WhatsAppFormData {
  content: string;
  metadata?: Record<string, any>;
}

export interface TaskFormData {
  content: string;
  dueDate: Date;
}
