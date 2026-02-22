import { NextRequest, NextResponse } from "next/server";
import { withPlatformAdmin } from "@/lib/api-auth";
import { PlatformRole } from "@prisma/client";
import { AiAgentService } from "@/modules/chat/services/ai-agent.service";

export const GET = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") as "daily" | "monthly") || "daily";
    const days = parseInt(searchParams.get("days") || "30");
    const tenantId = searchParams.get("tenantId");

    const trends = await AiAgentService.getTokenTrends(period, days, tenantId);

    return NextResponse.json({
      success: true,
      data: trends,
    });
  }
);
