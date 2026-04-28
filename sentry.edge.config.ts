/**
 * Sentry edge runtime initialization.
 *
 * Para middleware y rutas con `runtime = "edge"`. Mismo filtrado de 4xx
 * que el config de servidor.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    sendDefaultPii: false,

    beforeSend(event, hint) {
      const error = hint?.originalException;
      const status = extractStatus(error);
      if (status !== null && status >= 400 && status < 500) {
        return null;
      }
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
