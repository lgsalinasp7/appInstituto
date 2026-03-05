import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyProgressService } from "@/modules/academia";
import { updateVideoProgressSchema } from "@/modules/academia/schemas";

export const PATCH = withAcademyAuth(
  ["ACADEMY_STUDENT"],
  async (request, user, _tenantId) => {
    const body = await request.json();
    const parsed = updateVideoProgressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    const progress = await AcademyProgressService.updateVideoProgress(
      user.id,
      parsed.data.lessonId,
      parsed.data.videoProgress,
      parsed.data.timeSpentSec
    );
    return NextResponse.json({ success: true, data: progress });
  }
);
