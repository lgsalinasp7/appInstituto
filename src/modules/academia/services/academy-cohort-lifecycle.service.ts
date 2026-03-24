/**
 * Operaciones admin sobre cohortes: mover/unir estudiantes, borrado seguro, auditoría y notificaciones.
 */
import { prisma } from "@/lib/prisma";
import { sendTemplateEmail } from "@/lib/email";
import type { AcademyCohortAdminAuditAction, Prisma } from "@prisma/client";
export type CohortLifecycleContext = {
  tenantId: string;
  actorUserId: string;
};

async function writeAudit(
  ctx: CohortLifecycleContext,
  action: AcademyCohortAdminAuditAction,
  payload: Prisma.InputJsonValue
) {
  await prisma.academyCohortAdminAudit.create({
    data: {
      tenantId: ctx.tenantId,
      actorUserId: ctx.actorUserId,
      action,
      payload,
    },
  });
}

/** Auditoría desde rutas API (crear/actualizar cohorte). */
export async function auditCohortAdminAction(
  ctx: CohortLifecycleContext,
  action: AcademyCohortAdminAuditAction,
  payload: Prisma.InputJsonValue
) {
  await writeAudit(ctx, action, payload);
}

async function notifyCohortChange(params: {
  userId: string;
  tenantId: string;
  email: string | null;
  name: string | null;
  title: string;
  body: string;
  fromCohortName: string;
  toCohortName: string;
}) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: params.tenantId },
    select: { slug: true },
  });
  const tenantSlug = tenant?.slug ?? undefined;

  await prisma.academyInAppNotification.create({
    data: {
      userId: params.userId,
      tenantId: params.tenantId,
      type: "COHORT_CHANGED",
      title: params.title,
      body: params.body,
      metadata: {
        fromCohortName: params.fromCohortName,
        toCohortName: params.toCohortName,
      } as Prisma.InputJsonValue,
    },
  });

  if (params.email) {
    try {
      const tenantSlug = KALED_ACADEMY_CONFIG.tenantSlug;
      await sendTemplateEmail({
        to: params.email,
        subject: params.title,
        html: `<p>Hola ${params.name ?? ""},</p><p>${params.body}</p>`,
        tenantSlug,
      });
    } catch (e) {
      console.error("[cohort-lifecycle] email notify failed", e);
    }
  }
}

/** Actualiza artefactos ligados al cohorte cuando la matrícula cambia de cohorte (mismo curso). */
async function realignUserCohortArtifacts(
  tx: Prisma.TransactionClient,
  userId: string,
  fromCohortId: string,
  toCohortId: string
) {
  await tx.academyStudentSnapshot.updateMany({
    where: { userId, cohortId: fromCohortId },
    data: { cohortId: toCohortId },
  });

  const projects = await tx.academySaasProject.findMany({
    where: { userId, cohortId: fromCohortId },
    select: { id: true },
  });
  for (const p of projects) {
    await tx.academySaasProject.update({
      where: { id: p.id },
      data: { cohortId: toCohortId },
    });
    await tx.academyDemoDayResult.updateMany({
      where: { projectId: p.id },
      data: { cohortId: toCohortId },
    });
  }

  await tx.academyKaledSession.updateMany({
    where: { userId, cohortId: fromCohortId },
    data: { cohortId: toCohortId },
  });
}

async function adjustCohortCounts(
  tx: Prisma.TransactionClient,
  fromId: string | null,
  toId: string,
  delta: number
) {
  if (fromId && fromId !== toId) {
    await tx.academyCohort.update({
      where: { id: fromId },
      data: { currentStudents: { decrement: delta } },
    });
  }
  await tx.academyCohort.update({
    where: { id: toId },
    data: { currentStudents: { increment: delta } },
  });
}

