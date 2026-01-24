import { NextRequest, NextResponse } from "next/server";
import { ProspectService } from "@/modules/prospects";
import { z } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

const convertSchema = z.object({
  documentType: z.string().default("CC"),
  documentNumber: z.string().min(5, "El documento debe tener al menos 5 caracteres"),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email().optional().or(z.literal("")),
  enrollmentDate: z.coerce.date(),
  initialPayment: z.coerce.number().min(0),
  totalProgramValue: z.coerce.number().positive(),
});

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validationResult = convertSchema.safeParse(body);

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

    const student = await ProspectService.convertToStudent(id, validationResult.data);

    return NextResponse.json({
      success: true,
      data: student,
      message: "Prospecto convertido a estudiante exitosamente",
    });
  } catch (error) {
    console.error("Error converting prospect:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al convertir prospecto" },
      { status: 500 }
    );
  }
}
