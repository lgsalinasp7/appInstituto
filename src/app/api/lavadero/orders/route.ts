import { NextRequest, NextResponse } from "next/server";
import { withLavaderoAuth } from "@/lib/api-auth";
import { listOrders, createOrder } from "@/modules/lavadero/services/lavadero-order.service";
import { createOrderSchema } from "@/modules/lavadero/schemas";
import type { LavaderoOrderStatus } from "@prisma/client";

export const GET = withLavaderoAuth(
  ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"],
  async (request, _user, tenantId) => {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") as LavaderoOrderStatus) || undefined;
    const dateFrom = searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined;
    const dateTo = searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined;
    const customerId = searchParams.get("customerId") || undefined;
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "50");

    const data = await listOrders(tenantId, { status, dateFrom, dateTo, customerId, page, limit });
    return NextResponse.json({ success: true, data });
  }
);

export const POST = withLavaderoAuth(
  ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"],
  async (request, user, tenantId) => {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = await createOrder(parsed.data, user.id, tenantId);
    return NextResponse.json({ success: true, data, message: "Orden creada" }, { status: 201 });
  }
);
