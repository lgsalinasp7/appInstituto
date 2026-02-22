// ============================================
// Router Agent Service
// Classifies intent before calling the main model
// Filters greetings, spam, and irrelevant queries
// ============================================

import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import type {
  IntentCategory,
  AgentContext,
  RouterResult,
} from "../types/agent.types";

const LOCAL_RESPONSES: Record<string, string> = {
  greeting:
    "¡Hola! 👋 Soy tu asistente de KaledSoft. ¿En qué puedo ayudarte hoy? Puedo consultar información de estudiantes, programas, cartera, y más.",
  irrelevant:
    "Lo siento, solo puedo ayudarte con temas relacionados a la gestión educativa de tu institución: estudiantes, programas, cartera, pagos y reportes. ¿Tienes alguna consulta sobre estos temas?",
  spam:
    "No puedo ayudarte con esa solicitud. Si tienes preguntas sobre la plataforma educativa, estaré encantado de asistirte.",
};

const GREETING_PATTERNS = /^(hola|hey|buenas?|buenos?\s*(días|tardes|noches)|hi|hello|saludos|qué\s*tal|como\s*estas?|ey)\s*[!.?]*$/i;

export class RouterAgentService {
  /**
   * Classify intent of a user message
   * Returns whether the main model should process it
   */
  static async classifyIntent(
    message: string,
    tenantId: string,
    context: AgentContext = "general"
  ): Promise<RouterResult> {
    const trimmed = message.trim();

    // Fast path: simple greetings (regex, no model call)
    if (GREETING_PATTERNS.test(trimmed)) {
      return {
        intent: "greeting",
        confidence: 1.0,
        shouldProceed: false,
        localResponse: LOCAL_RESPONSES.greeting,
      };
    }

    // Fast path: very short messages that are likely greetings
    if (trimmed.length <= 3) {
      return {
        intent: "greeting",
        confidence: 0.9,
        shouldProceed: false,
        localResponse: LOCAL_RESPONSES.greeting,
      };
    }

    // For longer messages, use the small model to classify
    try {
      const classification = await this.classifyWithModel(trimmed, context);
      return classification;
    } catch (error) {
      console.error("[RouterAgent] Classification failed, allowing through:", error);
      // On failure, let the message through to the main model
      return {
        intent: "academic",
        confidence: 0.5,
        shouldProceed: true,
      };
    }
  }

  private static async classifyWithModel(
    message: string,
    context: AgentContext
  ): Promise<RouterResult> {
    const contextCategories =
      context === "general"
        ? "academic, financial, student_query, advisor_report, platform_help, greeting, irrelevant, spam"
        : "enrollment_interest, scheduling, objection, academic, financial, greeting, irrelevant, spam";

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      maxOutputTokens: 30,
      temperature: 0,
      system: `Eres un clasificador de intenciones para una plataforma de gestión educativa colombiana.
Responde SOLO con la categoría, sin explicación.
Categorías: ${contextCategories}
- academic: preguntas sobre programas, cursos, módulos
- financial: preguntas sobre pagos, cartera, mora, recaudos
- student_query: buscar o consultar datos de estudiantes
- advisor_report: rendimiento de asesores, ventas
- platform_help: cómo usar la plataforma
- greeting: saludos simples
- irrelevant: preguntas que no tienen nada que ver con educación
- spam: contenido ofensivo o sin sentido
- enrollment_interest: interés en inscribirse
- scheduling: agendar cita o reunión
- objection: objeciones de precio o tiempo`,
      prompt: message.substring(0, 200),
    });

    const intent = text.trim().toLowerCase() as IntentCategory;
    const validIntents: IntentCategory[] = [
      "academic", "financial", "student_query", "advisor_report",
      "platform_help", "greeting", "irrelevant", "enrollment_interest",
      "scheduling", "objection", "spam",
    ];

    const resolvedIntent = validIntents.includes(intent) ? intent : "academic";

    // Determine if we should proceed to main model
    const noModelNeeded: IntentCategory[] = ["greeting", "irrelevant", "spam"];
    const shouldProceed = !noModelNeeded.includes(resolvedIntent);

    const localResponse = LOCAL_RESPONSES[resolvedIntent] || undefined;

    // Suggest agent for funnel-related intents
    let suggestedAgent: AgentContext | undefined;
    if (resolvedIntent === "enrollment_interest" || resolvedIntent === "scheduling") {
      suggestedAgent = "margy";
    } else if (resolvedIntent === "objection") {
      suggestedAgent = "kaled";
    }

    return {
      intent: resolvedIntent,
      confidence: 0.85,
      shouldProceed,
      localResponse: shouldProceed ? undefined : localResponse,
      suggestedAgent,
    };
  }
}
