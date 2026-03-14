import { withAcademyAuth } from "@/lib/api-auth";
import { GET_courseSidebar } from "@/modules/academy/api/handlers";
import { ACADEMY_ROLES } from "@/modules/academy/config/roles";

export const GET = withAcademyAuth(
  ACADEMY_ROLES,
  (req, user, tenantId, context) =>
    GET_courseSidebar(req, user, tenantId, context)
);
