import { z } from 'zod';

// ============================================
// Agent Task Schemas
// ============================================

export const createAgentTaskSchema = z.object({
  title: z.string().min(3, 'Título requerido'),
  description: z.string().min(10, 'Descripción requerida'),
  agentType: z.enum(['MARGY', 'KALED']),
  priority: z.number().int().min(0).max(2).default(0),
  prospectId: z.string().cuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateAgentTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'MEJORA']).optional(),
  priority: z.number().int().min(0).max(2).optional(),
  result: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================
// Agent Memory Schemas
// ============================================

export const createAgentMemorySchema = z.object({
  agentType: z.enum(['MARGY', 'KALED']),
  category: z.string().min(2, 'Categoría requerida'),
  content: z.string().min(10, 'Contenido requerido'),
  score: z.number().int().min(0).max(100).default(50),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateAgentMemorySchema = z.object({
  score: z.number().int().min(0).max(100).optional(),
  content: z.string().min(10).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================
// Agent Chat Schemas
// ============================================

export const agentChatSchema = z.object({
  prospectId: z.string().cuid().optional(),
  message: z.string().min(1, 'Mensaje requerido'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).optional(),
});

export const generateBriefingSchema = z.object({
  prospectId: z.string().cuid(),
  includeTimeline: z.boolean().default(true),
  includeAnalytics: z.boolean().default(true),
});
