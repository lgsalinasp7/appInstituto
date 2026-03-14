import { withAcademyAuth } from "@/lib/api-auth";
import { GET_cohortAnalytics } from "@/modules/academy/api/handlers";
import { INSTRUCTOR_ROLES } from "@/modules/academy/config/roles";

export const GET = withAcademyAuth(
  INSTRUCTOR_ROLES,
  (req, user, tenantId, context) =>
    GET_cohortAnalytics(req, user, tenantId, context)
);
