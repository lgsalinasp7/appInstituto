import { withAcademyAuth } from "@/lib/api-auth";
import { GET_pendingDeliverables } from "@/modules/academia/api/handlers";
import { INSTRUCTOR_ROLES } from "@/modules/academia/config/academy-platform-roles.config";

export const GET = withAcademyAuth(
  INSTRUCTOR_ROLES,
  (req, user, tenantId, context) =>
    GET_pendingDeliverables(req, user, tenantId, context)
);
