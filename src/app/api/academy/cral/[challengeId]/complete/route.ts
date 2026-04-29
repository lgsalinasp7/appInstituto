import { withAcademyAuth } from "@/lib/api-auth";
import { POST_cralComplete } from "@/modules/academia/api/handlers";
import { ACADEMY_ROLES } from "@/modules/academia/config/academy-platform-roles.config";

export const POST = withAcademyAuth(
  ACADEMY_ROLES,
  (req, user, tenantId, context) =>
    POST_cralComplete(req, user, tenantId, context)
);
