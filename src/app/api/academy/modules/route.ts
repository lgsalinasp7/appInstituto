import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCourseService } from "@/modules/academia";
import { createModuleSchema } from "@/modules/academia/schemas";

export const POST = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request) => {
    const body = await request.json();
    const parsed = createModuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    const module = await AcademyCourseService.createModule(parsed.data);
    return NextResponse.json({ success: true, data: module });
  }
);
