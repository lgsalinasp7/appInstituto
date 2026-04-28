/**
 * Sentry client-side initialization.
 *
 * Captura errores no manejados en el browser. Filtra ruido comun
 * (extensiones, network aborted) para reducir volumen de eventos.
 *
 * Solo se inicializa si NEXT_PUBLIC_SENTRY_DSN esta presente en el entorno.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    // Sample rates: alto en dev para debug, bajo en prod para no saturar.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // No enviar PII por defecto (ips, headers de auth, etc.).
    sendDefaultPii: false,

    // Filtrar ruido comun de browser que no es accionable.
    ignoreErrors: [
      // Extensiones de browser
      "top.GLOBALS",
      /chrome-extension:\/\//,
      /moz-extension:\/\//,
      /safari-extension:\/\//,
      // Network abortado por usuario
      "AbortError",
      "Network request failed",
      "NetworkError",
      "Failed to fetch",
      "Load failed",
      // ResizeObserver loops (no actionable)
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      // Errores de scripts third-party
      "Non-Error promise rejection captured",
    ],

    denyUrls: [
      // Browser extensions
      /chrome-extension:\/\//i,
      /moz-extension:\/\//i,
      /safari-extension:\/\//i,
      // Analytics / tag managers
      /googletagmanager\.com/i,
      /google-analytics\.com/i,
    ],

    beforeSend(event, hint) {
      // Filtrar errores de extensiones que llegan via stacktrace.
      const frames = event.exception?.values?.[0]?.stacktrace?.frames;
      if (
        frames?.some((frame) =>
          frame.filename?.match(/^(chrome|moz|safari)-extension:\/\//),
        )
      ) {
        return null;
      }

      // En desarrollo, log a consola pero no enviar a Sentry.
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn("[Sentry dev]", hint?.originalException ?? event);
        return null;
      }

      return event;
    },
  });
}
