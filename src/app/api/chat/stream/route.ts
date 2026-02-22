/**
 * API Route: Chat Streaming
 * POST /api/chat/stream - Streaming de respuestas del agente IA
 *
 * Pipeline completo:
 * 1. Session Guard → límites de mensajes
 * 2. Router Agent → clasificar intent, filtrar basura
 * 3. Response Cache → respuesta cacheada si existe
 * 4. Context Pruning → resumir historial largo
 * 5. RAG → contexto de documentos relevantes
 * 6. Model con Fallback → Groq → Gemini → OpenRouter
 * 7. Cache Response → guardar para futuro
 * 8. Record Usage → registrar tokens
 */

import { NextRequest } from "next/server";
import { tool, stepCountIs } from "ai";
import { ChatService, AiToolsService } from "@/modules/chat";
import {
  getStudentStatsToolSchema,
  getProgramInfoToolSchema,
  getCarteraReportToolSchema,
  searchStudentsToolSchema,
  getAdvisorPerformanceToolSchema,
} from "@/modules/chat/schemas";
import { withTenantAuth } from "@/lib/api-auth";
import { MODEL_BUDGETS } from "@/modules/chat/types/agent.types";
import { SessionGuardService } from "@/modules/chat/services/session-guard.service";
import { RouterAgentService } from "@/modules/chat/services/router-agent.service";
import { ResponseCacheService } from "@/modules/chat/services/response-cache.service";
import { ContextPruningService } from "@/modules/chat/services/context-pruning.service";
import { RAGService } from "@/modules/chat/services/rag.service";
import { ModelProviderService } from "@/modules/chat/services/model-provider.service";

