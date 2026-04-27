import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => {
  const prismaMock = {
    aiResponseCache: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
  return {
    __esModule: true,
    prisma: prismaMock,
    default: prismaMock,
  };
});

import prisma from "@/lib/prisma";
import { ResponseCacheService } from "@/modules/chat/services/response-cache.service";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";

type MockedFn = ReturnType<typeof vi.fn>;

describe("ResponseCacheService.normalizeQuery", () => {
  it("normaliza minusculas, trim y signos de puntuacion", () => {
    expect(ResponseCacheService.normalizeQuery("  Hola, ¿como?  ")).toBe(
      "hola como"
    );
  });

  it("colapsa espacios multiples", () => {
    expect(ResponseCacheService.normalizeQuery("a    b")).toBe("a b");
  });
});

describe("ResponseCacheService.isCacheable", () => {
  it("rechaza queries con tools en NEVER_CACHE_TOOLS (searchStudents)", () => {
    expect(
      ResponseCacheService.isCacheable("buscar a juan perez", ["searchStudents"])
    ).toBe(false);
  });

  it("rechaza queries demasiado cortas", () => {
    expect(ResponseCacheService.isCacheable("hola", [])).toBe(false);
  });

  it("acepta queries normales sin tools blacklisteadas", () => {
    expect(
      ResponseCacheService.isCacheable("cuantos programas hay activos", [
        "getProgramInfo",
      ])
    ).toBe(true);
  });
});

describe("ResponseCacheService.getCachedResponse — aislamiento por tenant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna null cuando no hay cache para ese tenant", async () => {
    (prisma.aiResponseCache.findUnique as MockedFn).mockResolvedValue(null);

    const result = await ResponseCacheService.getCachedResponse(
      "consulta x",
      TENANT_A
    );

    expect(result).toBeNull();
  });

  it("usa el unique key compuesto tenantId_queryHash (no leak cross-tenant)", async () => {
    (prisma.aiResponseCache.findUnique as MockedFn).mockResolvedValue(null);

    await ResponseCacheService.getCachedResponse("consulta x", TENANT_B);

    const call = (prisma.aiResponseCache.findUnique as MockedFn).mock
      .calls[0][0];
    expect(call.where.tenantId_queryHash.tenantId).toBe(TENANT_B);
    expect(call.where.tenantId_queryHash.queryHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("retorna null y borra entry cuando esta expirada", async () => {
    const past = new Date(Date.now() - 60_000);
    (prisma.aiResponseCache.findUnique as MockedFn).mockResolvedValue({
      id: "c1",
      expiresAt: past,
      response: "old",
      toolsUsed: [],
      hitCount: 5,
    });
    (prisma.aiResponseCache.delete as MockedFn).mockResolvedValue({});

    const result = await ResponseCacheService.getCachedResponse(
      "consulta",
      TENANT_A
    );

    expect(result).toBeNull();
    expect(prisma.aiResponseCache.delete).toHaveBeenCalledWith({
      where: { id: "c1" },
    });
  });

  it("retorna respuesta y suma hitCount cuando esta vigente", async () => {
    const future = new Date(Date.now() + 60 * 60_000);
    (prisma.aiResponseCache.findUnique as MockedFn).mockResolvedValue({
      id: "c1",
      expiresAt: future,
      response: "respuesta cacheada",
      toolsUsed: ["getProgramInfo"],
      hitCount: 2,
    });
    (prisma.aiResponseCache.update as MockedFn).mockResolvedValue({});

    const result = await ResponseCacheService.getCachedResponse(
      "consulta",
      TENANT_A
    );

    expect(result).toEqual({
      response: "respuesta cacheada",
      toolsUsed: ["getProgramInfo"],
      hitCount: 3,
    });
    expect(prisma.aiResponseCache.update).toHaveBeenCalled();
  });
});

describe("ResponseCacheService.cacheResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no escribe cuando query no es cacheable", async () => {
    await ResponseCacheService.cacheResponse(
      "buscar",
      "resp",
      ["searchStudents"],
      TENANT_A
    );
    expect(prisma.aiResponseCache.upsert).not.toHaveBeenCalled();
  });

  it("escribe con tenantId correcto en create branch del upsert", async () => {
    (prisma.aiResponseCache.upsert as MockedFn).mockResolvedValue({});

    await ResponseCacheService.cacheResponse(
      "cuantos programas activos hay",
      "respuesta larga",
      ["getProgramInfo"],
      TENANT_B
    );

    const call = (prisma.aiResponseCache.upsert as MockedFn).mock.calls[0][0];
    expect(call.create.tenantId).toBe(TENANT_B);
    expect(call.where.tenantId_queryHash.tenantId).toBe(TENANT_B);
    expect(call.create.expiresAt).toBeInstanceOf(Date);
  });

  it("aplica TTL corto cuando se usa getCarteraReport (30 min)", async () => {
    (prisma.aiResponseCache.upsert as MockedFn).mockResolvedValue({});
    const before = Date.now();

    await ResponseCacheService.cacheResponse(
      "reporte cartera vencida",
      "resp",
      ["getCarteraReport"],
      TENANT_A
    );

    const call = (prisma.aiResponseCache.upsert as MockedFn).mock.calls[0][0];
    const ttlMs = call.create.expiresAt.getTime() - before;
    // 0.5h = 1800000ms (allow generous variance)
    expect(ttlMs).toBeGreaterThan(29 * 60_000);
    expect(ttlMs).toBeLessThan(31 * 60_000);
  });
});
