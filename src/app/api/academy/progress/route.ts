import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyProgressService } from "@/modules/academia";
import { completeLessonSchema } from "@/modules/academia/schemas";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT"],
  async (_request, user, _tenantId) => {
    const summaries = await AcademyProgressService.getCourseProgressSummaries(user.id);
    return NextResponse.json({ success: true, data: summaries });
  }
);

export const PATCH = withAcademyAuth(
  ["ACADEMY_STUDENT"],
  async (request, user, _tenantId) => {
    const body = await request.json();
    const parsed = completeLessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    const progress = await AcademyProgressService.completeLesson(user.id, parsed.data.lessonId);
    return NextResponse.json({ success: true, data: progress });
  }
);
