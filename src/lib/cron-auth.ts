/**
 * withCronAuth — Wrapper estandar para autenticacion de cron routes.
 *
 * Estandariza el patron de autenticacion para todas las rutas en
 * `src/app/api/cron/*` usando el header `Authorization: Bearer ${CRON_SECRET}`.
 *
 * Reglas:
 * - Si `CRON_SECRET` no esta configurado en el entorno -> 503.
 * - Si el header no coincide o falta -> 401 con `{ success: false, error }`.
 * - Si coincide -> ejecuta el handler (logging via api-logger es responsabilidad
 *   del handler para mantener correlacion completa).
 *
 * Uso:
 * ```ts
 * import { withCronAuth } from "@/lib/cron-auth";
 *
 * export const GET = withCronAuth("cron.notifications", async (request, ctx) => {
 *   // logica del cron, ctx ya tiene requestId/operation
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import {
  logApiStart,
  logApiSuccess,
  logApiError,
} from "@/lib/api-logger";
import type { ApiContext } from "@/lib/api-context";

export type CronHandler = (
  request: NextRequest,
  ctx: ApiContext
) => Promise<Response> | Response;

/**
 * Valida CRON_SECRET y delega al handler con logging estructurado.
 *
 * @param operation - Nombre de operacion para los logs (e.g. "cron.notifications")
 * @param handler - Handler que recibe request y ApiContext
 */
export function withCronAuth(
  operation: string,
  handler: CronHandler
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest): Promise<Response> => {
    const ctx = logApiStart(request, operation);
    const startedAt = Date.now();

    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || typeof cronSecret !== "string" || cronSecret.length === 0) {
      logApiError(ctx, operation, {
        error: new Error("CRON_SECRET no esta configurado"),
      });
      return NextResponse.json(
        { success: false, error: "Servicio no configurado" },
        { status: 503 }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      logApiError(ctx, operation, {
        error: new Error("Intento de acceso no autorizado al cron"),
      });
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    try {
      const response = await handler(request, ctx);
      logApiSuccess(ctx, operation, {
        duration: Date.now() - startedAt,
      });
      return response;
    } catch (error) {
      logApiError(ctx, operation, { error });
      return NextResponse.json(
        { success: false, error: "Error interno en el cron" },
        { status: 500 }
      );
    }
  };
}
