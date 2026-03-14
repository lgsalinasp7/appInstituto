import { NextRequest, NextResponse } from "next/server";
import { withLavaderoAuth } from "@/lib/api-auth";
import { updateService, deleteService } from "@/modules/lavadero/services/lavadero-service.service";
import { updateServiceSchema } from "@/modules/lavadero/schemas";

export const PUT = withLavaderoAuth(
  ["LAVADERO_ADMIN"],
  async (request, _user, tenantId, context) => {
    const { id } = await context!.params;
    const body = await request.json();
    const parsed = updateServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = await updateService(id, parsed.data, tenantId);
    return NextResponse.json({ success: true, data, message: "Servicio actualizado" });
  }
);

export const DELETE = withLavaderoAuth(
  ["LAVADERO_ADMIN"],
  async (_request, _user, tenantId, context) => {
    const { id } = await context!.params;
    await deleteService(id, tenantId);
    return NextResponse.json({ success: true, message: "Servicio eliminado" });
  }
);
