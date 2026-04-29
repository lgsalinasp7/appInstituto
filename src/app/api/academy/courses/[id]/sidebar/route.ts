import { withAcademyAuth } from "@/lib/api-auth";
import { GET_courseSidebar } from "@/modules/academia/api/handlers";
import { ACADEMY_ROLES } from "@/modules/academia/config/academy-platform-roles.config";

export const GET = withAcademyAuth(
  ACADEMY_ROLES,
  (req, user, tenantId, context) =>
    GET_courseSidebar(req, user, tenantId, context)
);
