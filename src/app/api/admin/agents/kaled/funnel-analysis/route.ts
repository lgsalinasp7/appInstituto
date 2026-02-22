import { NextRequest } from 'next/server';
import { withTenantAuth } from '@/lib/api-auth';
import { KaledService } from '@/modules/agents/services/kaled.service';

export const GET = withTenantAuth(async (req: NextRequest, user, tenantId) => {
  try {
    const analysis = await KaledService.analyzeFunnel(tenantId);

    return Response.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Error analyzing funnel:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
