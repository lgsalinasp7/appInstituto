import { streamText, generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { AgentToolsService } from './agent-tools.service';
import { AgentMemoryService } from './agent-memory.service';
import { AgentTaskService } from './agent-task.service';
import { prisma } from '@/lib/prisma';
import type { AgentChatMessage } from '../types';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export class MargyService {
  /**
   * System prompt para Margy (Captadora/Calificadora)
   */
  private static async getSystemPrompt(tenantId: string): Promise<string> {
    const memoryContext = await AgentMemoryService.getMemoryContext('MARGY', tenantId);
    const memorySection = AgentMemoryService.formatMemoryForPrompt(memoryContext);

    return `Eres Margy, una agente de ventas virtual especializada en captar y calificar leads para instituciones educativas en Colombia.

## Tu Personalidad
- Amigable, cálida y profesional
- Entusiasta sobre la educación y el desarrollo personal
- Empática con las necesidades de los estudiantes colombianos
- Comunicación en español colombiano natural
- Usas "vos" o "tú" según el contexto regional

## Tus Responsabilidades
1. **Captar leads nuevos** - Responder a mensajes entrantes de WhatsApp
2. **Calificar interés** - Determinar la temperatura del lead (FRIO, TIBIO, CALIENTE)
3. **Mover en el funnel** - Avanzar prospects según sus respuestas
4. **Coordinar seguimientos** - Crear tareas para humanos cuando sea necesario
5. **Recopilar información** - Nombre, email, programa de interés, disponibilidad

## Temperatura de Leads
- **CALIENTE**: Interesado, pregunta por precios, disponibilidad inmediata, urgencia
- **TIBIO**: Curioso, pide información, pero sin urgencia clara
- **FRIO**: Respuestas cortas, evasivo, solo explora opciones

## Etapas del Funnel
- **NUEVO** → Primera interacción
- **CONTACTADO** → Primer mensaje enviado
- **INTERESADO** → Mostró interés genuino
- **MASTERCLASS_REGISTRADO** → Acepta asistir a masterclass
- **APLICACION** → Llenó formulario de aplicación
- **LLAMADA_AGENDADA** → Acepta llamada con asesor
- **PERDIDO** → No responde o rechaza

## Herramientas Disponibles
Tienes acceso a herramientas para:
- Obtener información de prospects
- Actualizar etapa del funnel
- Cambiar temperatura del lead
- Enviar mensajes de WhatsApp
- Crear tareas de seguimiento
- Guardar memorias/estrategias
- Disparar secuencias de email
- Programar seguimientos

## Estrategia de Conversación
1. **Primer contacto**: Saludo cálido, preguntar nombre y programa de interés
2. **Calificación**: Preguntar sobre disponibilidad, urgencia, presupuesto
3. **Invitación**: Ofrecer masterclass gratuita o llamada con asesor
4. **Seguimiento**: Si no responde, programar seguimiento en 2-3 días

${memorySection}

## Instrucciones Importantes
- Siempre actualiza la temperatura del lead después de calificarlo
- Mueve al prospect a la etapa correcta del funnel
- Crea tareas de seguimiento para leads tibios/calientes
- Guarda memorias de estrategias exitosas o lecciones aprendidas
- Responde con máximo 2-3 mensajes cortos por turno (WhatsApp style)
- Usa emojis ocasionalmente para calidez (no exageres)
- Nunca inventes información sobre programas o precios
`;
  }

  /**
   * Chat con Margy (streaming)
   */
  static async chat(
    message: string,
    history: AgentChatMessage[],
    tenantId: string,
    prospectId?: string
  ) {
    const systemPrompt = await this.getSystemPrompt(tenantId);
    const tools = AgentToolsService.getMargyTools(tenantId);

    // Agregar contexto del prospect si existe
    let contextMessage = '';
    if (prospectId) {
      const prospect = await prisma.prospect.findFirst({
        where: { id: prospectId, tenantId },
        include: {
          program: { select: { name: true } },
          interactions: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (prospect) {
        contextMessage = `\n\n## Contexto del Prospect Actual
- Nombre: ${prospect.name}
- Email: ${prospect.email || 'N/A'}
- Teléfono: ${prospect.phone}
- Programa: ${prospect.program?.name || 'No especificado'}
- Etapa: ${prospect.funnelStage}
- Temperatura: ${prospect.temperature}
- Score: ${prospect.score}
- Últimas interacciones: ${prospect.interactions.map(i => `[${i.type}] ${i.content}`).join(', ')}
`;
      }
    }

    try {
      // Intentar con Claude primero
      const result = await streamText({
        model: anthropic('claude-sonnet-4-5-20250929'),
        system: systemPrompt + contextMessage,
        messages: history.concat([{ role: 'user', content: message }]),
        tools,
        maxOutputTokens: 2000,
      });

      return result;
    } catch (error: any) {
      console.error('Error with Claude, falling back to Gemini:', error);

      // Fallback a Gemini
      const result = await streamText({
        model: google('gemini-2.0-flash-001'),
        system: systemPrompt + contextMessage,
        messages: history.concat([{ role: 'user', content: message }]),
        tools,
        maxOutputTokens: 2000,
      });

      return result;
    }
  }

  /**
   * Auto-respuesta para mensajes entrantes de WhatsApp
   */
  static async autoRespond(
    prospectId: string,
    incomingMessage: string,
    tenantId: string
  ): Promise<string> {
    const systemPrompt = await this.getSystemPrompt(tenantId);
    const tools = AgentToolsService.getMargyTools(tenantId);

    // Obtener contexto del prospect
    const prospect = await prisma.prospect.findFirst({
      where: { id: prospectId, tenantId },
      include: {
        program: { select: { name: true } },
        interactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!prospect) {
      throw new Error('Prospect not found');
    }

    // Construir historial de conversación
    const history: AgentChatMessage[] = prospect.interactions
      .reverse()
      .map(i => ({
        role: i.type === 'WHATSAPP_RECIBIDO' ? 'user' as const : 'assistant' as const,
        content: i.content || '',
      }))
      .filter(msg => msg.content);

    const contextMessage = `\n\n## Contexto del Prospect
- Nombre: ${prospect.name}
- Email: ${prospect.email || 'N/A'}
- Teléfono: ${prospect.phone}
- Programa: ${prospect.program?.name || 'No especificado'}
- Etapa: ${prospect.funnelStage}
- Temperatura: ${prospect.temperature}
- Score: ${prospect.score}
- Fuente: ${prospect.source}

INSTRUCCIÓN: Responde al mensaje del prospect. Usa las herramientas disponibles para calificar, actualizar etapa, crear tareas, etc.
Responde de forma natural y concisa (máximo 2-3 mensajes cortos estilo WhatsApp).
`;

    try {
      // Intentar con Claude
      const result = await generateText({
        model: anthropic('claude-sonnet-4-5-20250929'),
        system: systemPrompt + contextMessage,
        messages: history.concat([{ role: 'user', content: incomingMessage }]),
        tools,
        maxOutputTokens: 1500,
      });

      return result.text;
    } catch (error: any) {
      console.error('Error with Claude, falling back to Gemini:', error);

      // Fallback a Gemini
      const result = await generateText({
        model: google('gemini-2.0-flash-001'),
        system: systemPrompt + contextMessage,
        messages: history.concat([{ role: 'user', content: incomingMessage }]),
        tools,
        maxOutputTokens: 1500,
      });

      return result.text;
    }
  }

  /**
   * Calificar lead y retornar recomendación
   */
  static async qualifyLead(prospectId: string, tenantId: string): Promise<{
    temperature: 'FRIO' | 'TIBIO' | 'CALIENTE';
    recommendedStage: string;
    reasoning: string;
    nextActions: string[];
  }> {
    const prospect = await prisma.prospect.findFirst({
      where: { id: prospectId, tenantId },
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!prospect) {
      throw new Error('Prospect not found');
    }

    const conversationHistory = prospect.interactions
      .map(i => `[${i.type}] ${i.content}`)
      .join('\n');

    const prompt = `Analiza esta conversación con un lead y recomienda:
1. Temperatura (FRIO, TIBIO, CALIENTE)
2. Etapa recomendada del funnel
3. Razonamiento
4. Próximas acciones

Lead Info:
- Etapa actual: ${prospect.funnelStage}
- Temperatura actual: ${prospect.temperature}
- Score: ${prospect.score}

Conversación:
${conversationHistory}

Responde en formato JSON:
{
  "temperature": "FRIO|TIBIO|CALIENTE",
  "recommendedStage": "etapa",
  "reasoning": "explicación",
  "nextActions": ["acción 1", "acción 2"]
}`;

    try {
      const result = await generateText({
        model: anthropic('claude-sonnet-4-5-20250929'),
        prompt,
        maxOutputTokens: 500,
      });

      return JSON.parse(result.text);
    } catch (error: any) {
      console.error('Error qualifying lead:', error);

      // Fallback simple basado en reglas
      const hasResponded = prospect.interactions.some(i => i.type === 'WHATSAPP_RECIBIDO');
      const responseCount = prospect.interactions.filter(i => i.type === 'WHATSAPP_RECIBIDO').length;

      if (!hasResponded) {
        return {
          temperature: 'FRIO',
          recommendedStage: 'CONTACTADO',
          reasoning: 'No ha respondido aún',
          nextActions: ['Enviar seguimiento en 2 días'],
        };
      } else if (responseCount >= 3) {
        return {
          temperature: 'CALIENTE',
          recommendedStage: 'INTERESADO',
          reasoning: 'Conversación activa con múltiples respuestas',
          nextActions: ['Ofrecer masterclass', 'Agendar llamada'],
        };
      } else {
        return {
          temperature: 'TIBIO',
          recommendedStage: 'CONTACTADO',
          reasoning: 'Ha respondido pero conversación limitada',
          nextActions: ['Hacer preguntas calificadoras', 'Ofrecer más información'],
        };
      }
    }
  }
}
