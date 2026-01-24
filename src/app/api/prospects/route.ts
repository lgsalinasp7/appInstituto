import { NextRequest, NextResponse } from "next/server";
import { ProspectService } from "@/modules/prospects";
import { createProspectSchema } from "@/modules/prospects/schemas";
import type { ProspectStatus } from "@/modules/prospects";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      search: searchParams.get("search") || undefined,
      status: (searchParams.get("status") as ProspectStatus) || undefined,
      programId: searchParams.get("programId") || undefined,
      advisorId: searchParams.get("advisorId") || undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
    };

    const result = await ProspectService.getProspects(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching prospects:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener prospectos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = createProspectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos inválidos",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const prospect = await ProspectService.createProspect(validationResult.data);

    return NextResponse.json({
      success: true,
      data: prospect,
      message: "Prospecto registrado exitosamente",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating prospect:", error);
    return NextResponse.json(
      { success: false, error: "Error al registrar prospecto" },
      { status: 500 }
    );
  }
}
