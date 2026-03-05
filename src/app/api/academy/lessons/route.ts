import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCourseService } from "@/modules/academia";
import { createLessonSchema } from "@/modules/academia/schemas";

export const POST = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request) => {
    const body = await request.json();
    const parsed = createLessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    const lesson = await AcademyCourseService.createLesson(parsed.data);
    return NextResponse.json({ success: true, data: lesson });
  }
);
