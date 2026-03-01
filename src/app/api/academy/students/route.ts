import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const GET = withAcademyAuth(
  ["ACADEMY_TEACHER", "ACADEMY_ADMIN"],
  async (_request, _user, tenantId) => {
    const users = await prisma.user.findMany({
      where: {
        tenantId,
        platformRole: { in: ["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"] },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        platformRole: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ success: true, data: users });
  }
);
