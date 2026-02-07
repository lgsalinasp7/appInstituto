import { NextRequest, NextResponse } from "next/server";
import { CommitmentService } from "@/modules/commitments/services/commitment.service";
import { CommitmentStatus } from "@prisma/client";
import { withTenantAuth } from "@/lib/api-auth";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const status = statusParam as CommitmentStatus | undefined;
  const studentId = searchParams.get("studentId") || undefined;

  // Filtros de fecha (opcional)
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  const startDate = startDateParam ? new Date(startDateParam) : undefined;
  const endDate = endDateParam ? new Date(endDateParam) : undefined;

  const data = await CommitmentService.getCommitments({
    status,
    studentId,
    startDate,
    endDate,
    limit: 50 // Mayor límite para las tablas de recaudos
  });

  return NextResponse.json({ success: true, data });
});
