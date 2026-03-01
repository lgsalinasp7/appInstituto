import type { ProductTemplate } from '@prisma/client';

export interface CreateProductTemplateData {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string;
  domain?: string | null;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  darkMode?: boolean;
  footerText?: string | null;
  adminName?: string | null;
  adminEmail?: string | null;
  plan?: string;
  allowPublicRegistration?: boolean;
}

export interface UpdateProductTemplateData extends Partial<CreateProductTemplateData> {
  isActive?: boolean;
}

export interface DeployProductData {
  tenantName: string;
  tenantSlug: string;
  adminEmail: string;
  adminName?: string;
  adminPassword?: string;
  autoGeneratePassword?: boolean;
  domain?: string;
}

export interface DeployResult {
  tenantId: string;
  tenantSlug: string;
  adminEmail: string;
  generatedPassword?: string;
}

export type { ProductTemplate };
