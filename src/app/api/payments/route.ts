import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/modules/payments";
import { createPaymentSchema } from "@/modules/payments/schemas";
import type { PaymentMethod } from "@/modules/payments";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      studentId: searchParams.get("studentId") || undefined,
      advisorId: searchParams.get("advisorId") || undefined,
      search: searchParams.get("search") || undefined,
      method: (searchParams.get("method") as PaymentMethod) || undefined,
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
    };

    const result = await PaymentService.getPayments(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener pagos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = createPaymentSchema.safeParse(body);

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

    const result = await PaymentService.createPayment(validationResult.data);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Pago registrado exitosamente",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { success: false, error: "Error al registrar pago" },
      { status: 500 }
    );
  }
}
