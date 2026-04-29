import { withAcademyAuth } from "@/lib/api-auth";
import { POST_videoProgress } from "@/modules/academia/api/handlers";
import { ACADEMY_ROLES } from "@/modules/academia/config/academy-platform-roles.config";

export const POST = withAcademyAuth(
  ACADEMY_ROLES,
  (req, user, tenantId, context) =>
    POST_videoProgress(req, user, tenantId, context)
);
