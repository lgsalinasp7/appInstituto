import { NextRequest, NextResponse } from "next/server";
import { withLavaderoAuth } from "@/lib/api-auth";
import { listCustomers, createCustomer } from "@/modules/lavadero/services/lavadero-customer.service";
import { createCustomerSchema } from "@/modules/lavadero/schemas";

export const GET = withLavaderoAuth(
  ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"],
  async (request, _user, tenantId) => {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");

    const data = await listCustomers(tenantId, search, page, limit);
    return NextResponse.json({ success: true, data });
  }
);

export const POST = withLavaderoAuth(
  ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"],
  async (request, _user, tenantId) => {
    const body = await request.json();
    const parsed = createCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = await createCustomer(parsed.data, tenantId);
    return NextResponse.json({ success: true, data, message: "Cliente creado" }, { status: 201 });
  }
);
