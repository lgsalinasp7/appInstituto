import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/modules/payments";
import { createPaymentSchema } from "@/modules/payments/schemas";
import type { PaymentMethod } from "@/modules/payments";
import { withTenantAuth, withTenantAuthAndCSRF } from "@/lib/api-auth";
import { recordCommitmentPaymentSchema } from "@/modules/cartera/schemas";
import { recordPaymentForCommitment } from "@/modules/cartera/services/payment-commitment.service";
import { logApiStart, logApiSuccess, logApiError } from "@/lib/api-logger";

export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const searchParams = request.nextUrl.searchParams;

  const filters = {
    tenantId,
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
});

/**
 * POST /api/payments — Dual-mode:
 *  1. Si body incluye `commitmentId`, registra abono vinculado a un PaymentCommitment
 *     (Ola 2.7b — AbonoModal). Verifica tenant + monto exacto.
 *  2. Sino, mantiene flujo legacy `PaymentService.createPayment` con studentId.
 */
export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId) => {
  const body = await request.json().catch(() => ({}));

  if (body && typeof body === "object" && "commitmentId" in body) {
    const ctx = logApiStart(
      request,
      "registrar_abono_compromiso",
      { body: { ...body } },
      { userId: user.id, tenantId }
    );
    const startedAt = Date.now();

    const parsed = recordCommitmentPaymentSchema.safeParse(body);
    if (!parsed.success) {
      logApiError(ctx, "registrar_abono_compromiso", {
        error: new Error("Validacion fallida"),
        context: { issues: parsed.error.flatten().fieldErrors },
      });
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    try {
      const result = await recordPaymentForCommitment(parsed.data, tenantId, user.id);
      logApiSuccess(ctx, "registrar_abono_compromiso", {
        duration: Date.now() - startedAt,
        resultId: result.payment.id,
      });
      return NextResponse.json(
        {
          success: true,
          data: result,
          message: "Abono registrado y compromiso marcado como PAGADO",
        },
        { status: 201 }
      );
    } catch (error) {
      logApiError(ctx, "registrar_abono_compromiso", { error });
      const message = error instanceof Error ? error.message : "Error al registrar abono";
      const status =
        message.includes("no pertenece") || message.includes("no encontrado") ? 404 : 400;
      return NextResponse.json({ success: false, error: message }, { status });
    }
  }

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

  const result = await PaymentService.createPayment({ ...validationResult.data, tenantId });

  return NextResponse.json({
    success: true,
    data: result,
    message: "Pago registrado exitosamente",
  }, { status: 201 });
});
