// Services
export { MargyService } from './services/margy.service';
export { KaledService } from './services/kaled.service';
export { AgentTaskService } from './services/agent-task.service';
export { AgentMemoryService } from './services/agent-memory.service';
export { AgentToolsService } from './services/agent-tools.service';

// Types
export type {
  AgentTaskBoard,
  AgentTaskColumn,
  AgentTaskItem,
  AgentStats,
  AgentPerformance,
  AgentMemoryItem,
  AgentMemoryContext,
  AgentChatMessage,
  AgentChatRequest,
  AgentChatResponse,
  AgentAction,
  AgentTool,
  MargyMetrics,
  KaledMetrics,
  ProspectBriefing,
  FunnelAnalysisResult,
} from './types';

export {
  AGENT_MODEL_CONFIG,
  MODEL_BUDGETS,
  AGENT_TASK_STATUS_LABELS,
  AGENT_TYPE_LABELS,
} from './types';

// Schemas
export {
  createAgentTaskSchema,
  updateAgentTaskSchema,
  createAgentMemorySchema,
  updateAgentMemorySchema,
  agentChatSchema,
  generateBriefingSchema,
} from './schemas';
