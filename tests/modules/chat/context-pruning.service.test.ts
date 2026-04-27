import { describe, it, expect, vi, beforeEach } from "vitest";

const generateTextMock = vi.fn();

vi.mock("ai", () => ({
  generateText: (...args: unknown[]) => generateTextMock(...args),
}));

vi.mock("@ai-sdk/groq", () => ({
  groq: vi.fn((id: string) => ({ id })),
}));

vi.mock("@/lib/prisma", () => {
  const prismaMock = {
    aiConversation: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
  return {
    __esModule: true,
    prisma: prismaMock,
    default: prismaMock,
  };
});

import prisma from "@/lib/prisma";
import { ContextPruningService } from "@/modules/chat/services/context-pruning.service";

type MockedFn = ReturnType<typeof vi.fn>;

describe("ContextPruningService.estimateTokenCount", () => {
  it("suma chars/4 sobre todos los mensajes", () => {
    const tokens = ContextPruningService.estimateTokenCount([
      { role: "user", content: "a".repeat(400) },
      { role: "assistant", content: "b".repeat(800) },
    ]);
    expect(tokens).toBe(100 + 200);
  });
});

describe("ContextPruningService.pruneContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateTextMock.mockReset();
  });

  it("no poda cuando el numero de mensajes <= maxRecent", async () => {
    const messages = [
      { role: "user", content: "hola" },
      { role: "assistant", content: "hi" },
    ];

    const result = await ContextPruningService.pruneContext(
      messages,
      "conv-1",
      6
    );

    expect(result.summary).toBeNull();
    expect(result.prunedCount).toBe(0);
    expect(result.recentMessages).toEqual(messages);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("poda cuando hay mas mensajes y guarda summary nuevo", async () => {
    const messages = Array.from({ length: 10 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `mensaje ${i}`,
    }));

    (prisma.aiConversation.findUnique as MockedFn).mockResolvedValue(null);
    (prisma.aiConversation.update as MockedFn).mockResolvedValue({});
    generateTextMock.mockResolvedValue({ text: "resumen generado" });

    const result = await ContextPruningService.pruneContext(
      messages,
      "conv-1",
      6
    );

    expect(result.recentMessages.length).toBe(6);
    expect(result.prunedCount).toBe(4);
    expect(result.summary).toBe("resumen generado");
    expect(prisma.aiConversation.update).toHaveBeenCalledWith({
      where: { id: "conv-1" },
      data: {
        summary: "resumen generado",
        summaryUpToMessageIndex: 4,
      },
    });
  });

  it("usa summary cacheado y NO llama al modelo si esta vigente", async () => {
    const messages = Array.from({ length: 10 }, (_, i) => ({
      role: "user",
      content: `m${i}`,
    }));

    (prisma.aiConversation.findUnique as MockedFn).mockResolvedValue({
      summary: "summary cacheado previo",
      summaryUpToMessageIndex: 4,
    });

    const result = await ContextPruningService.pruneContext(
      messages,
      "conv-1",
      6
    );

    expect(result.summary).toBe("summary cacheado previo");
    expect(generateTextMock).not.toHaveBeenCalled();
    expect(prisma.aiConversation.update).not.toHaveBeenCalled();
  });

  it("regenera summary si el cacheado esta desactualizado (index menor)", async () => {
    const messages = Array.from({ length: 12 }, (_, i) => ({
      role: "user",
      content: `m${i}`,
    }));

    (prisma.aiConversation.findUnique as MockedFn).mockResolvedValue({
      summary: "summary viejo",
      summaryUpToMessageIndex: 2, // < 12-6=6
    });
    (prisma.aiConversation.update as MockedFn).mockResolvedValue({});
    generateTextMock.mockResolvedValue({ text: "summary nuevo" });

    const result = await ContextPruningService.pruneContext(
      messages,
      "conv-1",
      6
    );

    expect(result.summary).toBe("summary nuevo");
    expect(generateTextMock).toHaveBeenCalled();
  });

  it("fallback truncado cuando el modelo de resumen falla", async () => {
    const messages = Array.from({ length: 10 }, (_, i) => ({
      role: "user",
      content: `mensaje ${i} contenido`,
    }));

    (prisma.aiConversation.findUnique as MockedFn).mockResolvedValue(null);
    (prisma.aiConversation.update as MockedFn).mockResolvedValue({});
    generateTextMock.mockRejectedValue(new Error("groq down"));

    const result = await ContextPruningService.pruneContext(
      messages,
      "conv-1",
      6
    );

    // Devuelve un summary aunque sea fallback (no null)
    expect(result.summary).toBeTruthy();
    expect(result.summary).toContain("user");
  });
});
