/**
 * Masterclass Types
 * Tipos para el sistema de masterclasses y landing pages
 */

export interface MasterclassPublic {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
  duration: number;
  slug: string;
}

export interface MasterclassFull extends MasterclassPublic {
  meetingUrl: string | null;
  isActive: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadRegistration {
  name: string;
  phone: string;
  email: string;
  programId?: string;
  masterclassSlug?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;

  // Masterclass filtering fields
  studyStatus?: string;
  programmingLevel?: string;
  saasInterest?: string;
  investmentReady?: string;
}
