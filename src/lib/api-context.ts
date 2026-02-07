/**
 * API Context
 * Tipos y helpers para correlación de requests y contexto estructurado
 */

import { NextRequest } from "next/server";
import { randomBytes } from "crypto";

/**
 * Códigos de error estructurados para rastreo
 */
export const ErrorCode = {
  // Auth
  AUTH_UNAUTHORIZED: "AUTH_001",
  AUTH_FORBIDDEN: "AUTH_002",
  AUTH_SESSION_EXPIRED: "AUTH_003",
  AUTH_CSRF_FAILED: "AUTH_004",
  AUTH_RATE_LIMITED: "AUTH_005",

  // Validation
  VALIDATION_ERROR: "VAL_001",
  VALIDATION_ZOD: "VAL_002",
  VALIDATION_PARAMS: "VAL_003",

  // Database
  DB_NOT_FOUND: "DB_001",
  DB_UNIQUE_VIOLATION: "DB_002",
  DB_FOREIGN_KEY: "DB_003",
  DB_CONNECTION: "DB_004",

  // Business Logic
  BIZ_CONFLICT: "BIZ_001",
  BIZ_INVALID_STATE: "BIZ_002",
  BIZ_TENANT_SUSPENDED: "BIZ_003",

  // System
  SYS_INTERNAL: "SYS_001",
  SYS_EXTERNAL_SERVICE: "SYS_002",
  SYS_TIMEOUT: "SYS_003",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Contexto de una petición API
 * Contiene toda la información necesaria para correlación y debugging
 */
export interface ApiContext {
  requestId: string;
  method: string;
  endpoint: string;
  userId?: string;
  tenantId?: string;
  ip: string;
  userAgent: string;
  timestamp: string;
}

/**
 * Campos sensibles que se sanitizan automáticamente
 */
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "secret",
  "sessionToken",
  "authorization",
  "cookie",
  "creditCard",
  "cardNumber",
  "cvv",
  "ssn",
] as const;

/**
 * Genera un request ID único
 */
export function generateRequestId(): string {
  return `req_${randomBytes(8).toString("hex")}`;
}

/**
 * Extrae el contexto de una petición HTTP
 */
export function extractRequestContext(
  request: NextRequest,
  extra?: { userId?: string; tenantId?: string }
): ApiContext {
  return {
    requestId: generateRequestId(),
    method: request.method,
    endpoint: new URL(request.url).pathname,
    userId: extra?.userId,
    tenantId: extra?.tenantId,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || request.headers.get("x-real-ip") 
      || "unknown",
    userAgent: request.headers.get("user-agent")?.substring(0, 200) || "unknown",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Sanitiza un objeto removiendo campos sensibles
 * Reemplaza valores sensibles con "[REDACTED]"
 */
export function sanitize<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(sanitize) as T;

  const sanitized = { ...data } as Record<string, unknown>;

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }

  return sanitized as T;
}

/**
 * Detecta el código de error basado en el tipo de error
 */
export function detectErrorCode(error: unknown): ErrorCodeType {
  if (!error || typeof error !== "object") return ErrorCode.SYS_INTERNAL;

  const err = error as { name?: string; code?: string; statusCode?: number };

  // Errores de la aplicación
  if (err.name === "UnauthorizedError") return ErrorCode.AUTH_UNAUTHORIZED;
  if (err.name === "ForbiddenError") return ErrorCode.AUTH_FORBIDDEN;
  if (err.name === "RateLimitError") return ErrorCode.AUTH_RATE_LIMITED;
  if (err.name === "ValidationError") return ErrorCode.VALIDATION_ERROR;
  if (err.name === "ZodError") return ErrorCode.VALIDATION_ZOD;
  if (err.name === "NotFoundError") return ErrorCode.DB_NOT_FOUND;
  if (err.name === "ConflictError") return ErrorCode.BIZ_CONFLICT;

  // Errores de Prisma
  if (err.code === "P2002") return ErrorCode.DB_UNIQUE_VIOLATION;
  if (err.code === "P2003") return ErrorCode.DB_FOREIGN_KEY;
  if (err.code === "P2025") return ErrorCode.DB_NOT_FOUND;

  // Status codes
  if (err.statusCode === 401) return ErrorCode.AUTH_UNAUTHORIZED;
  if (err.statusCode === 403) return ErrorCode.AUTH_FORBIDDEN;
  if (err.statusCode === 404) return ErrorCode.DB_NOT_FOUND;
  if (err.statusCode === 429) return ErrorCode.AUTH_RATE_LIMITED;

  return ErrorCode.SYS_INTERNAL;
}
