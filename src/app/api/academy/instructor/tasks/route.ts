import { NextRequest, NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { INSTRUCTOR_ROLES } from "@/modules/academy/config/roles";
import { prisma } from "@/lib/prisma";

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

async function GET_handler(
  _req: NextRequest,
  _user: { id: string },
  tenantId: string
) {
  const tasks = await prisma.kaledInstructorTask.findMany({
    where: { tenantId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  const withUser = await Promise.all(
    tasks.map(async (t) => {
      const user = await prisma.user.findUnique({
        where: { id: t.studentId },
        select: { name: true, email: true },
      });
      return {
        ...t,
        studentName: user?.name ?? user?.email ?? "Estudiante",
      };
    })
  );

  withUser.sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 1) -
      (PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 1)
  );

  return NextResponse.json(withUser);
}

async function PATCH_handler(
  req: NextRequest,
  user: { id: string },
  tenantId: string
) {
  const body = await req.json().catch(() => ({}));
  const { taskId, status } = body as { taskId?: string; status?: string };

  if (!taskId || !status) {
    return NextResponse.json(
      { error: "taskId y status (REVIEWED | RESOLVED) requeridos" },
      { status: 400 }
    );
  }

  const task = await prisma.kaledInstructorTask.findFirst({
    where: { id: taskId, tenantId },
  });

  if (!task) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  const updateData: { status: string; reviewedAt?: Date; resolvedAt?: Date } = {
    status,
  };
  if (status === "REVIEWED") updateData.reviewedAt = new Date();
  if (status === "RESOLVED") updateData.resolvedAt = new Date();

  await prisma.kaledInstructorTask.update({
    where: { id: taskId },
    data: updateData,
  });

  return NextResponse.json({ ok: true });
}

export const GET = withAcademyAuth(INSTRUCTOR_ROLES, GET_handler);
export const PATCH = withAcademyAuth(INSTRUCTOR_ROLES, PATCH_handler);
