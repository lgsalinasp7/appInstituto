/**
 * API Route: /api/roles
 * List available roles
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/roles
 * List all roles
 */
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("Error listing roles:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener roles" },
      { status: 500 }
    );
  }
}
