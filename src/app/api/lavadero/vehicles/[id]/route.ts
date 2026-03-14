import { NextRequest, NextResponse } from "next/server";
import { withLavaderoAuth } from "@/lib/api-auth";
import {
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "@/modules/lavadero/services/lavadero-vehicle.service";
import { updateVehicleSchema } from "@/modules/lavadero/schemas";

export const GET = withLavaderoAuth(
  ["LAVADERO_ADMIN"],
  async (_request, _user, tenantId, context) => {
    const { id } = await context!.params;
    const data = await getVehicleById(id, tenantId);
    if (!data) {
      return NextResponse.json({ success: false, error: "Vehículo no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  }
);

export const PUT = withLavaderoAuth(
  ["LAVADERO_ADMIN"],
  async (request, _user, tenantId, context) => {
    const { id } = await context!.params;
    const body = await request.json();
    const parsed = updateVehicleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = await updateVehicle(id, parsed.data, tenantId);
    return NextResponse.json({ success: true, data, message: "Vehículo actualizado" });
  }
);

export const DELETE = withLavaderoAuth(
  ["LAVADERO_ADMIN"],
  async (_request, _user, tenantId, context) => {
    const { id } = await context!.params;
    await deleteVehicle(id, tenantId);
    return NextResponse.json({ success: true, message: "Vehículo eliminado" });
  }
);
