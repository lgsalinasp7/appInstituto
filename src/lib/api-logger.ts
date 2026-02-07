/**
 * API Logger - Logging Estructurado de Nivel Senior
 *
 * Proporciona logging con contexto completo, correlación de requests,
 * métricas útiles y sanitización automática de datos sensibles.
 *
 * @see .agent/skills/senior-logging-pattern/SKILL.md
 */

import { NextRequest } from "next/server";
import {
  type ApiContext,
  type ErrorCodeType,
  extractRequestContext,
  sanitize,
  detectErrorCode,
} from "@/lib/api-context";

/**
 * Opciones para logApiStart
 */
interface LogStartOptions {
  params?: Record<string, unknown>;
  query?: Record<string, string>;
  body?: unknown;
}

/**
 * Opciones para logApiSuccess
 */
interface LogSuccessOptions {
  duration: number;
  recordCount?: number;
  resultId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Opciones para logApiError
 */
interface LogErrorOptions {
  error: unknown;
  errorCode?: ErrorCodeType;
  context?: Record<string, unknown>;
}

/**
 * Registra el inicio de una operación API con contexto completo
 *
 * @param request - NextRequest original
 * @param operation - Nombre descriptivo de la operación (e.g., "listar_estudiantes")
 * @param options - Parámetros, query, body (sanitizados automáticamente)
 * @param extra - userId y tenantId opcionales (se agregan al contexto)
 * @returns ApiContext para usar en logs subsecuentes
 *
 * @example
 * const ctx = logApiStart(request, "crear_estudiante", {
 *   params: { tenantId },
 *   body: requestBody,
 * });
 */
export function logApiStart(
  request: NextRequest,
  operation: string,
  options?: LogStartOptions,
  extra?: { userId?: string; tenantId?: string }
): ApiContext {
  const context = extractRequestContext(request, extra);

  const logData: Record<string, unknown> = {
    level: "info",
    type: "api_start",
    requestId: context.requestId,
    operation,
    method: context.method,
    endpoint: context.endpoint,
    userId: context.userId || "anonymous",
    tenantId: context.tenantId || "none",
    ip: context.ip,
    timestamp: context.timestamp,
  };

  if (options?.params) {
    logData.params = sanitize(options.params);
  }
  if (options?.query && Object.keys(options.query).length > 0) {
    logData.query = options.query;
  }
  if (options?.body) {
    logData.body = sanitize(options.body);
  }

  console.log(JSON.stringify(logData));

  return context;
}

/**
 * Registra el éxito de una operación API con métricas
 *
 * @param context - ApiContext del logApiStart
 * @param operation - Nombre de la operación (debe coincidir con logApiStart)
 * @param options - Métricas: duración, cantidad de registros, ID resultado
 *
 * @example
 * logApiSuccess(ctx, "crear_estudiante", {
 *   duration: Date.now() - startTime,
 *   resultId: student.id,
 *   recordCount: 1,
 * });
 */
export function logApiSuccess(
  context: ApiContext,
  operation: string,
  options: LogSuccessOptions
): void {
  const logData: Record<string, unknown> = {
    level: "info",
    type: "api_success",
    requestId: context.requestId,
    operation,
    method: context.method,
    endpoint: context.endpoint,
    userId: context.userId || "anonymous",
    tenantId: context.tenantId || "none",
    duration: `${options.duration}ms`,
    durationMs: options.duration,
    timestamp: new Date().toISOString(),
  };

  if (options.recordCount !== undefined) {
    logData.recordCount = options.recordCount;
  }
  if (options.resultId) {
    logData.resultId = options.resultId;
  }
  if (options.metadata) {
    logData.metadata = options.metadata;
  }

  console.log(JSON.stringify(logData));
}

/**
 * Registra un error de operación API con contexto completo
 *
 * @param context - ApiContext del logApiStart
 * @param operation - Nombre de la operación
 * @param options - Error, código opcional, contexto adicional
 *
 * @example
 * logApiError(ctx, "crear_estudiante", { error });
 */
export function logApiError(
  context: ApiContext,
  operation: string,
  options: LogErrorOptions
): void {
  const error = options.error;
  const errorCode = options.errorCode || detectErrorCode(error);

  const logData: Record<string, unknown> = {
    level: "error",
    type: "api_error",
    requestId: context.requestId,
    operation,
    method: context.method,
    endpoint: context.endpoint,
    userId: context.userId || "anonymous",
    tenantId: context.tenantId || "none",
    errorCode,
    timestamp: new Date().toISOString(),
  };

  if (error instanceof Error) {
    logData.errorName = error.name;
    logData.errorMessage = error.message;
    logData.stack = error.stack?.split("\n").slice(0, 5).join("\n");
  } else {
    logData.errorMessage = String(error);
  }

  if (options.context) {
    logData.errorContext = sanitize(options.context);
  }

  console.error(JSON.stringify(logData));
}

/**
 * Registra una operación intermedia en un proceso complejo
 *
 * @param context - ApiContext del logApiStart
 * @param operation - Nombre de la sub-operación
 * @param message - Mensaje descriptivo
 * @param metadata - Datos adicionales
 *
 * @example
 * logApiOperation(ctx, "enviar_email", "Enviando notificación a 50 estudiantes", {
 *   totalEstudiantes: 50,
 *   enviados: 25,
 * });
 */
export function logApiOperation(
  context: ApiContext,
  operation: string,
  message: string,
  metadata?: Record<string, unknown>
): void {
  const logData: Record<string, unknown> = {
    level: "info",
    type: "api_operation",
    requestId: context.requestId,
    operation,
    message,
    userId: context.userId || "anonymous",
    tenantId: context.tenantId || "none",
    timestamp: new Date().toISOString(),
  };

  if (metadata) {
    logData.metadata = metadata;
  }

  console.log(JSON.stringify(logData));
}
