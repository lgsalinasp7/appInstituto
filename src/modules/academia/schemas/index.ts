/**
 * Schemas Zod para Academia LMS
 */
import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string(),
  category: z.string().min(1),
  duration: z.string(),
  level: z.string(),
  price: z.number().min(0),
  durationWeeks: z.number().int().min(1).optional().default(24),
  description2: z.string().optional(),
});

export const createModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  order: z.number().int().min(0),
  courseId: z.string().min(1),
});

export const createLessonSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  duration: z.number().int().min(0),
  order: z.number().int().min(0),
  moduleId: z.string().min(1),
});

export const createEnrollmentSchema = z.object({
  userId: z.string().min(1),
  courseId: z.string().min(1),
  cohortId: z.string().min(1).optional(),
});

export const completeLessonSchema = z.object({
  lessonId: z.string().min(1),
});

export const updateVideoProgressSchema = z.object({
  lessonId: z.string().min(1),
  videoProgress: z.number().int().min(0).max(100),
  timeSpentSec: z.number().int().min(0),
});

export const createCohortSchema = z.object({
  name: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  maxStudents: z.number().int().min(1).max(50000).default(40),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]),
  schedule: z.record(z.string(), z.unknown()),
  courseId: z.string().min(1),
  kind: z.enum(["ACADEMIC", "PROMOTIONAL"]).optional().default("ACADEMIC"),
  promoPreset: z.enum(["DAYS_3", "DAYS_7", "CUSTOM"]).optional().nullable(),
  campaignLabel: z.string().optional().nullable(),
  lessonGatingEnabled: z.boolean().optional(),
  timezone: z.string().optional().nullable(),
});

export const createCohortEventSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  dayOfWeek: z.number().int().min(0).max(6).optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  scheduledAt: z.coerce.date().optional().nullable(),
  lessonId: z.string().cuid().optional().nullable(),
  sessionOrder: z.number().int().min(0).optional(),
  cancelled: z.boolean().optional(),
});

export const patchCohortEventSchema = createCohortEventSchema.partial();

export const patchCohortLessonAccessSchema = z.object({
  lessonGatingEnabled: z.boolean().optional(),
  releasedLessonIds: z.array(z.string().cuid()).optional(),
});

export const createAssessmentSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  scheduledAt: z.coerce.date(),
  durationMinutes: z.number().int().min(0).optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type CompleteLessonInput = z.infer<typeof completeLessonSchema>;
export type CreateCohortInput = z.infer<typeof createCohortSchema>;
export type CreateCohortEventInput = z.infer<typeof createCohortEventSchema>;
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
