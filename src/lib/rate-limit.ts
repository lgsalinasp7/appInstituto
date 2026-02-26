/**
 * Rate Limiting System
 * Protege contra ataques de fuerza bruta y abuso de API
 * Implementado con Map en memoria (producción: usar Upstash Redis)
 */

import { NextRequest } from "next/server";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Store de rate limits en memoria
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuraciones predefinidas
export const RATE_LIMIT_CONFIGS = {
  LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },
  REGISTER: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  RESET_PASSWORD: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  API_GENERAL: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minuto
  },
  PUBLIC_LEADS: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minuto
  },
} as const;

/**
 * Obtiene el identificador único para rate limiting
 * Usa IP + endpoint como key
 */
function getRateLimitKey(request: NextRequest, prefix: string): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
              request.headers.get("x-real-ip") || 
              "unknown";
  return `${prefix}:${ip}`;
}

/**
 * Limpia entradas expiradas del store
 * Se ejecuta periódicamente para evitar memory leaks
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Ejecutar limpieza cada 5 minutos
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

/**
 * Verifica si una request excede el límite de rate limiting
 * @returns true si está dentro del límite, false si lo excede
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  prefix: string = "default"
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = getRateLimitKey(request, prefix);
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Si no existe o expiró, crear nueva entrada
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  // Si existe y no ha expirado, incrementar contador
  entry.count++;

  // Verificar si excede el límite
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Middleware wrapper que aplica rate limiting a un handler
 * 
 * @example
 * export const POST = withRateLimit(
 *   RATE_LIMIT_CONFIGS.LOGIN,
 *   "login",
 *   async (request) => {
 *     return NextResponse.json({ success: true });
 *   }
 * );
 */
export function withRateLimit<T>(
  config: RateLimitConfig,
  prefix: string,
  handler: (request: NextRequest) => Promise<T> | T
): (request: NextRequest) => Promise<T> {
  return async (request: NextRequest) => {
    const { allowed, remaining, resetAt } = checkRateLimit(request, config, prefix);

    if (!allowed) {
      const resetIn = Math.ceil((resetAt - Date.now()) / 1000);
      throw new RateLimitError(
        `Demasiados intentos. Por favor, intente nuevamente en ${resetIn} segundos.`,
        resetAt
      );
    }

    // Agregar headers de rate limit a la respuesta
    const response = await handler(request);
    
    // Si la respuesta es de Next.js, agregar headers
    if (response && typeof response === "object" && "headers" in response) {
      const nextResponse = response as any;
      nextResponse.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
      nextResponse.headers.set("X-RateLimit-Remaining", remaining.toString());
      nextResponse.headers.set("X-RateLimit-Reset", resetAt.toString());
    }

    return response;
  };
}

/**
 * Error personalizado para rate limiting
 */
export class RateLimitError extends Error {
  public readonly resetAt: number;

  constructor(message: string, resetAt: number) {
    super(message);
    this.name = "RateLimitError";
    this.resetAt = resetAt;
  }
}

/**
 * Helper para rate limiting por email (útil para reset password)
 */
export function checkRateLimitByEmail(
  email: string,
  config: RateLimitConfig,
  prefix: string = "email"
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${prefix}:${email.toLowerCase()}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Reinicia el contador de rate limit para una key específica
 * Útil después de operaciones exitosas como login
 */
export function resetRateLimit(request: NextRequest, prefix: string) {
  const key = getRateLimitKey(request, prefix);
  rateLimitStore.delete(key);
}

/**
 * Reinicia el contador por email
 */
export function resetRateLimitByEmail(email: string, prefix: string = "email") {
  const key = `${prefix}:${email.toLowerCase()}`;
  rateLimitStore.delete(key);
}
