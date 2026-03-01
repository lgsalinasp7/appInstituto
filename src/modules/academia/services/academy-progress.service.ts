/**
 * Servicio de progreso de Academia LMS
 */
import { prisma } from "@/lib/prisma";
import type { AcademyStudentProgress } from "@prisma/client";
import type { CourseProgressSummary } from "../types";

export class AcademyProgressService {
  static async getByUser(userId: string) {
    return prisma.academyStudentProgress.findMany({
      where: { userId },
      include: { lesson: { include: { module: true } } },
    });
  }

  static async getByUserAndCourse(userId: string, courseId: string) {
    const enrollment = await prisma.academyEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });
    if (!enrollment) return null;

    const progressRecords = await prisma.academyStudentProgress.findMany({
      where: {
        userId,
        lessonId: {
          in: enrollment.course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
        },
      },
    });
    const completedSet = new Set(progressRecords.filter((p) => p.completed).map((p) => p.lessonId));

    return {
      enrollment,
      completedLessonIds: Array.from(completedSet),
    };
  }

  static async completeLesson(userId: string, lessonId: string): Promise<AcademyStudentProgress> {
    const progress = await prisma.academyStudentProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    });

    await this.recalculateEnrollmentProgress(userId, lessonId);
    return progress;
  }

  private static async recalculateEnrollmentProgress(userId: string, lessonId: string) {
    const lesson = await prisma.academyLesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson) return;

    const courseId = lesson.module.courseId;
    const allLessons = await prisma.academyLesson.findMany({
      where: { module: { courseId } },
    });
    const completed = await prisma.academyStudentProgress.count({
      where: {
        userId,
        completed: true,
        lessonId: { in: allLessons.map((l) => l.id) },
      },
    });
    const progressPercent = allLessons.length > 0 ? (completed / allLessons.length) * 100 : 0;

    await prisma.academyEnrollment.updateMany({
      where: { userId, courseId },
      data: { progress: progressPercent },
    });
  }

  static async getCourseProgressSummaries(userId: string): Promise<CourseProgressSummary[]> {
    const enrollments = await prisma.academyEnrollment.findMany({
      where: { userId, status: "ACTIVE" },
      include: {
        course: {
          include: {
            modules: { include: { lessons: true } },
          },
        },
      },
    });

    const progressRecords = await prisma.academyStudentProgress.findMany({
      where: { userId, completed: true },
    });
    const completedByLesson = new Set(progressRecords.map((p) => p.lessonId));

    return enrollments.map((e) => {
      const totalLessons = e.course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      const completedLessons = e.course.modules.reduce(
        (sum, m) => sum + m.lessons.filter((l) => completedByLesson.has(l.id)).length,
        0
      );
      const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      return {
        courseId: e.courseId,
        courseTitle: e.course.title,
        totalLessons,
        completedLessons,
        progressPercent,
      };
    });
  }
}
