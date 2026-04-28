import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { logApiStart, logApiSuccess, logApiError } from "@/lib/api-logger";

export async function POST(request: NextRequest) {
  const ctx = logApiStart(request, "auth_logout");
  const startedAt = Date.now();
  try {
    await destroySession();
    logApiSuccess(ctx, "auth_logout", { duration: Date.now() - startedAt });
    return NextResponse.json({ success: true, message: "Sesion cerrada exitosamente" });
  } catch (error) {
    logApiError(ctx, "auth_logout", { error });
    return NextResponse.json(
      { success: false, error: "Error al cerrar sesion" },
      { status: 500 }
    );
  }
}
