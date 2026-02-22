import { NextRequest } from 'next/server';
import { withTenantAuth } from '@/lib/api-auth';
import { KaledService } from '@/modules/agents/services/kaled.service';
import { agentChatSchema } from '@/modules/agents/schemas';
import { ZodError } from 'zod';

export const POST = withTenantAuth(async (req: NextRequest, user, tenantId) => {
  try {
    const body = await req.json();
    const validated = agentChatSchema.parse(body);

    const result = await KaledService.chat(
      validated.message,
      validated.history || [],
      tenantId,
      validated.prospectId
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

    console.error('Error in Kaled chat:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
