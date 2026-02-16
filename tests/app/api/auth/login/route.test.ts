import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/login/route";

vi.mock("@/modules/auth/services/auth.service", () => ({
  AuthService: {
    findUserByEmail: vi.fn(),
    verifyPassword: vi.fn(),
    mapToAuthUser: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  createSession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimitByEmail: vi.fn().mockReturnValue({
    allowed: true,
    remaining: 5,
    resetAt: Date.now() + 60000,
  }),
  resetRateLimitByEmail: vi.fn(),
  RATE_LIMIT_CONFIGS: {
    LOGIN: { maxRequests: 5, windowMs: 900000 },
  },
}));

import { AuthService } from "@/modules/auth/services/auth.service";
import { checkRateLimitByEmail } from "@/lib/rate-limit";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimitByEmail).mockReturnValue({
      allowed: true,
      remaining: 5,
      resetAt: Date.now() + 60000,
    });
  });

  function createRequest(body: object) {
    return new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("retorna 400 para body inválido (email inválido)", async () => {
    const request = createRequest({
      email: "invalid-email",
      password: "password123",
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBeDefined();
  });

  it("retorna 400 para contraseña corta", async () => {
    const request = createRequest({
      email: "user@example.com",
      password: "12345",
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it("retorna 401 cuando usuario no existe", async () => {
    vi.mocked(AuthService.findUserByEmail).mockResolvedValue(null);

    const request = createRequest({
      email: "nonexistent@example.com",
      password: "password123",
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Credenciales invalidas");
  });

  it("retorna 401 cuando contraseña es incorrecta", async () => {
    vi.mocked(AuthService.findUserByEmail).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      password: "$2a$12$hashed",
      name: "User",
      isActive: true,
    } as any);
    vi.mocked(AuthService.verifyPassword).mockResolvedValue(false);

    const request = createRequest({
      email: "user@example.com",
      password: "wrongpassword",
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Credenciales invalidas");
  });

  it("retorna 401 cuando usuario no tiene contraseña configurada", async () => {
    vi.mocked(AuthService.findUserByEmail).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      password: null,
      name: "User",
      isActive: true,
    } as any);

    const request = createRequest({
      email: "user@example.com",
      password: "password123",
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Cuenta sin contrasena configurada");
  });

  it("retorna 403 cuando cuenta está inactiva", async () => {
    vi.mocked(AuthService.findUserByEmail).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      password: "$2a$12$hashed",
      name: "User",
      isActive: false,
    } as any);
    vi.mocked(AuthService.verifyPassword).mockResolvedValue(true);

    const request = createRequest({
      email: "user@example.com",
      password: "password123",
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe("Cuenta inactiva");
  });

  it("retorna 200 y datos de usuario en login exitoso", async () => {
    vi.mocked(AuthService.findUserByEmail).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      password: "$2a$12$hashed",
      name: "Test User",
      isActive: true,
    } as any);
    vi.mocked(AuthService.verifyPassword).mockResolvedValue(true);
    vi.mocked(AuthService.mapToAuthUser).mockReturnValue({
      id: "user-1",
      email: "user@example.com",
      name: "Test User",
      role: { id: "r1", name: "Admin", permissions: [] },
    } as any);

    const request = createRequest({
      email: "user@example.com",
      password: "password123",
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.email).toBe("user@example.com");
    expect(json.data.name).toBe("Test User");
    expect(json.message).toContain("exitoso");
  });

  it("retorna 429 cuando rate limit excedido", async () => {
    vi.mocked(checkRateLimitByEmail).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 300,
    });

    const request = createRequest({
      email: "user@example.com",
      password: "password123",
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json.success).toBe(false);
    expect(json.error).toContain("Demasiados intentos");
  });
});
