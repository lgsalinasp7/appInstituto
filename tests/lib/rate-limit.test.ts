import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkRateLimitByEmail,
  resetRateLimitByEmail,
  RATE_LIMIT_CONFIGS,
} from "@/lib/rate-limit";

describe("checkRateLimitByEmail", () => {
  beforeEach(() => {
    resetRateLimitByEmail("test@example.com", "login");
  });

  it("permite primera solicitud", () => {
    const result = checkRateLimitByEmail(
      "test@example.com",
      RATE_LIMIT_CONFIGS.LOGIN,
      "login"
    );

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("permite hasta maxRequests solicitudes", () => {
    const config = { maxRequests: 3, windowMs: 60000 };

    checkRateLimitByEmail("user@test.com", config, "test");
    const r2 = checkRateLimitByEmail("user@test.com", config, "test");
    const r3 = checkRateLimitByEmail("user@test.com", config, "test");

    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("bloquea después de exceder límite", () => {
    const config = { maxRequests: 2, windowMs: 60000 };

    checkRateLimitByEmail("blocked@test.com", config, "test");
    checkRateLimitByEmail("blocked@test.com", config, "test");
    const r3 = checkRateLimitByEmail("blocked@test.com", config, "test");

    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("usa email en minúsculas como key", () => {
    const r1 = checkRateLimitByEmail("User@Test.com", RATE_LIMIT_CONFIGS.LOGIN, "test");
    const r2 = checkRateLimitByEmail("user@test.com", RATE_LIMIT_CONFIGS.LOGIN, "test");

    expect(r1.allowed).toBe(true);
    expect(r2.remaining).toBe(r1.remaining - 1);
  });
});

describe("resetRateLimitByEmail", () => {
  it("reinicia contador permitiendo nuevas solicitudes", () => {
    const config = { maxRequests: 1, windowMs: 60000 };

    checkRateLimitByEmail("reset@test.com", config, "test");
    const blocked = checkRateLimitByEmail("reset@test.com", config, "test");
    expect(blocked.allowed).toBe(false);

    resetRateLimitByEmail("reset@test.com", "test");
    const afterReset = checkRateLimitByEmail("reset@test.com", config, "test");
    expect(afterReset.allowed).toBe(true);
  });
});

describe("RATE_LIMIT_CONFIGS", () => {
  it("tiene configuración LOGIN con 5 requests", () => {
    expect(RATE_LIMIT_CONFIGS.LOGIN.maxRequests).toBe(5);
    expect(RATE_LIMIT_CONFIGS.LOGIN.windowMs).toBe(15 * 60 * 1000);
  });

  it("tiene configuración REGISTER", () => {
    expect(RATE_LIMIT_CONFIGS.REGISTER.maxRequests).toBe(3);
  });
});
