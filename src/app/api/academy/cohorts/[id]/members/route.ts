import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { AcademyCohortService } from "@/modules/academia";

export const GET = withAcademyAuth(
  ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, _user, tenantId, context) => {
    const params = await context?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }
    const members = await AcademyCohortService.listMembers(id, tenantId);
    if (members === null) {
      return NextResponse.json({ success: false, error: "Cohorte no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: members });
  }
);
