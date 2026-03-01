/**
 * Tipos del módulo Academia LMS
 */
import type {
  AcademyCourse,
  AcademyModule,
  AcademyLesson,
  AcademyEnrollment,
  AcademyCohort,
  AcademyStudentProgress,
} from "@prisma/client";

export type { AcademyCourse, AcademyModule, AcademyLesson };

export interface AcademyCourseWithModules extends AcademyCourse {
  modules: (AcademyModule & { lessons: AcademyLesson[] })[];
}

export interface AcademyEnrollmentWithCourse extends AcademyEnrollment {
  course: AcademyCourseWithModules;
}

export type { AcademyEnrollment, AcademyCohort, AcademyStudentProgress };

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt: Date | null;
}

export interface CourseProgressSummary {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}