export const POST = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const body = await request.json();
  const { conversationId, message } = body;

  if (!message || typeof message !== "string" || message.trim() === "") {
    return new Response(
      JSON.stringify({ success: false, error: "El mensaje es requerido" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let currentConversationId = conversationId;

  // Si no existe conversationId, crear nueva conversación
  if (!currentConversationId) {
    const newConversation = await ChatService.createConversation(user.id, tenantId, {
      title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
    });
    currentConversationId = newConversation.id;
  }

  // ============================================
  // CAPA 1: Session Guard - Verificar límites
  // ============================================
  const sessionCheck = await SessionGuardService.checkSessionLimits(
    user.id,
    currentConversationId,
    tenantId
  );

  if (!sessionCheck.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: sessionCheck.reason,
        conversationId: currentConversationId,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Cargar historial de mensajes
  const conversation = await ChatService.getConversationById(
    currentConversationId,
    user.id,
    tenantId
  );

  if (!conversation) {
    return new Response(
      JSON.stringify({ success: false, error: "Conversación no encontrada" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // Guardar mensaje del usuario
  await ChatService.addMessage(
    { conversationId: currentConversationId, role: "user", content: message },
    user.id,
    tenantId
  );

  // ============================================
  // CAPA 2: Router Agent - Clasificar intent
  // ============================================
  const routerResult = await RouterAgentService.classifyIntent(
    message,
    tenantId,
    "general"
  );

  if (!routerResult.shouldProceed && routerResult.localResponse) {
    // Guardar respuesta local sin llamar al modelo
    await ChatService.addMessage(
      {
        conversationId: currentConversationId,
        role: "assistant",
        content: routerResult.localResponse,
      },
      user.id,
      tenantId
    );

    // Retornar respuesta local como stream simple
    const encoder = new TextEncoder();
    const localStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(routerResult.localResponse!));
        controller.close();
      },
    });

    return new Response(localStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Conversation-Id": currentConversationId,
        "X-Router-Intent": routerResult.intent,
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  // ============================================
  // CAPA 3: Response Cache - Buscar respuesta cacheada
  // ============================================
  const cachedResponse = await ResponseCacheService.getCachedResponse(
    message,
    tenantId
  );

  if (cachedResponse) {
    // Guardar respuesta cacheada en BD
    const cachedMsg = await ChatService.addMessage(
      {
        conversationId: currentConversationId,
        role: "assistant",
        content: cachedResponse.response,
      },
      user.id,
      tenantId
    );

    // Registrar como 0 tokens (cache hit)
    const { AiAgentService } = await import("@/modules/chat/services/ai-agent.service");
    await AiAgentService.recordTokenUsage(cachedMsg.id, {
      modelUsed: "cache",
      inputTokens: 0,
      outputTokens: 0,
      cached: true,
    });

    const encoder = new TextEncoder();
    const cacheStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(cachedResponse.response));
        controller.close();
      },
    });

    return new Response(cacheStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Conversation-Id": currentConversationId,
        "X-Cache-Hit": "true",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  // ============================================
  // CAPA 4: Context Pruning - Resumir historial largo
  // ============================================
  const allMessages = [
    ...conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: "user" as const, content: message },
  ];

  const prunedContext = await ContextPruningService.pruneContext(
    allMessages,
    currentConversationId
  );

  // Build final messages array
  const modelMessages: Array<{ role: string; content: string }> = [];
  if (prunedContext.summary) {
    modelMessages.push({
      role: "system",
      content: `Resumen de la conversación anterior: ${prunedContext.summary}`,
    });
  }
  modelMessages.push(...prunedContext.recentMessages);

  // ============================================
  // CAPA 5: RAG - Buscar contexto de documentos
  // ============================================
  let ragContext = "";
  try {
    const ragResults = await RAGService.searchRelevantContext(message, tenantId);
    if (ragResults.length > 0) {
      ragContext =
        "\n\n**Información institucional relevante:**\n" +
        ragResults
          .map((r) => `[${r.title} - ${r.category}]: ${r.content}`)
          .join("\n\n");
    }
  } catch (error) {
    console.warn("[Stream] RAG search failed (non-critical):", error);
  }

  // System prompt con contexto del usuario + grounding rules + RAG
  const systemPrompt = `Eres un asistente virtual inteligente para el sistema KaledSoft, una plataforma de gestión educativa para instituciones colombianas.

**Información del usuario actual:**
- Nombre: ${user.name || "Usuario"}
- Email: ${user.email}
- Institución ID: ${user.tenantId || "Sin institución"}

**Tus capacidades:**
- Consultar estadísticas de estudiantes y recaudos
- Obtener información sobre programas académicos
- Generar reportes de cartera (mora, vencimientos, alertas)
- Buscar estudiantes por nombre o documento
- Responder preguntas sobre cómo usar la plataforma

**Directrices importantes:**
1. Siempre responde en español de Colombia
2. Usa formato de moneda colombiana (COP) para valores monetarios
3. Las fechas deben mostrarse en formato dd/mm/yyyy
4. Sé amable, profesional y conciso
5. Si no tienes información suficiente para responder, pide más detalles
6. Cuando uses herramientas, explica brevemente qué estás consultando
7. Formatea las respuestas de manera clara y organizada

**Sobre la plataforma KaledSoft:**
KaledSoft es un sistema integral para gestionar:
- Matrícula de estudiantes en programas educativos
- Seguimiento de pagos y compromisos
- Gestión de cartera y mora
- Reportes financieros y académicos
- Asesores comerciales y su rendimiento

**Reglas de grounding (OBLIGATORIAS):**
- Si no tienes la información solicitada, responde: "No tengo esa información disponible. Por favor contacta a la oficina administrativa."
- NUNCA inventes datos, cifras, fechas o nombres de estudiantes
- Si una herramienta retorna error, informa honestamente al usuario
- Solo responde sobre temas relacionados con la gestión educativa de la institución${ragContext}`;

  // ============================================
  // CAPA 6: Configurar herramientas
  // ============================================
  const toolsUsed: string[] = [];
  const tools = {
    getStudentStats: tool({
      description:
        "Obtiene estadísticas generales del sistema: total de estudiantes, recaudos del día/mes/año, cartera en mora, compromisos pendientes, y tendencias de crecimiento. No requiere parámetros.",
      inputSchema: getStudentStatsToolSchema,
      execute: async () => {
        toolsUsed.push("getStudentStats");
        return await AiToolsService.getStudentStats({ period: "today" }, tenantId);
      },
    }),
    getProgramInfo: tool({
      description:
        "Obtiene información de TODOS los programas académicos. Retorna nombre, valor total, número de módulos y estado de cada programa. Úsala para comparar programas y encontrar el más costoso. No requiere parámetros.",
      inputSchema: getProgramInfoToolSchema,
      execute: async () => {
        toolsUsed.push("getProgramInfo");
        return await AiToolsService.getProgramInfo({}, tenantId);
      },
    }),
    getCarteraReport: tool({
      description:
        "Genera reporte resumen de cartera con compromisos y vencimientos. No requiere parámetros.",
      inputSchema: getCarteraReportToolSchema,
      execute: async () => {
        toolsUsed.push("getCarteraReport");
        return await AiToolsService.getCarteraReport({ type: "summary" }, tenantId);
      },
    }),
    searchStudents: tool({
      description:
        "Busca estudiantes por nombre o número de documento. Requiere el parámetro 'query' con el texto a buscar.",
      inputSchema: searchStudentsToolSchema,
      execute: async (params) => {
        toolsUsed.push("searchStudents");
        return await AiToolsService.searchStudents(params, tenantId);
      },
    }),
    getAdvisorPerformance: tool({
      description:
        "Obtiene el rendimiento y ventas de TODOS los asesores del mes. Retorna para cada asesor: nombre, total de estudiantes matriculados, total de ventas, total recaudado, monto pendiente, tasa de recuperación, estudiantes y recaudo del mes actual. Úsala para saber cuánto vendió o recaudó cada asesor. No requiere parámetros.",
      inputSchema: getAdvisorPerformanceToolSchema,
      execute: async () => {
        toolsUsed.push("getAdvisorPerformance");
        return await AiToolsService.getAdvisorPerformance(tenantId);
      },
    }),
  };

  // ============================================
  // CAPA 7: Model con Fallback + maxTokens
  // ============================================
  const budget = MODEL_BUDGETS["chat-general"];

  let usedModelId = "unknown";
  const { stream: result, modelId, providerName } =
    await ModelProviderService.streamWithFallback({
      system: systemPrompt,
      messages: modelMessages,
      tools,
      maxTokens: budget.maxOutputTokens,
      temperature: 0.7,
      stopWhen: stepCountIs(5),
      onFinish: async ({ text, toolCalls, toolResults, usage }) => {
        // Guardar respuesta del asistente en BD
        const assistantMessage = await ChatService.addMessage(
          {
            conversationId: currentConversationId,
            role: "assistant",
            content: text,
            toolCalls: toolCalls as any,
            toolResults: toolResults as any,
          },
          user.id,
          tenantId
        );

        // Registrar uso de tokens
        if (usage && assistantMessage.id) {
          const { AiAgentService } = await import(
            "@/modules/chat/services/ai-agent.service"
          );
          await AiAgentService.recordTokenUsage(assistantMessage.id, {
            modelUsed: usedModelId,
            inputTokens: usage.inputTokens || 0,
            outputTokens: usage.outputTokens || 0,
            cached: false,
          });
        }

        // ============================================
        // CAPA 8: Cache Response si es cacheable
        // ============================================
        if (text && ResponseCacheService.isCacheable(message, toolsUsed)) {
          await ResponseCacheService.cacheResponse(
            message,
            text,
            toolsUsed,
            tenantId
          );
        }
      },
    });

  usedModelId = modelId;
  console.log(`[Stream] Using provider: ${providerName} (${modelId})`);

  // Crear stream personalizado
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.fullStream) {
          if (chunk.type === "text-delta") {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        }
        controller.close();
      } catch (error) {
        console.error("[Stream] Error:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": currentConversationId,
      "X-Model-Used": modelId,
      "X-Provider": providerName,
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
});
