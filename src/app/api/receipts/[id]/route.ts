import { NextRequest, NextResponse } from "next/server";
import { ReceiptService } from "@/modules/receipts";
import { withTenantAuth } from "@/lib/api-auth";

interface Params {
  params: Promise<Record<string, string>>;
}

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId, context?: { params: Promise<Record<string, string>> }) => {
  const { id } = await context!.params;
  
  let receipt = await ReceiptService.getReceiptByNumber(id);
  
  if (!receipt) {
    receipt = await ReceiptService.getReceiptByPaymentId(id);
  }

  if (!receipt) {
    return NextResponse.json(
      { success: false, error: "Recibo no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: receipt,
  });
});
