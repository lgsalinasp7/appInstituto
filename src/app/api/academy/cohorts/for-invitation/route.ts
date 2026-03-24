import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * Cohortes activos del tenant para elegir al invitar estudiantes (admin).
 */
export const GET = withAcademyAuth(["ACADEMY_ADMIN"], async (_request, _user, tenantId) => {
  const cohorts = await prisma.academyCohort.findMany({
    where: { tenantId, status: "ACTIVE" },
    orderBy: [{ startDate: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      kind: true,
      courseId: true,
      course: { select: { title: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: cohorts.map((c) => ({
      id: c.id,
      name: c.name,
      kind: c.kind,
      courseId: c.courseId,
      courseTitle: c.course.title,
    })),
  });
});
