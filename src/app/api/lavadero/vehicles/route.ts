import { NextRequest, NextResponse } from "next/server";
import { withLavaderoAuth } from "@/lib/api-auth";
import { listVehicles, createVehicle, findByPlate } from "@/modules/lavadero/services/lavadero-vehicle.service";
import { createVehicleSchema } from "@/modules/lavadero/schemas";

export const GET = withLavaderoAuth(
  ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"],
  async (request, _user, tenantId) => {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const customerId = searchParams.get("customerId") || undefined;
    const plate = searchParams.get("plate") || undefined;
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");

    // Búsqueda directa por placa
    if (plate) {
      const vehicle = await findByPlate(plate, tenantId);
      return NextResponse.json({ success: true, data: vehicle });
    }

    const data = await listVehicles(tenantId, search, customerId, page, limit);
    return NextResponse.json({ success: true, data });
  }
);

export const POST = withLavaderoAuth(
  ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"],
  async (request, _user, tenantId) => {
    const body = await request.json();
    const parsed = createVehicleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = await createVehicle(parsed.data, tenantId);
    return NextResponse.json({ success: true, data, message: "Vehículo creado" }, { status: 201 });
  }
);
