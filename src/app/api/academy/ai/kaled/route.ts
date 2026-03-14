import { withAcademyAuth } from "@/lib/api-auth";
import { POST_kaledChat } from "@/modules/academy/api/handlers";
import { ACADEMY_ROLES } from "@/modules/academy/config/roles";

export const POST = withAcademyAuth(
  ACADEMY_ROLES,
  (req, user, tenantId) => POST_kaledChat(req, user, tenantId)
);
