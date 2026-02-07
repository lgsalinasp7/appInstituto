import { NextRequest, NextResponse } from "next/server";
import { CarteraService } from "@/modules/cartera";
import { withTenantAuthAndCSRF } from "@/lib/api-auth";

interface Params {
  params: Promise<Record<string, string>>;
}

export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;

  const commitment = await CarteraService.markAsPaid(id);

  return NextResponse.json({
    success: true,
    data: commitment,
    message: "Compromiso marcado como pagado",
  });
});
