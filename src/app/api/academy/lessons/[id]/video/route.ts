import { withAcademyAuth } from "@/lib/api-auth";
import { POST_videoProgress } from "@/modules/academy/api/handlers";
import { ACADEMY_ROLES } from "@/modules/academy/config/roles";

export const POST = withAcademyAuth(
  ACADEMY_ROLES,
  (req, user, tenantId, context) =>
    POST_videoProgress(req, user, tenantId, context)
);
