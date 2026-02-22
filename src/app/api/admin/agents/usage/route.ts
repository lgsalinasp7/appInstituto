import { NextRequest, NextResponse } from "next/server";
import { withPlatformAdmin } from "@/lib/api-auth";
import { PlatformRole } from "@prisma/client";
import { AiAgentService } from "@/modules/chat/services/ai-agent.service";

export const GET = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    const params = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      tenantId: searchParams.get("tenantId") || undefined,
      modelId: searchParams.get("modelId") || undefined,
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
    };

    const result = await AiAgentService.getUsageLogs(params);

    return NextResponse.json({
      success: true,
      data: result,
    });
  }
);
