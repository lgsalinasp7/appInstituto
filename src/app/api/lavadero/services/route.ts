import { NextRequest, NextResponse } from "next/server";
import { withLavaderoAuth } from "@/lib/api-auth";
import { listServices, createService } from "@/modules/lavadero/services/lavadero-service.service";
import { createServiceSchema } from "@/modules/lavadero/schemas";

export const GET = withLavaderoAuth(
  ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"],
  async (request, _user, tenantId) => {
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get("active") === "true";

    const data = await listServices(tenantId, onlyActive);
    return NextResponse.json({ success: true, data });
  }
);

export const POST = withLavaderoAuth(
  ["LAVADERO_ADMIN"],
  async (request, _user, tenantId) => {
    const body = await request.json();
    const parsed = createServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = await createService(parsed.data, tenantId);
    return NextResponse.json({ success: true, data, message: "Servicio creado" }, { status: 201 });
  }
);
