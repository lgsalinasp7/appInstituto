// ============================================
// AI Agent Tracking - TypeScript Types
// ============================================

export interface TokenUsage {
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  cached?: boolean;
}

export interface AgentStats {
  totalTokens: number;
  totalMessages: number;
  totalCostCOP: number;
  activeModels: number;
  freeTierUsage: FreeTierUsage;
  currentPeriod: {
    start: Date;
    end: Date;
  };
  trends: {
    tokensTrend: number; // % change from previous period
    messagesTrend: number;
    costTrend: number;
  };
}

export interface FreeTierUsage {
  used: number;
  limit: number;
  percentage: number;
  remaining: number;
  resetDate: Date;
  status: "safe" | "warning" | "danger"; // <70%, 70-90%, >90%
}

export interface TokenTrendPoint {
  date: string; // ISO date
  tokens: number;
  inputTokens: number;
  outputTokens: number;
  messages: number;
  cost: number;
}

export interface ModelDistribution {
  model: string;
  modelName: string;
  tokens: number;
  percentage: number;
  messages: number;
  cost: number;
  color?: string;
}

export interface UsageLog {
  id: string;
  timestamp: Date;
  tenantName: string | null;
  tenantSlug: string | null;
  model: string;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  conversationId: string;
  messageRole: string;
}

export interface PaginatedUsageLogs {
  logs: UsageLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TopTenant {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  totalTokens: number;
  totalMessages: number;
  totalCost: number;
  percentage: number;
}

export interface UsageLogsParams {
  page?: number;
  limit?: number;
  tenantId?: string;
  modelId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AiModelConfig {
  id: string;
  name: string;
  provider: string;
  modelIdentifier: string;
  freeTokensLimit: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
  isActive: boolean;
  resetPeriod: "DAILY" | "MONTHLY" | "YEARLY";
}

export interface CostCalculation {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  costInCents: number;
}

// ============================================
// Model Budget & Cost Control Types
// ============================================

export type UseCaseType = 'chat-general' | 'chat-simple' | 'summarization' | 'router';

export interface ModelBudget {
  maxOutputTokens: number;
  maxInputTokens: number;
}

export const MODEL_BUDGETS: Record<UseCaseType, ModelBudget> = {
  'chat-general': { maxOutputTokens: 2048, maxInputTokens: 4096 },
  'chat-simple': { maxOutputTokens: 512, maxInputTokens: 1024 },
  'summarization': { maxOutputTokens: 256, maxInputTokens: 8192 },
  'router': { maxOutputTokens: 64, maxInputTokens: 512 },
};

// ============================================
// Router Agent Types
// ============================================

export type IntentCategory =
  | 'academic'
  | 'financial'
  | 'student_query'
  | 'advisor_report'
  | 'platform_help'
  | 'greeting'
  | 'irrelevant'
  | 'enrollment_interest'
  | 'scheduling'
  | 'objection'
  | 'spam';

export type AgentContext = 'general' | 'margy' | 'kaled';

export interface RouterResult {
  intent: IntentCategory;
  confidence: number;
  shouldProceed: boolean;
  localResponse?: string;
  suggestedAgent?: AgentContext;
}

// ============================================
// Session Guard Types
// ============================================

export interface SessionLimitResult {
  allowed: boolean;
  reason?: string;
  remaining: number;
}

export const SESSION_LIMITS = {
  maxMessagesPerConversation: 30,
  maxMessagesPerDay: 50,
} as const;
