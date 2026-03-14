import { withAcademyAuth } from "@/lib/api-auth";
import { POST_quizAnswer } from "@/modules/academy/api/handlers";
import { ACADEMY_ROLES } from "@/modules/academy/config/roles";

export const POST = withAcademyAuth(
  ACADEMY_ROLES,
  (req, user, tenantId, context) =>
    POST_quizAnswer(req, user, tenantId, context)
);
