import { enumSchemas } from './enums';
import { commonSchemas } from './common';
import { tenantSchemas } from './tenant';
import { userSchemas } from './user';
import { studentSchemas } from './student';
import { paymentSchemas } from './payment';
import { prospectSchemas } from './prospect';
import { programSchemas } from './program';
import { invitationSchemas } from './invitation';
import { contentSchemas } from './content';
import { configSchemas } from './config';

export const allSchemas = {
  ...enumSchemas,
  ...commonSchemas,
  ...tenantSchemas,
  ...userSchemas,
  ...studentSchemas,
  ...paymentSchemas,
  ...prospectSchemas,
  ...programSchemas,
  ...invitationSchemas,
  ...contentSchemas,
  ...configSchemas,
};