export class AcademyCohortLifecycleService {
  /** Mueve matrículas al cohorte destino (mismo curso). Conserva progreso. */
  static async moveEnrollmentsToCohort(
    ctx: CohortLifecycleContext,
    params: {
      sourceCohortId: string;
      targetCohortId: string;
      enrollmentIds?: string[];
    }
  ) {
    const source = await prisma.academyCohort.findFirst({
      where: { id: params.sourceCohortId, tenantId: ctx.tenantId },
    });
    const target = await prisma.academyCohort.findFirst({
      where: { id: params.targetCohortId, tenantId: ctx.tenantId },
    });
    if (!source || !target) {
      throw new Error("Cohorte no encontrado");
    }
    if (source.courseId !== target.courseId) {
      throw new Error("Los cohortes deben pertenecer al mismo curso");
    }
    if (source.id === target.id) {
      throw new Error("El cohorte origen y destino no pueden ser el mismo");
    }

    const where: Prisma.AcademyEnrollmentWhereInput = {
      cohortId: source.id,
      ...(params.enrollmentIds?.length
        ? { id: { in: params.enrollmentIds } }
        : {}),
    };

    const enrollments = await prisma.academyEnrollment.findMany({
      where,
      include: { user: { select: { id: true, email: true, name: true } } },
    });
    if (enrollments.length === 0) {
      return { moved: 0 };
    }

    await prisma.$transaction(async (tx) => {
      for (const en of enrollments) {
        const fromId = en.cohortId;
        if (!fromId) continue;

        await tx.academyEnrollment.update({
          where: { id: en.id },
          data: {
            cohortId: target.id,
            ...(target.kind === "PROMOTIONAL"
              ? {
                  isTrial: true,
                  trialExpiresAt: target.endDate,
                }
              : en.isTrial && source.kind === "PROMOTIONAL"
                ? {
                    isTrial: false,
                    trialExpiresAt: null,
                    trialAllowedLessonId: null,
                  }
                : {}),
          },
        });

        await realignUserCohortArtifacts(tx, en.userId, fromId, target.id);
        await adjustCohortCounts(tx, fromId, target.id, 1);
      }
    });

    await writeAudit(ctx, "MOVE_STUDENT", {
      sourceCohortId: source.id,
      targetCohortId: target.id,
      enrollmentIds: enrollments.map((e) => e.id),
      count: enrollments.length,
    } as Prisma.InputJsonValue);

    for (const en of enrollments) {
      await notifyCohortChange({
        userId: en.userId,
        tenantId: ctx.tenantId,
        email: en.user.email,
        name: en.user.name,
        title: "Cambio de cohorte",
        body: `Has sido asignado al cohorte "${target.name}". El cohorte anterior era "${source.name}".`,
        fromCohortName: source.name,
        toCohortName: target.name,
      });
    }

    return { moved: enrollments.length };
  }

  /** Une cohorte origen en destino: mueve todas las matrículas y opcionalmente cancela el origen vacío. */
  static async mergeCohorts(
    ctx: CohortLifecycleContext,
    params: { sourceCohortId: string; targetCohortId: string }
  ) {
    const result = await this.moveEnrollmentsToCohort(ctx, {
      sourceCohortId: params.sourceCohortId,
      targetCohortId: params.targetCohortId,
    });

    const remaining = await prisma.academyEnrollment.count({
      where: { cohortId: params.sourceCohortId },
    });
    if (remaining > 0) {
      throw new Error("Quedan matrículas en el cohorte origen");
    }

    await prisma.academyCohort.update({
      where: { id: params.sourceCohortId, tenantId: ctx.tenantId },
      data: { status: "CANCELLED" },
    });

    await writeAudit(ctx, "MERGE_COHORTS", {
      sourceCohortId: params.sourceCohortId,
      targetCohortId: params.targetCohortId,
      movedCount: result.moved,
    } as Prisma.InputJsonValue);

    return result;
  }

