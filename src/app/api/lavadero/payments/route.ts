import { NextRequest, NextResponse } from "next/server";
import { withLavaderoAuth } from "@/lib/api-auth";
import { createPayment, listPayments } from "@/modules/lavadero/services/lavadero-payment.service";
import { createPaymentSchema } from "@/modules/lavadero/schemas";

export const GET = withLavaderoAuth(
  ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"],
  async (request, _user, tenantId) => {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined;
    const dateTo = searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined;
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "50");

    const data = await listPayments(tenantId, { dateFrom, dateTo, page, limit });
    return NextResponse.json({ success: true, data });
  }
);

export const POST = withLavaderoAuth(
  ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"],
  async (request, user, tenantId) => {
    const body = await request.json();
    const parsed = createPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = await createPayment(parsed.data, user.id, tenantId);
    return NextResponse.json({ success: true, data, message: "Pago registrado" }, { status: 201 });
  }
);
