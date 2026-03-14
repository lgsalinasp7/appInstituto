import { withAcademyAuth } from "@/lib/api-auth";
import { GET_studentRanking } from "@/modules/academy/api/handlers";
import { ACADEMY_ROLES } from "@/modules/academy/config/roles";

export const GET = withAcademyAuth(
  ACADEMY_ROLES,
  (req, user, tenantId, context) =>
    GET_studentRanking(req, user, tenantId, context)
);