  /** Elimina cohorte solo si no hay matrículas (DB Restrict también bloquea). */
  static async deleteCohortIfEmpty(
    ctx: CohortLifecycleContext,
    cohortId: string
  ) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId: ctx.tenantId },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!cohort) throw new Error("Cohorte no encontrado");
    if (cohort._count.enrollments > 0) {
      throw new Error(
        "No se puede eliminar: hay estudiantes en este cohorte. Reubícalos primero."
      );
    }

    await prisma.academyCohort.delete({
      where: { id: cohortId },
    });

    await writeAudit(ctx, "DELETE_COHORT", {
      cohortId,
      name: cohort.name,
    } as Prisma.InputJsonValue);

    return { ok: true };
  }

  static async assignTeacher(
    ctx: CohortLifecycleContext,
    cohortId: string,
    teacherUserId: string
  ) {
    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId: ctx.tenantId },
    });
    if (!cohort) throw new Error("Cohorte no encontrado");

    const teacher = await prisma.user.findFirst({
      where: {
        id: teacherUserId,
        tenantId: ctx.tenantId,
        platformRole: "ACADEMY_TEACHER",
      },
    });
    if (!teacher) throw new Error("Usuario no es profesor del tenant");

    await prisma.academyCohortTeacherAssignment.upsert({
      where: {
        cohortId_teacherId: { cohortId, teacherId: teacherUserId },
      },
      create: { cohortId, teacherId: teacherUserId },
      update: {},
    });

    await writeAudit(ctx, "ASSIGN_TEACHER", {
      cohortId,
      teacherUserId,
    } as Prisma.InputJsonValue);
  }

  static async unassignTeacher(
    ctx: CohortLifecycleContext,
    cohortId: string,
    teacherUserId: string
  ) {
    await prisma.academyCohortTeacherAssignment.deleteMany({
      where: { cohortId, teacherId: teacherUserId },
    });
    await writeAudit(ctx, "UNASSIGN_TEACHER", {
      cohortId,
      teacherUserId,
    } as Prisma.InputJsonValue);
  }

  static async listTeacherIdsForCohort(cohortId: string, tenantId: string) {
    const rows = await prisma.academyCohortTeacherAssignment.findMany({
      where: { cohortId, cohort: { tenantId } },
      select: { teacherId: true },
    });
    return rows.map((r) => r.teacherId);
  }

  static async listCohortIdsForTeacher(
    teacherUserId: string,
    tenantId: string
  ) {
    const rows = await prisma.academyCohortTeacherAssignment.findMany({
      where: {
        teacherId: teacherUserId,
        cohort: { tenantId },
      },
      select: { cohortId: true },
    });
    return rows.map((r) => r.cohortId);
  }

  /**
   * Si el acceso promocional expiró, marca la matrícula INACTIVE.
   * Fuente de verdad: fin del cohorte PROMOTIONAL y trialExpiresAt alineados.
   */
  static async applyPromotionalExpiryIfNeeded(
    userId: string,
    tenantId: string
  ): Promise<{ expired: boolean }> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { timezone: true },
    });
    void (tenant?.timezone ?? "America/Bogota");

    const enrollments = await prisma.academyEnrollment.findMany({
      where: { userId, status: "ACTIVE" },
      include: {
        cohort: true,
        course: { select: { tenantId: true } },
      },
    });

    let anyExpired = false;
    const now = new Date();

    for (const enrollment of enrollments) {
      if (!enrollment.cohort || enrollment.course.tenantId !== tenantId) continue;
      if (enrollment.cohort.kind !== "PROMOTIONAL") continue;

      const trialEnd = enrollment.trialExpiresAt ?? enrollment.cohort.endDate;
      if (now.getTime() <= trialEnd.getTime()) continue;

      await prisma.academyEnrollment.update({
        where: { id: enrollment.id },
        data: { status: "INACTIVE" },
      });
      anyExpired = true;
    }

    return { expired: anyExpired };
  }
}
