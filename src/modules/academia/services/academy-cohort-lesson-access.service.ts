/**
 * Cohort-wide lesson gating: when lessonGatingEnabled, students only access
 * pre-cohort lessons + explicitly released lesson IDs.
 */
import { prisma } from "@/lib/prisma";

export { isLessonPrecohortMeta } from "../utils/is-lesson-precohort-meta";

export class AcademyCohortLessonAccessService {
  /** Load released lesson IDs for a cohort (empty if none). */
  static async getReleasedLessonIds(cohortId: string): Promise<Set<string>> {
    const rows = await prisma.academyCohortLessonRelease.findMany({
      where: { cohortId },
      select: { lessonId: true },
    });
    return new Set(rows.map((r) => r.lessonId));
  }

  /**
   * Whether the student can read lesson content for this course/cohort context.
   * Admins: always. Teachers: if assigned to any cohort of this course. Students: trial + gating rules.
   */
  static async assertLessonReadableOrThrow(params: {
    userId: string;
    platformRole: string | null;
    tenantId: string;
    courseId: string;
    lessonId: string;
    isPrecohort: boolean;
    enrollment: {
      isTrial: boolean;
      trialExpiresAt: Date | null;
      trialAllowedLessonId: string | null;
      cohortId: string | null;
    } | null;
  }): Promise<void> {
    const {
      userId,
      platformRole,
      tenantId,
      courseId,
      lessonId,
      isPrecohort,
      enrollment,
    } = params;

    if (platformRole === "ACADEMY_ADMIN") {
      const course = await prisma.academyCourse.findFirst({
        where: { id: courseId, tenantId },
        select: { id: true },
      });
      if (!course) throw new Error("Curso no encontrado");
      return;
    }

    if (platformRole === "ACADEMY_TEACHER") {
      const assigned = await prisma.academyCohortTeacherAssignment.findFirst({
        where: {
          teacherId: userId,
          cohort: { courseId, tenantId },
        },
        select: { id: true },
      });
      if (assigned) return;
      throw new Error("No tienes asignación de profesor en este curso");
    }

    if (!enrollment) {
      throw new Error("No estás matriculado en este curso");
    }

    if (enrollment.isTrial) {
      if (enrollment.trialExpiresAt && new Date() > enrollment.trialExpiresAt) {
        throw new Error("Tu acceso de prueba ha expirado");
      }
      if (enrollment.trialAllowedLessonId && lessonId !== enrollment.trialAllowedLessonId) {
        throw new Error("Esta lección no está incluida en tu acceso de prueba");
      }
      return;
    }

    const cohortId = enrollment.cohortId;
    if (!cohortId) {
      return;
    }

    const cohort = await prisma.academyCohort.findFirst({
      where: { id: cohortId, tenantId, courseId },
      select: { lessonGatingEnabled: true },
    });

    if (!cohort || !cohort.lessonGatingEnabled) {
      return;
    }

    if (isPrecohort) {
      return;
    }

    const released = await prisma.academyCohortLessonRelease.findUnique({
      where: {
        cohortId_lessonId: { cohortId, lessonId },
      },
      select: { id: true },
    });

    if (!released) {
      throw new Error(
        "Esta lección aún no está habilitada para tu cohorte. Consulta con administración."
      );
    }
  }

  /** Compute lock flag for sidebar / cohort views (non-admin; teachers see unlocked for assigned course). */
  static computeLessonLockedForStudentView(params: {
    platformRole: string | null;
    lessonGatingEnabled: boolean;
    releasedLessonIds: Set<string>;
    isPrecohort: boolean;
    isTrial: boolean;
    trialExpired: boolean;
    trialAllowedLessonId: string | null;
    lessonId: string;
    enrollmentCohortId: string | null;
  }): boolean {
    const {
      platformRole,
      lessonGatingEnabled,
      releasedLessonIds,
      isPrecohort,
      isTrial,
      trialExpired,
      trialAllowedLessonId,
      lessonId,
      enrollmentCohortId,
    } = params;

    if (platformRole === "ACADEMY_ADMIN" || platformRole === "ACADEMY_TEACHER") {
      return false;
    }

    if (isTrial) {
      return trialExpired || (trialAllowedLessonId != null && lessonId !== trialAllowedLessonId);
    }

    if (!enrollmentCohortId || !lessonGatingEnabled) {
      return false;
    }

    if (isPrecohort) {
      return false;
    }

    return !releasedLessonIds.has(lessonId);
  }
}
