import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyLeaderboardService } from "@/modules/academia";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, user, tenantId) => {
    const data = await AcademyLeaderboardService.getLeaderboard(tenantId, user.id);
    return NextResponse.json({ success: true, data });
  }
);
