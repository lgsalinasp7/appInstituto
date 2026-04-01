import { z } from "zod";

export const sessionTypeSchema = z.enum(["TEORIA", "PRACTICA", "LIVE", "ENTREGABLE"]);
export const dayOfWeekSchema = z.enum(["LUNES", "MIERCOLES", "VIERNES"]);
export const cralPhaseSchema = z.enum(["CONSTRUIR", "ROMPER", "AUDITAR", "LANZAR"]);

export const conceptItemSchema = z.object({
  key: z.string().min(1),
  title: z.string(),
  body: z.string(),
});

export const adminLessonMetaPatchSchema = z.object({
  sessionType: sessionTypeSchema.optional(),
  weekNumber: z.number().int().min(1).optional(),
  dayOfWeek: dayOfWeekSchema.optional(),
  isPrecohort: z.boolean().optional(),
  phaseTarget: cralPhaseSchema.nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  videoTitle: z.string().nullable().optional(),
  analogyText: z.string().nullable().optional(),
  kaledIntro: z.string().nullable().optional(),
  concepts: z.array(conceptItemSchema).nullable().optional(),
  interactiveAnimationId: z.string().nullable().optional(),
});

export const adminQuizOptionSchema = z.object({
  label: z.string().min(1),
  text: z.string(),
  isCorrect: z.boolean(),
  feedback: z.string().nullable().optional(),
});

export const adminQuizItemSchema = z.object({
  question: z.string().min(1),
  order: z.number().int().min(0),
  options: z.array(adminQuizOptionSchema).min(1),
});

export const adminReplaceQuizzesSchema = z.object({
  quizzes: z.array(adminQuizItemSchema),
});

export const adminCralItemSchema = z.object({
  phase: cralPhaseSchema,
  title: z.string().min(1),
  description: z.string(),
  taskCode: z.string().nullable().optional(),
  order: z.number().int().min(0),
});

export const adminReplaceCralSchema = z.object({
  challenges: z.array(adminCralItemSchema),
});

export const adminDeliverableCheckItemSchema = z.object({
  text: z.string().min(1),
  order: z.number().int().min(0),
});

export const adminDeliverableItemSchema = z.object({
  weekNumber: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string(),
  isFinal: z.boolean(),
  checkItems: z.array(adminDeliverableCheckItemSchema),
});

export const adminReplaceDeliverablesSchema = z.object({
  deliverables: z.array(adminDeliverableItemSchema),
});
