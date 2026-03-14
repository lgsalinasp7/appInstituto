import { NextRequest, NextResponse } from "next/server";
import { withLavaderoAuth } from "@/lib/api-auth";
import { getOrderById } from "@/modules/lavadero/services/lavadero-order.service";

export const GET = withLavaderoAuth(
  ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"],
  async (_request, _user, tenantId, context) => {
    const { id } = await context!.params;
    const data = await getOrderById(id, tenantId);
    if (!data) {
      return NextResponse.json({ success: false, error: "Orden no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  }
);
