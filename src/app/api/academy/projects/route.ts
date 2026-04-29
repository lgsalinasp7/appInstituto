import { withAcademyAuth } from "@/lib/api-auth";
import { POST_upsertProject } from "@/modules/academia/api/handlers";
import { ACADEMY_ROLES } from "@/modules/academia/config/academy-platform-roles.config";

export const POST = withAcademyAuth(
  ACADEMY_ROLES,
  (req, user, tenantId) => POST_upsertProject(req, user, tenantId)
);
