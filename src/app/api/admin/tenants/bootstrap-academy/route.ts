import { NextResponse } from "next/server";

/**
 * @deprecated Use POST /api/admin/products/[id]/deploy instead.
 * This endpoint has been replaced by the ProductTemplate deploy system.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Este endpoint está deprecado. Use POST /api/admin/products/[id]/deploy para desplegar tenants desde plantillas de producto.",
    },
    { status: 410 }
  );
}
