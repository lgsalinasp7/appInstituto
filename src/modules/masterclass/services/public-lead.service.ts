import type { LeadRegistration } from '../types';

export class PublicLeadService {
  private static readonly DISABLED_ERROR =
    'La captura de leads de tenant está deshabilitada por política de separación KaledSoft vs tenants.';

  static async captureLead(_data: LeadRegistration, _tenantId: string): Promise<{ prospectId: string }> {
    throw new Error(PublicLeadService.DISABLED_ERROR);
  }

  static async markMasterclassAttended(_prospectId: string, _tenantId: string): Promise<void> {
    throw new Error(PublicLeadService.DISABLED_ERROR);
  }
}
