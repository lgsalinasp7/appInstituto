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
  city?: string | null;
  programId?: string | null;
  masterclassSlug?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  fbclid?: string | null;
  gclid?: string | null;
  ttclid?: string | null;

  // Masterclass filtering fields
  studyStatus?: string | null;
  programmingLevel?: string | null;
  saasInterest?: string | null;
  investmentReady?: string | null;
}
