import { NextRequest, NextResponse } from "next/server";
import { withLavaderoAuth } from "@/lib/api-auth";
import { updateOrderStatus } from "@/modules/lavadero/services/lavadero-order.service";
import { updateOrderStatusSchema } from "@/modules/lavadero/schemas";

export const PATCH = withLavaderoAuth(
  ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"],
  async (request, _user, tenantId, context) => {
    const { id } = await context!.params;
    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = await updateOrderStatus(id, parsed.data.status, tenantId);
    return NextResponse.json({ success: true, data, message: `Estado actualizado a ${parsed.data.status}` });
  }
);
