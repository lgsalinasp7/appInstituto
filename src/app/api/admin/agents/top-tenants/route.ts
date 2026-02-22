import { NextRequest, NextResponse } from "next/server";
import { withPlatformAdmin } from "@/lib/api-auth";
import { PlatformRole } from "@prisma/client";
import { AiAgentService } from "@/modules/chat/services/ai-agent.service";

export const GET = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const topTenants = await AiAgentService.getTopTenants(limit);

    return NextResponse.json({
      success: true,
      data: topTenants,
    });
  }
);
