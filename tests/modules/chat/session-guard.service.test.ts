import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => {
  const prismaMock = {
    aiMessage: {
      count: vi.fn(),
    },
  };
  return {
    __esModule: true,
    prisma: prismaMock,
    default: prismaMock,
  };
});

import prisma from "@/lib/prisma";
import { SessionGuardService } from "@/modules/chat/services/session-guard.service";
import { SESSION_LIMITS } from "@/modules/chat/types/agent.types";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";

type MockedFn = ReturnType<typeof vi.fn>;

describe("SessionGuardService.checkSessionLimits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permite mensaje cuando ambos contadores estan por debajo del limite", async () => {
    (prisma.aiMessage.count as MockedFn)
      .mockResolvedValueOnce(5) // conversation
      .mockResolvedValueOnce(10); // daily

    const result = await SessionGuardService.checkSessionLimits(
      "user-1",
      "conv-1",
      TENANT_A
    );

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(
      Math.min(
        SESSION_LIMITS.maxMessagesPerConversation - 5,
        SESSION_LIMITS.maxMessagesPerDay - 10
      )
    );
  });

  it("rechaza cuando se excede el limite por conversacion", async () => {
    (prisma.aiMessage.count as MockedFn).mockResolvedValueOnce(
      SESSION_LIMITS.maxMessagesPerConversation
    );

    const result = await SessionGuardService.checkSessionLimits(
      "user-1",
      "conv-1",
      TENANT_A
    );

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.reason).toContain("conversación");
  });

  it("rechaza cuando se excede el limite diario", async () => {
    (prisma.aiMessage.count as MockedFn)
      .mockResolvedValueOnce(5) // conversation OK
      .mockResolvedValueOnce(SESSION_LIMITS.maxMessagesPerDay); // daily exceeded

    const result = await SessionGuardService.checkSessionLimits(
      "user-1",
      "conv-1",
      TENANT_A
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("diario");
  });

  // BUG P0 fix 1.7a: el conteo debe filtrar por tenantId para evitar leak cross-tenant
  it("filtra el count de conversacion por tenantId (anti-leak)", async () => {
    (prisma.aiMessage.count as MockedFn).mockResolvedValue(0);

    await SessionGuardService.checkSessionLimits("user-1", "conv-1", TENANT_A);

    const firstCall = (prisma.aiMessage.count as MockedFn).mock.calls[0][0];
    expect(firstCall.where.conversationId).toBe("conv-1");
    expect(firstCall.where.role).toBe("user");
    // CRITICAL: tenantId scope nested en conversation
    expect(firstCall.where.conversation).toEqual({ tenantId: TENANT_A });
  });

  it("filtra el conteo diario por userId Y tenantId", async () => {
    (prisma.aiMessage.count as MockedFn).mockResolvedValue(0);

    await SessionGuardService.getUserDailyMessageCount("user-1", TENANT_B);

    const call = (prisma.aiMessage.count as MockedFn).mock.calls[0][0];
    expect(call.where.role).toBe("user");
    expect(call.where.conversation).toEqual({
      userId: "user-1",
      tenantId: TENANT_B,
    });
    expect(call.where.createdAt.gte).toBeInstanceOf(Date);
  });

  it("no cuenta mensajes de otros tenants (regression test multi-tenant)", async () => {
    // Simulamos que prisma honra el tenantId — count debe llamarse con el filtro correcto
    (prisma.aiMessage.count as MockedFn).mockImplementation(
      ({ where }: { where: { conversation?: { tenantId?: string } } }) => {
        // Solo cuenta si tenantId coincide con TENANT_A
        return Promise.resolve(
          where.conversation?.tenantId === TENANT_A ? 3 : 999
        );
      }
    );

    const result = await SessionGuardService.checkSessionLimits(
      "user-1",
      "conv-1",
      TENANT_A
    );

    // Si filtrara mal, count seria 999 y allowed=false
    expect(result.allowed).toBe(true);
  });
});
