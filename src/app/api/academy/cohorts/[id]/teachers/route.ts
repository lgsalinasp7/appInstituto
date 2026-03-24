import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { AcademyCohortLifecycleService } from "@/modules/academia/services/academy-cohort-lifecycle.service";
import { z } from "zod";

export const GET = withAcademyAuth(
  ["ACADEMY_ADMIN", "ACADEMY_TEACHER"],
  async (_request, user, tenantId, context) => {
    const params = await context?.params;
    const cohortId = params?.id;
    if (!cohortId) {
      return NextResponse.json(
        { success: false, error: "ID requerido" },
        { status: 400 }
      );
    }
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId },
    });
    if (!cohort) {
      return NextResponse.json(
        { success: false, error: "Cohorte no encontrado" },
        { status: 404 }
      );
    }

    const userRow = await prisma.user.findUnique({
      where: { id: user.id },
      select: { platformRole: true },
    });
    if (userRow?.platformRole === "ACADEMY_TEACHER") {
      const ok = await prisma.academyCohortTeacherAssignment.findFirst({
        where: { cohortId, teacherId: user.id },
      });
      if (!ok) {
        return NextResponse.json(
          { success: false, error: "No tienes acceso a este cohorte" },
          { status: 403 }
        );
      }
    }

    const assignments = await prisma.academyCohortTeacherAssignment.findMany({
      where: { cohortId },
      include: {
        teacher: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });
    return NextResponse.json({
      success: true,
      data: assignments.map((a) => a.teacher),
    });
  }
);

const postSchema = z
  .object({
    teacherUserId: z.string().min(1).optional(),
    teacherEmail: z.string().email().optional(),
  })
  .refine((d) => Boolean(d.teacherUserId?.trim()) || Boolean(d.teacherEmail?.trim()), {
    message: "Indica el email del profesor o su ID de usuario",
  });

export const POST = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, user, tenantId, context) => {
    const params = await context?.params;
    const cohortId = params?.id;
    if (!cohortId) {
      return NextResponse.json(
        { success: false, error: "ID requerido" },
        { status: 400 }
      );
    }
    const json = await request.json();
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }

    let teacherUserId = parsed.data.teacherUserId?.trim();
    if (!teacherUserId && parsed.data.teacherEmail?.trim()) {
      const email = parsed.data.teacherEmail.trim();
      const teacher = await prisma.user.findFirst({
        where: {
          tenantId,
          platformRole: "ACADEMY_TEACHER",
          email: { equals: email, mode: "insensitive" },
        },
        select: { id: true },
      });
      if (!teacher) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No se encontró un profesor con ese email en este instituto (debe tener rol ACADEMY_TEACHER).",
          },
          { status: 404 }
        );
      }
      teacherUserId = teacher.id;
    }

    if (!teacherUserId) {
      return NextResponse.json(
        { success: false, error: "No se pudo determinar el profesor" },
        { status: 400 }
      );
    }

    try {
      await AcademyCohortLifecycleService.assignTeacher(
        { tenantId, actorUserId: user.id },
        cohortId,
        teacherUserId
      );
      return NextResponse.json({ success: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al asignar profesor";
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }
  }
);

const deleteSchema = z.object({
  teacherUserId: z.string().min(1),
});

export const DELETE = withAcademyAuth(
  ["ACADEMY_ADMIN"],
  async (request, user, tenantId, context) => {
    const params = await context?.params;
    const cohortId = params?.id;
    if (!cohortId) {
      return NextResponse.json(
        { success: false, error: "ID requerido" },
        { status: 400 }
      );
    }
    const { searchParams } = new URL(request.url);
    const teacherUserId = searchParams.get("teacherUserId");
    const parsed = deleteSchema.safeParse({ teacherUserId });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "teacherUserId requerido" },
        { status: 400 }
      );
    }
    await AcademyCohortLifecycleService.unassignTeacher(
      { tenantId, actorUserId: user.id },
      cohortId,
      parsed.data.teacherUserId
    );
    return NextResponse.json({ success: true });
  }
);
