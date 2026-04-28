import { NextRequest, NextResponse } from "next/server";
import { withTenantAuth, withTenantAuthAndCSRF } from "@/lib/api-auth";
import {
  listPaymentCommitments,
  createPaymentCommitment,
} from "@/modules/cartera/services/payment-commitment.service";
import { createPaymentCommitmentSchema } from "@/modules/cartera/schemas";
import type { CommitmentStatus } from "@/modules/cartera/types";
import {
  logApiStart,
  logApiSuccess,
  logApiError,
} from "@/lib/api-logger";

export const GET = withTenantAuth(
  async (request: NextRequest, user, tenantId) => {
    const ctx = logApiStart(
      request,
      "listar_compromisos_pago",
      undefined,
      { userId: user.id, tenantId }
    );
    const startedAt = Date.now();
    try {
      const sp = request.nextUrl.searchParams;
      const result = await listPaymentCommitments({
        tenantId,
        studentId: sp.get("studentId") || undefined,
        status: (sp.get("status") as CommitmentStatus) || undefined,
        page: Number(sp.get("page")) || 1,
        limit: Number(sp.get("limit")) || 20,
      });

      logApiSuccess(ctx, "listar_compromisos_pago", {
        duration: Date.now() - startedAt,
        recordCount: result.items.length,
      });
      return NextResponse.json({ success: true, data: result });
    } catch (error) {
      logApiError(ctx, "listar_compromisos_pago", { error });
      return NextResponse.json(
        { success: false, error: "Error al listar compromisos" },
        { status: 500 }
      );
    }
  }
);

export const POST = withTenantAuthAndCSRF(
  async (request: NextRequest, user, tenantId) => {
    const body = await request.json().catch(() => ({}));
    const ctx = logApiStart(
      request,
      "crear_compromiso_pago",
      { body },
      { userId: user.id, tenantId }
    );
    const startedAt = Date.now();
    try {
      const parsed = createPaymentCommitmentSchema.safeParse(body);
      if (!parsed.success) {
        logApiError(ctx, "crear_compromiso_pago", {
          error: new Error("Validación fallida"),
          context: { issues: parsed.error.flatten().fieldErrors },
        });
        return NextResponse.json(
          {
            success: false,
            error: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      const data = await createPaymentCommitment(parsed.data, tenantId);

      logApiSuccess(ctx, "crear_compromiso_pago", {
        duration: Date.now() - startedAt,
        resultId: data.id,
      });
      return NextResponse.json(
        { success: true, data, message: "Compromiso creado" },
        { status: 201 }
      );
    } catch (error) {
      logApiError(ctx, "crear_compromiso_pago", { error });
      const message =
        error instanceof Error ? error.message : "Error al crear compromiso";
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }
  }
);
