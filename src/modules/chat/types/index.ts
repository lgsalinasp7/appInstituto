/**
 * Types for AI Chat module
 */

export interface ConversationListItem {
  id: string;
  title: string | null;
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  createdAt: Date;
}

export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResult {
  toolCallId: string;
  result: unknown;
}

export interface ConversationWithMessages {
  id: string;
  title: string | null;
  userId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface CreateConversationInput {
  title?: string;
}

export interface AddMessageInput {
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

// Tool input types
export interface GetStudentStatsInput {
  period?: 'today' | 'week' | 'month' | 'year';
}

export interface GetProgramInfoInput {
  programId?: string;
  includeStats?: boolean;
}

export interface GetCarteraReportInput {
  type: 'summary' | 'aging' | 'alerts';
  includeDetails?: boolean;
}

export interface SearchStudentsInput {
  query: string;
  limit?: number;
}

export interface GetCurrentUserInfoInput {
  includeRole?: boolean;
  includePermissions?: boolean;
}
