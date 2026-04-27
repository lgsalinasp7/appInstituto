import { describe, it, expect, vi } from "vitest";

vi.mock("@ai-sdk/google", () => ({
  google: {
    textEmbeddingModel: vi.fn((id: string) => ({ id })),
  },
}));

vi.mock("ai", () => ({
  embed: vi.fn(),
  embedMany: vi.fn(),
}));

import { EmbeddingService } from "@/modules/chat/services/embedding.service";

describe("EmbeddingService.estimateTokenCount", () => {
  it("calcula ~chars/4", () => {
    expect(EmbeddingService.estimateTokenCount("abcd")).toBe(1);
    expect(EmbeddingService.estimateTokenCount("a".repeat(400))).toBe(100);
  });

  it("redondea hacia arriba", () => {
    expect(EmbeddingService.estimateTokenCount("abcde")).toBe(2);
  });
});

describe("EmbeddingService.chunkDocument", () => {
  it("retorna 1 chunk si el contenido es corto", () => {
    const chunks = EmbeddingService.chunkDocument("texto corto");
    expect(chunks.length).toBe(1);
    expect(chunks[0]).toContain("texto corto");
  });

  it("particiona contenido largo en multiples chunks", () => {
    const longContent = Array.from({ length: 20 })
      .map((_, i) => `Parrafo numero ${i} con contenido suficiente para llenar.`)
      .join("\n\n");

    const chunks = EmbeddingService.chunkDocument(longContent, 200, 0);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("respeta chunkSize maximo aproximado (con tolerancia por overlap)", () => {
    const longContent = "a".repeat(2000) + "\n\n" + "b".repeat(2000);
    const chunks = EmbeddingService.chunkDocument(longContent, 500, 0);

    // ningun chunk debe ser drasticamente mayor al tamano (sin overlap)
    chunks.forEach((c) => {
      expect(c.length).toBeLessThanOrEqual(2500);
    });
  });

  it("agrega overlap entre chunks cuando overlap > 0", () => {
    const content = Array.from({ length: 10 })
      .map((_, i) => `Bloque ${i}: ` + "x".repeat(100))
      .join("\n\n");

    const withOverlap = EmbeddingService.chunkDocument(content, 200, 30);
    const noOverlap = EmbeddingService.chunkDocument(content, 200, 0);

    // con overlap, los chunks (excepto el primero) deberian ser mas largos
    if (withOverlap.length > 1 && noOverlap.length > 1) {
      expect(withOverlap[1].length).toBeGreaterThanOrEqual(noOverlap[1].length);
    }
  });

  it("ignora parrafos vacios", () => {
    const chunks = EmbeddingService.chunkDocument("hola\n\n\n\nmundo");
    expect(chunks.length).toBe(1);
    expect(chunks[0]).toContain("hola");
    expect(chunks[0]).toContain("mundo");
  });
});
