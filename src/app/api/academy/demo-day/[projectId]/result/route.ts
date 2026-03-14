import { withAcademyAuth } from "@/lib/api-auth";
import { POST_demoDayResult } from "@/modules/academy/api/handlers";
import { INSTRUCTOR_ROLES } from "@/modules/academy/config/roles";

export const POST = withAcademyAuth(
  INSTRUCTOR_ROLES,
  (req, user, tenantId, context) =>
    POST_demoDayResult(req, user, tenantId, context)
);
