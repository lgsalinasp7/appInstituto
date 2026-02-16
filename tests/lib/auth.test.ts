import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: { deleteMany: vi.fn() },
  },
}));

import { validateCSRF, cleanExpiredSessions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("validateCSRF", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("retorna true en desarrollo (NODE_ENV=development)", () => {
    process.env.NODE_ENV = "development";
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: {},
    });
    expect(validateCSRF(request)).toBe(true);
  });

  it("retorna false en producción cuando faltan origin y host", () => {
    process.env.NODE_ENV = "production";
    const request = new Request("http://example.com/api/test", {
      method: "POST",
      headers: {},
    });
    expect(validateCSRF(request)).toBe(false);
  });

  it("retorna true en producción cuando origin coincide con host", () => {
    process.env.NODE_ENV = "production";
    const request = new Request("https://example.com/api/test", {
      method: "POST",
      headers: {
        origin: "https://example.com",
        host: "example.com",
      },
    });
    expect(validateCSRF(request)).toBe(true);
  });

  it("retorna true cuando origin es subdominio del host", () => {
    process.env.NODE_ENV = "production";
    const request = new Request("https://edutec.example.com/api/test", {
      method: "POST",
      headers: {
        origin: "https://edutec.example.com",
        host: "example.com",
      },
    });
    expect(validateCSRF(request)).toBe(true);
  });
});

describe("cleanExpiredSessions", () => {
  beforeEach(() => {
    vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 3 } as any);
  });

  it("retorna count de sesiones eliminadas", async () => {
    const result = await cleanExpiredSessions();
    expect(result).toBe(3);
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { expires: { lt: expect.any(Date) } },
    });
  });
});
