import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCourseService } from "@/modules/academia";

export const GET = withAcademyAuth(["ACADEMY_ADMIN"], async (_request, _user, tenantId) => {
  const data = await AcademyCourseService.listInteractiveAnimations(tenantId);
  return NextResponse.json({ success: true, data });
});
