import { NextResponse } from "next/server";
import { CommitmentService } from "@/modules/commitments/services/commitment.service";
import { CommitmentStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = statusParam as CommitmentStatus | undefined;
    const studentId = searchParams.get("studentId") || undefined;

    // Filtros de fecha (opcional)
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;

    const data = await CommitmentService.getCommitments({
      status,
      studentId,
      startDate,
      endDate
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching commitments:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener compromisos" },
      { status: 500 }
    );
  }
}
