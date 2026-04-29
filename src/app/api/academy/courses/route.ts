import { withAcademyAuth } from "@/lib/api-auth";
import { GET_courses } from "@/modules/academia/api/handlers";
import { ACADEMY_ROLES } from "@/modules/academia/config/academy-platform-roles.config";

export const GET = withAcademyAuth(
  ACADEMY_ROLES,
  (req, user, tenantId) => GET_courses(req, user, tenantId)
);
