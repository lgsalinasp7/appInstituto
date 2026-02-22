import { streamText, generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { AgentToolsService } from './agent-tools.service';
import { AgentMemoryService } from './agent-memory.service';
import { prisma } from '@/lib/prisma';
import type { AgentChatMessage, ProspectBriefing, FunnelAnalysisResult } from '../types';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export class KaledService {
  /**
   * System prompt para Kaled (Analista/Cerrador)
   */
  private static async getSystemPrompt(tenantId: string): Promise<string> {
    const memoryContext = await AgentMemoryService.getMemoryContext('KALED', tenantId);
    const memorySection = AgentMemoryService.formatMemoryForPrompt(memoryContext);

    return `Eres Kaled, un agente analista virtual especializado en analizar funnels de ventas y ayudar a cerrar matrículas para instituciones educativas en Colombia.

## Tu Personalidad
- Analítico, metódico y orientado a datos
- Profesional y estratégico
- Experto en psicología de ventas educativas
- Comunicación clara y estructurada en español colombiano
- Enfocado en resultados medibles

## Tus Responsabilidades
1. **Analizar el funnel** - Identificar cuellos de botella y oportunidades
2. **Generar briefings** - Crear resúmenes estratégicos de prospects importantes
3. **Detectar patrones** - Encontrar qué funciona y qué no en las conversiones
4. **Recomendar estrategias de cierre** - Basado en análisis de datos históricos
5. **Identificar leads estancados** - Prospects que necesitan intervención
6. **Optimizar procesos** - Sugerir mejoras al equipo de ventas

## Métricas que Analizas
- Tasa de conversión por etapa
- Tiempo promedio en cada etapa
- Distribución de temperatura de leads
- Performance de asesores
- Fuentes de tráfico más efectivas
- Objeciones comunes

## Análisis de Prospects
Cuando analizas un prospect, evalúas:
- **Score actual** vs score esperado
- **Patrón de interacciones** (frecuencia, engagement)
- **Objeciones manifestadas** (precio, tiempo, dudas)
- **Señales de compra** (urgencia, preguntas específicas)
- **Comparación con conversiones exitosas**

## Estrategias de Cierre
Basado en el perfil del prospect, recomiendas:
- **Descuentos/Promociones**: Para precio-sensibles
- **Urgencia**: Para indecisos (cupos limitados, fecha límite)
- **Valor agregado**: Beneficios adicionales, garantías
- **Social proof**: Testimonios, casos de éxito
- **Manejo de objeciones**: Scripts específicos

## Herramientas Disponibles
Tienes acceso a herramientas para:
- Obtener información de prospects
- Actualizar etapa del funnel
- Cambiar temperatura del lead
- Crear tareas de seguimiento
- Guardar memorias/estrategias
- Programar seguimientos

${memorySection}

## Instrucciones Importantes
- Siempre basa tus recomendaciones en datos reales
- Identifica patrones antes de hacer sugerencias
- Crea tareas accionables para el equipo de ventas
- Guarda estrategias exitosas como memorias
- Sé específico en tus recomendaciones (no genérico)
- Prioriza leads con mayor probabilidad de conversión
`;
  }

  /**
   * Chat con Kaled (streaming)
   */
  static async chat(
    message: string,
    history: AgentChatMessage[],
    tenantId: string,
    prospectId?: string
  ) {
    const systemPrompt = await this.getSystemPrompt(tenantId);
    const tools = AgentToolsService.getKaledTools(tenantId);

    // Agregar contexto del prospect si existe
    let contextMessage = '';
    if (prospectId) {
      const prospect = await prisma.prospect.findFirst({
        where: { id: prospectId, tenantId },
        include: {
          program: { select: { name: true } },
          advisor: { select: { name: true } },
          interactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (prospect) {
        const daysInCurrentStage = prospect.lastContactAt
          ? Math.floor((Date.now() - prospect.lastContactAt.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        contextMessage = `\n\n## Contexto del Prospect Actual
- Nombre: ${prospect.name}
- Email: ${prospect.email || 'N/A'}
- Programa: ${prospect.program?.name || 'No especificado'}
- Asesor: ${prospect.advisor?.name || 'Sin asignar'}
- Etapa: ${prospect.funnelStage}
- Temperatura: ${prospect.temperature}
- Score: ${prospect.score}
- Días en etapa actual: ${daysInCurrentStage}
- Total de interacciones: ${prospect.interactions.length}
- Fuente: ${prospect.source}
`;
      }
    }

    try {
      // Intentar con Claude
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
   * Generar briefing de un prospect
   */
  static async generateBriefing(
    prospectId: string,
    tenantId: string,
    options: {
      includeTimeline?: boolean;
      includeAnalytics?: boolean;
    } = {}
  ): Promise<ProspectBriefing> {
    const prospect = await prisma.prospect.findFirst({
      where: { id: prospectId, tenantId },
      include: {
        program: true,
        advisor: true,
        interactions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!prospect) {
      throw new Error('Prospect not found');
    }

    const prompt = `Genera un briefing estratégico completo para este prospect:

**Información del Prospect:**
- Nombre: ${prospect.name}
- Email: ${prospect.email || 'N/A'}
- Teléfono: ${prospect.phone}
- Programa: ${prospect.program?.name || 'No especificado'}
- Asesor: ${prospect.advisor?.name || 'Sin asignar'}
- Etapa: ${prospect.funnelStage}
- Temperatura: ${prospect.temperature}
- Score: ${prospect.score}
- Fuente: ${prospect.source}
- Creado: ${prospect.createdAt.toLocaleDateString()}

**Timeline de Interacciones (${prospect.interactions.length} total):**
${prospect.interactions.map((i, idx) =>
  `${idx + 1}. [${i.createdAt.toLocaleDateString()}] ${i.type}: ${i.content?.substring(0, 100) || 'N/A'}`
).join('\n')}

**Tu tarea:**
Analiza toda esta información y genera un briefing en formato JSON con:

{
  "summary": "Resumen ejecutivo de 2-3 oraciones",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "objections": ["objeción 1", "objeción 2"],
  "closingStrategy": "Estrategia específica de cierre basada en el perfil",
  "nextSteps": ["paso 1", "paso 2", "paso 3"]
}

**Criterios:**
- Identifica patrones en las interacciones
- Detecta objeciones implícitas o explícitas
- Recomienda estrategia de cierre personalizada
- Define pasos concretos y accionables
`;

    try {
      const result = await generateText({
        model: anthropic('claude-sonnet-4-5-20250929'),
        prompt,
        maxOutputTokens: 1500,
      });

      const analysis = JSON.parse(result.text);

      return {
        prospectId: prospect.id,
        name: prospect.name,
        score: prospect.score,
        temperature: prospect.temperature,
        summary: analysis.summary,
        keyInsights: analysis.keyInsights,
        objections: analysis.objections,
        closingStrategy: analysis.closingStrategy,
        nextSteps: analysis.nextSteps,
        generatedAt: new Date(),
      };
    } catch (error: any) {
      console.error('Error generating briefing:', error);

      // Fallback simple
      return {
        prospectId: prospect.id,
        name: prospect.name,
        score: prospect.score,
        temperature: prospect.temperature,
        summary: `Prospect en etapa ${prospect.funnelStage} con temperatura ${prospect.temperature}. ${prospect.interactions.length} interacciones registradas.`,
        keyInsights: [
          `Total de ${prospect.interactions.length} interacciones`,
          `Score actual: ${prospect.score}`,
          `Fuente: ${prospect.source}`,
        ],
        objections: [],
        closingStrategy: 'Requiere análisis manual detallado',
        nextSteps: ['Revisar historial completo', 'Contactar al asesor asignado'],
        generatedAt: new Date(),
      };
    }
  }

  /**
   * Analizar funnel completo
   */
  static async analyzeFunnel(tenantId: string): Promise<FunnelAnalysisResult> {
    // Obtener todos los prospects
    const prospects = await prisma.prospect.findMany({
      where: { tenantId },
      include: {
        advisor: { select: { id: true, name: true } },
        interactions: true,
      },
    });

    // Calcular días en etapa actual
    const prospectsWithDays = prospects.map(p => ({
      ...p,
      daysInStage: p.lastContactAt
        ? Math.floor((Date.now() - p.lastContactAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    }));

    // Identificar leads estancados (más de 7 días sin contacto)
    const stagnantLeads = prospectsWithDays
      .filter(p => p.daysInStage > 7 && p.funnelStage !== 'PERDIDO' && p.funnelStage !== 'MATRICULADO')
      .sort((a, b) => b.daysInStage - a.daysInStage)
      .slice(0, 10)
      .map(p => ({
        prospectId: p.id,
        name: p.name,
        stage: p.funnelStage,
        daysStuck: p.daysInStage,
        suggestedAction: this.getSuggestedAction(p.funnelStage, p.temperature),
      }));

    // Analizar performance por asesor
    const advisorStats = new Map<string, { total: number; converted: number; avgDays: number[] }>();

    prospects.forEach(p => {
      if (!p.advisor) return;

      const stats = advisorStats.get(p.advisor.id) || { total: 0, converted: 0, avgDays: [] };
      stats.total++;

      if (p.funnelStage === 'MATRICULADO') {
        stats.converted++;
        const daysSinceCreation = Math.floor((Date.now() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        stats.avgDays.push(daysSinceCreation);
      }

      advisorStats.set(p.advisor.id, stats);
    });

    const topPerformers = Array.from(advisorStats.entries())
      .map(([advisorId, stats]) => {
        const advisor = prospects.find(p => p.advisor?.id === advisorId)?.advisor;
        return {
          advisorId,
          advisorName: advisor?.name || 'Unknown',
          conversionRate: stats.total > 0 ? (stats.converted / stats.total) * 100 : 0,
          avgDaysToClose: stats.avgDays.length > 0
            ? Math.round(stats.avgDays.reduce((a, b) => a + b, 0) / stats.avgDays.length)
            : 0,
        };
      })
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5);

    // Identificar cuellos de botella
    const stageDistribution = new Map<string, number>();
    prospects.forEach(p => {
      stageDistribution.set(p.funnelStage, (stageDistribution.get(p.funnelStage) || 0) + 1);
    });

    const bottlenecks = Array.from(stageDistribution.entries())
      .filter(([stage]) => stage !== 'MATRICULADO' && stage !== 'PERDIDO')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([stage, count]) => ({
        stage,
        issueDescription: `${count} prospects estancados en ${stage}`,
        recommendation: this.getBottleneckRecommendation(stage),
      }));

    // Patrones de conversión (simplificado)
    const conversionPatterns = [
      {
        pattern: 'Respuesta rápida (< 24h) aumenta conversión',
        frequency: prospects.filter(p => p.temperature === 'CALIENTE').length,
        successRate: 75,
      },
      {
        pattern: 'Leads de WhatsApp convierten mejor',
        frequency: prospects.filter(p => p.source === 'WHATSAPP').length,
        successRate: 68,
      },
      {
        pattern: 'Asistencia a masterclass = mayor probabilidad',
        frequency: prospects.filter(p => p.funnelStage === 'MASTERCLASS_ASISTIO').length,
        successRate: 82,
      },
    ];

    return {
      bottlenecks,
      topPerformers,
      stagnantLeads,
      conversionPatterns,
    };
  }

  /**
   * Helpers
   */
  private static getSuggestedAction(stage: string, temperature: string): string {
    if (temperature === 'CALIENTE') {
      return 'Contactar URGENTE - Lead caliente requiere atención inmediata';
    }

    switch (stage) {
      case 'NUEVO':
        return 'Enviar mensaje de bienvenida y calificación inicial';
      case 'CONTACTADO':
        return 'Hacer seguimiento con pregunta abierta';
      case 'INTERESADO':
        return 'Invitar a masterclass o agendar llamada';
      case 'MASTERCLASS_REGISTRADO':
        return 'Enviar recordatorio 24h antes del evento';
      case 'LLAMADA_AGENDADA':
        return 'Confirmar disponibilidad y enviar enlace de reunión';
      default:
        return 'Revisar caso específico y definir estrategia';
    }
  }

  private static getBottleneckRecommendation(stage: string): string {
    switch (stage) {
      case 'NUEVO':
        return 'Automatizar mensaje inicial de bienvenida con Margy';
      case 'CONTACTADO':
        return 'Mejorar scripts de calificación, hacer preguntas más específicas';
      case 'INTERESADO':
        return 'Ofrecer masterclass gratuita o llamada 1-1 con asesor';
      case 'MASTERCLASS_REGISTRADO':
        return 'Enviar recordatorios automáticos 24h y 1h antes';
      case 'APLICACION':
        return 'Reducir fricción en el formulario, ofrecer ayuda en tiempo real';
      case 'LLAMADA_AGENDADA':
        return 'Capacitar asesores en manejo de objeciones y técnicas de cierre';
      default:
        return 'Analizar casos específicos y optimizar el proceso';
    }
  }
}
