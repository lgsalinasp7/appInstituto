/**
 * Sentry server-side (Node.js runtime) initialization.
 *
 * Captura errores 5xx de API routes y server components. Filtra
 * 4xx (errores de cliente, no accionables para infra).
 *
 * Solo se inicializa si SENTRY_DSN esta presente.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    sendDefaultPii: false,

    // Filtrar 4xx: solo nos importan 5xx en server.
    beforeSend(event, hint) {
      const error = hint?.originalException;

      // Detectar errores HTTP por shape comun (status / statusCode).
      const status = extractStatus(error);
      if (status !== null && status >= 400 && status < 500) {
        return null;
      }

      // En desarrollo, no enviar (ya se ven en consola del server).
      if (process.env.NODE_ENV !== "production") {
        return null;
      }

      return event;
    },
  });
}

function extractStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const e = error as { status?: unknown; statusCode?: unknown };
  if (typeof e.status === "number") return e.status;
  if (typeof e.statusCode === "number") return e.statusCode;
  return null;
}
