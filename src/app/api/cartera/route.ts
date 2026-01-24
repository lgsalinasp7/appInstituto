import { NextRequest, NextResponse } from "next/server";
import { CarteraService } from "@/modules/cartera";
import type { CommitmentStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      advisorId: searchParams.get("advisorId") || undefined,
      status: (searchParams.get("status") as CommitmentStatus) || undefined,
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
    };

    const result = await CarteraService.getCommitments(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching cartera:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener cartera" },
      { status: 500 }
    );
  }
}
