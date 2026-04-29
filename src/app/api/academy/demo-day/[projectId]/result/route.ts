import { withAcademyAuth } from "@/lib/api-auth";
import { POST_demoDayResult } from "@/modules/academia/api/handlers";
import { INSTRUCTOR_ROLES } from "@/modules/academia/config/academy-platform-roles.config";

export const POST = withAcademyAuth(
  INSTRUCTOR_ROLES,
  (req, user, tenantId, context) =>
    POST_demoDayResult(req, user, tenantId, context)
);
