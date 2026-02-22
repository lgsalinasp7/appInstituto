/**
 * Zod schemas for AI Chat module
 */

import { z } from 'zod';

// Conversation schemas
export const createConversationSchema = z.object({
  title: z.string().optional(),
});

export const addMessageSchema = z.object({
  conversationId: z.string().cuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  toolCalls: z.array(z.any()).optional(),
  toolResults: z.array(z.any()).optional(),
});

// Tool schemas - ULTRA SIMPLIFICADOS para Groq (sin enums ni opcionales)
export const getStudentStatsToolSchema = z.object({});

export const getProgramInfoToolSchema = z.object({});

export const getCarteraReportToolSchema = z.object({});

export const searchStudentsToolSchema = z.object({
  query: z.string(),
});

export const getAdvisorPerformanceToolSchema = z.object({});

export const getCurrentUserInfoToolSchema = z.object({
  includeRole: z.boolean().optional(),
  includePermissions: z.boolean().optional(),
});
