/**
 * Tenant Stats API Route
 */

import { NextResponse } from 'next/server';
import { TenantsService } from '@/modules/tenants';

// GET /api/admin/tenants/stats
export async function GET() {
  try {
    const stats = await TenantsService.getStats();

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching tenant stats:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
