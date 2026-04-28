/**
 * Next.js instrumentation hook.
 *
 * Carga las configuraciones de Sentry segun el runtime activo
 * (Node.js o edge). Se ejecuta una sola vez al arranque del servidor.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Hook recomendado para capturar errores de React Server Components
// y nested layouts en Next.js 15+.
export const onRequestError = Sentry.captureRequestError;
