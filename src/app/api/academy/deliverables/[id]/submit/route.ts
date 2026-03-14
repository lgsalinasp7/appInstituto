import { withAcademyAuth } from "@/lib/api-auth";
import { POST_submitDeliverable } from "@/modules/academy/api/handlers";
import { ACADEMY_ROLES } from "@/modules/academy/config/roles";

export const POST = withAcademyAuth(
  ACADEMY_ROLES,
  (req, user, tenantId, context) =>
    POST_submitDeliverable(req, user, tenantId, context)
);
