/**
 * API Route: /api/roles
 * List available roles
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withTenantAuth } from "@/lib/api-auth";

/**
 * GET /api/roles
 * List all roles for the current tenant
 */
export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const roles = await prisma.role.findMany({
    where: {
      tenantId, // Filtrar por tenant
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json({
    success: true,
    data: roles,
  });
});
