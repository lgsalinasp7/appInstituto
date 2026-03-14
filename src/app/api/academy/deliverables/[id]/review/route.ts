import { withAcademyAuth } from "@/lib/api-auth";
import { POST_reviewDeliverable } from "@/modules/academy/api/handlers";
import { INSTRUCTOR_ROLES } from "@/modules/academy/config/roles";

export const POST = withAcademyAuth(
  INSTRUCTOR_ROLES,
  (req, user, tenantId, context) =>
    POST_reviewDeliverable(req, user, tenantId, context)
);
