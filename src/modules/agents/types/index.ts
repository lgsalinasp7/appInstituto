import type { AgentType, AgentTaskStatus, AgentTask, AgentMemory } from '@prisma/client';

// ============================================
// Agent Task Board (Kanban)
// ============================================

export interface AgentTaskBoard {
  columns: AgentTaskColumn[];
  stats: AgentStats;
}

export interface AgentTaskColumn {
  status: AgentTaskStatus;
  label: string;
  tasks: AgentTaskItem[];
}

export interface AgentTaskItem {
  id: string;
  title: string;
  description: string;
  status: AgentTaskStatus;
  agentType: AgentType;
  priority: number;
  prospectName: string | null;
  prospectId: string | null;
  result: string | null;
  createdAt: Date;
  completedAt: Date | null;
  metadata?: Record<string, unknown>;
}

// ============================================
// Agent Stats
// ============================================

export interface AgentStats {
  margy: AgentPerformance;
  kaled: AgentPerformance;
}

export interface AgentPerformance {
  totalTasks: number;
  completedToday: number;
  pendingTasks: number;
  avgCompletionTime: number; // en minutos
  successRate: number; // porcentaje 0-100
  specificMetrics: Record<string, number>;
}

// ============================================
// Agent Memory
// ============================================

export interface AgentMemoryItem {
  id: string;
  agentType: AgentType;
  category: string;
  content: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface AgentMemoryContext {
  memories: AgentMemoryItem[];
  topStrategies: string[];
  lessons: string[];
}

// ============================================
// Model Configuration
// ============================================

export const AGENT_MODEL_CONFIG = {
  primary: {
    provider: 'anthropic' as const,
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 2000,
  },
  fallback: {
    provider: 'google' as const,
    model: 'gemini-2.0-flash-001',
    maxTokens: 2000,
  },
};

export const MODEL_BUDGETS = {
  'claude-sonnet-4-5-20250929': {
    maxOutputTokens: 2000,
    maxInputTokens: 8000,
  },
  'gemini-2.0-flash-001': {
    maxOutputTokens: 2000,
    maxInputTokens: 8000,
  },
};

// ============================================
// Agent Chat
// ============================================

export interface AgentChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentChatRequest {
  prospectId?: string;
  message: string;
  history?: AgentChatMessage[];
}

export interface AgentChatResponse {
  response: string;
  actions?: AgentAction[];
  taskCreated?: string; // taskId si se creó tarea
}

export interface AgentAction {
  type: 'update_stage' | 'send_whatsapp' | 'send_email' | 'schedule_call' | 'create_task';
  payload: Record<string, unknown>;
  executed: boolean;
  result?: string;
}

// ============================================
// Agent Tools (para Claude)
// ============================================

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// ============================================
// Labels
// ============================================

export const AGENT_TASK_STATUS_LABELS: Record<AgentTaskStatus, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En Proceso',
  COMPLETADA: 'Completada',
  MEJORA: 'En Mejora',
};

export const AGENT_TYPE_LABELS: Record<AgentType, string> = {
  MARGY: 'Margy (Captadora)',
  KALED: 'Kaled (Analista)',
};

// ============================================
// Margy (Captadora) Specific
// ============================================

export interface MargyMetrics {
  leadsQualified: number;
  messagesSent: number;
  conversationRate: number;
  avgResponseTime: number;
}

// ============================================
// Kaled (Analista) Specific
// ============================================

export interface KaledMetrics {
  briefingsGenerated: number;
  analyticsRun: number;
  patternsIdentified: number;
  closingStrategies: number;
}

export interface ProspectBriefing {
  prospectId: string;
  name: string;
  score: number;
  temperature: string;
  summary: string;
  keyInsights: string[];
  objections: string[];
  closingStrategy: string;
  nextSteps: string[];
  generatedAt: Date;
}

export interface FunnelAnalysisResult {
  bottlenecks: {
    stage: string;
    issueDescription: string;
    recommendation: string;
  }[];
  topPerformers: {
    advisorId: string;
    advisorName: string;
    conversionRate: number;
    avgDaysToClose: number;
  }[];
  stagnantLeads: {
    prospectId: string;
    name: string;
    stage: string;
    daysStuck: number;
    suggestedAction: string;
  }[];
  conversionPatterns: {
    pattern: string;
    frequency: number;
    successRate: number;
  }[];
}
