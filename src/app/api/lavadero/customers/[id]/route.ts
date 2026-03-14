import { NextRequest, NextResponse } from "next/server";
import { withLavaderoAuth } from "@/lib/api-auth";
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "@/modules/lavadero/services/lavadero-customer.service";
import { updateCustomerSchema } from "@/modules/lavadero/schemas";

export const GET = withLavaderoAuth(
  ["LAVADERO_ADMIN"],
  async (_request, _user, tenantId, context) => {
    const { id } = await context!.params;
    const data = await getCustomerById(id, tenantId);
    if (!data) {
      return NextResponse.json({ success: false, error: "Cliente no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  }
);

export const PUT = withLavaderoAuth(
  ["LAVADERO_ADMIN"],
  async (request, _user, tenantId, context) => {
    const { id } = await context!.params;
    const body = await request.json();
    const parsed = updateCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = await updateCustomer(id, parsed.data, tenantId);
    return NextResponse.json({ success: true, data, message: "Cliente actualizado" });
  }
);

export const DELETE = withLavaderoAuth(
  ["LAVADERO_ADMIN"],
  async (_request, _user, tenantId, context) => {
    const { id } = await context!.params;
    await deleteCustomer(id, tenantId);
    return NextResponse.json({ success: true, message: "Cliente eliminado" });
  }
);
