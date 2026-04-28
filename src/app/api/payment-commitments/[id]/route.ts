import { NextRequest, NextResponse } from "next/server";
import { withTenantAuth, withTenantAuthAndCSRF } from "@/lib/api-auth";
import {
  getPaymentCommitmentById,
  updatePaymentCommitment,
  cancelPaymentCommitment,
} from "@/modules/cartera/services/payment-commitment.service";
import { updatePaymentCommitmentSchema } from "@/modules/cartera/schemas";
import {
  logApiStart,
  logApiSuccess,
  logApiError,
} from "@/lib/api-logger";

export const GET = withTenantAuth(
  async (request: NextRequest, user, tenantId, context) => {
    const { id } = await context!.params;
    const ctx = logApiStart(
      request,
      "obtener_compromiso_pago",
      { params: { id } },
      { userId: user.id, tenantId }
    );
    const startedAt = Date.now();
    try {
      const data = await getPaymentCommitmentById(id, tenantId);
      if (!data) {
        return NextResponse.json(
          { success: false, error: "Compromiso no encontrado" },
          { status: 404 }
        );
      }
      logApiSuccess(ctx, "obtener_compromiso_pago", {
        duration: Date.now() - startedAt,
        resultId: data.id,
      });
      return NextResponse.json({ success: true, data });
    } catch (error) {
      logApiError(ctx, "obtener_compromiso_pago", { error });
      return NextResponse.json(
        { success: false, error: "Error al obtener compromiso" },
        { status: 500 }
      );
    }
  }
);

export const PATCH = withTenantAuthAndCSRF(
  async (request: NextRequest, user, tenantId, context) => {
    const { id } = await context!.params;
    const body = await request.json().catch(() => ({}));
    const ctx = logApiStart(
      request,
      "actualizar_compromiso_pago",
      { params: { id }, body },
      { userId: user.id, tenantId }
    );
    const startedAt = Date.now();
    try {
      const parsed = updatePaymentCommitmentSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const data = await updatePaymentCommitment(id, parsed.data, tenantId);
      logApiSuccess(ctx, "actualizar_compromiso_pago", {
        duration: Date.now() - startedAt,
        resultId: data.id,
      });
      return NextResponse.json({
        success: true,
        data,
        message: "Compromiso actualizado",
      });
    } catch (error) {
      logApiError(ctx, "actualizar_compromiso_pago", { error });
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar compromiso";
      const status = message.includes("no encontrado") ? 404 : 400;
      return NextResponse.json(
        { success: false, error: message },
        { status }
      );
    }
  }
);

export const DELETE = withTenantAuthAndCSRF(
  async (request: NextRequest, user, tenantId, context) => {
    const { id } = await context!.params;
    const ctx = logApiStart(
      request,
      "cancelar_compromiso_pago",
      { params: { id } },
      { userId: user.id, tenantId }
    );
    const startedAt = Date.now();
    try {
      await cancelPaymentCommitment(id, tenantId);
      logApiSuccess(ctx, "cancelar_compromiso_pago", {
        duration: Date.now() - startedAt,
        resultId: id,
      });
      return NextResponse.json({
        success: true,
        message: "Compromiso cancelado",
      });
    } catch (error) {
      logApiError(ctx, "cancelar_compromiso_pago", { error });
      const message =
        error instanceof Error
          ? error.message
          : "Error al cancelar compromiso";
      const status = message.includes("no encontrado") ? 404 : 400;
      return NextResponse.json(
        { success: false, error: message },
        { status }
      );
    }
  }
);
