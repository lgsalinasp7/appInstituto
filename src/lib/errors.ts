/**
 * Error Handling System
 * Proporciona clases de error tipadas y helpers para manejo consistente
 */

import { NextResponse } from "next/server";
import { RateLimitError } from "./rate-limit";

/**
 * Clase base para errores de la aplicación
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error 400 - Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Solicitud inválida") {
    super(message, 400);
  }
}

/**
 * Error 401 - Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "No autorizado") {
    super(message, 401);
  }
}

/**
 * Error 403 - Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Acceso prohibido") {
    super(message, 403);
  }
}

/**
 * Error 404 - Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Recurso no encontrado") {
    super(message, 404);
  }
}

/**
 * Error 409 - Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = "Conflicto con el estado actual") {
    super(message, 409);
  }
}

/**
 * Error 422 - Unprocessable Entity (Validation)
 */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string = "Error de validación", errors: Record<string, string[]> = {}) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * Error 500 - Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Error interno del servidor") {
    super(message, 500, false); // No operacional - error inesperado
  }
}

/**
 * Error 503 - Service Unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Servicio no disponible") {
    super(message, 503);
  }
}

/**
 * Interfaz para respuestas de error
 */
interface ErrorResponse {
  error: string;
  message?: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

/**
 * Convierte un error a una respuesta HTTP
 * 
 * @example
 * try {
 *   // ... código
 * } catch (error) {
 *   return handleApiError(error);
 * }
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // Logging del error
  if (error instanceof Error) {
    console.error(`[${error.name}] ${error.message}`, {
      stack: error.stack,
    });
  } else {
    console.error("Error desconocido:", error);
  }

  // Rate Limit Error
  if (error instanceof RateLimitError) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((error.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Validation Error con detalles
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: error.message,
        errors: error.errors,
      },
      { status: error.statusCode }
    );
  }

  // AppError (errores conocidos de la aplicación)
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: error.statusCode }
    );
  }

  // Errores de Zod (validación)
  if ((error as any).name === "ZodError") {
    const zodError = error as any;
    const errors: Record<string, string[]> = {};
    
    zodError.errors?.forEach((err: any) => {
      const path = err.path.join(".");
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });

    return NextResponse.json(
      {
        error: "Error de validación",
        errors,
      },
      { status: 422 }
    );
  }

  // Errores de Prisma
  if ((error as any).code) {
    const prismaError = error as any;
    
    // Unique constraint violation
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        {
          error: "Ya existe un registro con estos datos",
          message: `El campo ${prismaError.meta?.target?.[0] || "desconocido"} debe ser único`,
        },
        { status: 409 }
      );
    }

    // Foreign key constraint violation
    if (prismaError.code === "P2003") {
      return NextResponse.json(
        {
          error: "Referencia inválida",
          message: "El registro referenciado no existe",
        },
        { status: 400 }
      );
    }

    // Record not found
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        {
          error: "Recurso no encontrado",
        },
        { status: 404 }
      );
    }
  }

  // Error genérico (500)
  const isDevelopment = process.env.NODE_ENV === "development";
  
  return NextResponse.json(
    {
      error: "Error interno del servidor",
      ...(isDevelopment && error instanceof Error && { 
        message: error.message,
        stack: error.stack 
      }),
    },
    { status: 500 }
  );
}

/**
 * Wrapper asíncrono para manejar errores en handlers
 * 
 * @example
 * export const GET = asyncHandler(async (request) => {
 *   const data = await fetchData();
 *   return NextResponse.json(data);
 * });
 */
export function asyncHandler<T>(
  handler: (request: Request, ...args: any[]) => Promise<T>
): (request: Request, ...args: any[]) => Promise<T | NextResponse<ErrorResponse>> {
  return async (request: Request, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
