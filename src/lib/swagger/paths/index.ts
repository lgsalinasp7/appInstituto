import { authPaths } from './auth';
import { adminTenantsPaths } from './admin-tenants';
import { studentsPaths } from './students';
import { prospectsPaths } from './prospects';
import { programsPaths } from './programs';
import { usersPaths } from './users';
import { rolesPaths } from './roles';
import { paymentsPaths } from './payments';
import { commitmentsPaths } from './commitments';
import { carteraPaths } from './cartera';
import { receiptsPaths } from './receipts';
import { reportsPaths } from './reports';
import { contentPaths } from './content';
import { configPaths } from './config';
import { invitationsPaths } from './invitations';
import { whatsappPaths } from './whatsapp';
import { tenantBrandingPaths } from './tenant-branding';
import { cronPaths } from './cron';

export const allPaths = {
  ...authPaths,
  ...adminTenantsPaths,
  ...studentsPaths,
  ...prospectsPaths,
  ...programsPaths,
  ...usersPaths,
  ...rolesPaths,
  ...paymentsPaths,
  ...commitmentsPaths,
  ...carteraPaths,
  ...receiptsPaths,
  ...reportsPaths,
  ...contentPaths,
  ...configPaths,
  ...invitationsPaths,
  ...whatsappPaths,
  ...tenantBrandingPaths,
  ...cronPaths,
};
