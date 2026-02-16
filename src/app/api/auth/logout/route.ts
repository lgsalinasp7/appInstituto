import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ success: true, message: "Sesion cerrada exitosamente" });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { success: false, error: "Error al cerrar sesion" },
      { status: 500 }
    );
  }
}
