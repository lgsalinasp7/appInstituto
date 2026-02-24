import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { MargyService } from '@/modules/agents/services/margy.service';
import { agentChatSchema } from '@/modules/agents/schemas';
import { prisma } from '@/lib/prisma';
import { ChatService } from '@/modules/chat/services/chat.service';
import { AiAgentService } from '@/modules/chat/services/ai-agent.service';
import { ZodError } from 'zod';

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    const validated = agentChatSchema.parse(body);
    let dataTenantId = user.tenantId;
    let metricsTenantId = user.tenantId;

    // 1) Tenant user: usa su tenantId
    // 2) Si llega slug explícito en headers, resolverlo
    // 3) Platform admin sin tenant: fallback al primer tenant activo
    if (!dataTenantId) {
      const tenantSlug = req.headers.get('x-tenant-slug');

      if (tenantSlug && tenantSlug !== 'admin') {
        const tenantFromSlug = await prisma.tenant.findUnique({
          where: { slug: tenantSlug },
          select: { id: true },
        });
        dataTenantId = tenantFromSlug?.id ?? null;
      }
    }

    if (!dataTenantId) {
      const userWithPlatformRole = await prisma.user.findUnique({
        where: { id: user.id },
        select: { platformRole: true },
      });

      if (!userWithPlatformRole?.platformRole) {
        return Response.json(
          { success: false, error: 'No se pudo determinar el tenant para el agente' },
          { status: 401 }
        );
      }

      const defaultTenant = await prisma.tenant.findFirst({
        where: { status: 'ACTIVO' },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });

      if (!defaultTenant) {
        return Response.json(
          { success: false, error: 'No hay tenants activos configurados' },
          { status: 400 }
        );
      }

      dataTenantId = defaultTenant.id;
    }

    // Para métricas de plataforma, intentamos usar tenant "kaledsoft" si existe.
    // Si no existe, usamos el tenant de datos como fallback.
    if (!metricsTenantId) {
      const kaledsoftTenant = await prisma.tenant.findUnique({
        where: { slug: 'kaledsoft' },
        select: { id: true },
      });
      metricsTenantId = kaledsoftTenant?.id ?? dataTenantId;
    }

    const conversation = await ChatService.createConversation(
      user.id,
      metricsTenantId!,
      { title: 'Margy Admin Chat' }
    );

    await ChatService.addMessage(
      {
        conversationId: conversation.id,
        role: 'user',
        content: validated.message,
      },
      user.id,
      metricsTenantId!
    );

    const result = await MargyService.chat(
      validated.message,
      validated.history || [],
      dataTenantId!,
      validated.prospectId,
      async ({ text, usage, model }) => {
        const assistantMessage = await ChatService.addMessage(
          {
            conversationId: conversation.id,
            role: 'assistant',
            content: text || '',
          },
          user.id,
          metricsTenantId!
        );

        if (usage && assistantMessage.id) {
          await AiAgentService.recordTokenUsage(assistantMessage.id, {
            modelUsed: model || 'unknown',
            inputTokens: usage.inputTokens || 0,
            outputTokens: usage.outputTokens || 0,
            cached: false,
          });
        }
      }
    );

    // Streaming response
    return result.toTextStreamResponse();
  } catch (error: any) {
    if (error instanceof ZodError) {
      return Response.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in Margy chat:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
