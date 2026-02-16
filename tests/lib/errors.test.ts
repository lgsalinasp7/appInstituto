import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleApiError,
  AppError,
  UnauthorizedError,
  ValidationError,
  BadRequestError,
} from "@/lib/errors";
import { RateLimitError } from "@/lib/rate-limit";
import { z } from "zod";

describe("handleApiError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("retorna 401 para UnauthorizedError", async () => {
    const error = new UnauthorizedError("Debe iniciar sesión");
    const response = handleApiError(error);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Debe iniciar sesión");
  });

  it("retorna 400 para BadRequestError", async () => {
    const error = new BadRequestError("Datos inválidos");
    const response = handleApiError(error);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Datos inválidos");
  });

  it("retorna 422 con detalles para ValidationError", async () => {
    const error = new ValidationError("Error de validación", {
      email: ["Email inválido"],
      password: ["Mínimo 6 caracteres"],
    });
    const response = handleApiError(error);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.error).toBe("Error de validación");
    expect(json.errors).toEqual({
      email: ["Email inválido"],
      password: ["Mínimo 6 caracteres"],
    });
  });

  it("retorna 429 para RateLimitError con header Retry-After", async () => {
    const resetAt = Date.now() + 60000;
    const error = new RateLimitError("Demasiados intentos", resetAt);
    const response = handleApiError(error);
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json.error).toBe("Demasiados intentos");
    expect(response.headers.get("Retry-After")).toBeDefined();
  });

  it("retorna 422 para ZodError", async () => {
    const schema = z.object({
      email: z.email("Email inválido"),
      password: z.string().min(6, "Mínimo 6 caracteres"),
    });
    const result = schema.safeParse({ email: "invalid", password: "123" });
    expect(result.success).toBe(false);
    const response = handleApiError((result as any).error);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.error).toBe("Error de validación");
    expect(Object.keys(json.errors).length).toBeGreaterThan(0);
  });

  it("retorna 409 para error Prisma P2002 (unique constraint)", async () => {
    const prismaError = Object.assign(new Error("Unique constraint"), {
      code: "P2002",
      meta: { target: ["email"] },
    });
    const response = handleApiError(prismaError);
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toBe("Ya existe un registro con estos datos");
    expect(json.message).toContain("email");
  });

  it("retorna 404 para error Prisma P2025 (record not found)", async () => {
    const prismaError = Object.assign(new Error("Record not found"), {
      code: "P2025",
    });
    const response = handleApiError(prismaError);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe("Recurso no encontrado");
  });

  it("retorna 500 para error genérico", async () => {
    const error = new Error("Error inesperado");
    const response = handleApiError(error);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe("Error interno del servidor");
  });

  it("retorna statusCode correcto para AppError genérico", async () => {
    const error = new AppError("Error operacional", 418);
    const response = handleApiError(error);
    const json = await response.json();

    expect(response.status).toBe(418);
    expect(json.error).toBe("Error operacional");
  });
});
