import { describe, it, expect, vi, beforeEach } from "vitest";

const generateTextMock = vi.fn();

vi.mock("ai", () => ({
  generateText: (...args: unknown[]) => generateTextMock(...args),
}));

vi.mock("@ai-sdk/groq", () => ({
  groq: vi.fn((id: string) => ({ id })),
}));

import { RouterAgentService } from "@/modules/chat/services/router-agent.service";

describe("RouterAgentService.classifyIntent — fast paths", () => {
  beforeEach(() => {
    generateTextMock.mockReset();
  });

  it("detecta saludos via regex sin llamar al modelo", async () => {
    const result = await RouterAgentService.classifyIntent(
      "hola",
      "tenant-a",
      "general"
    );

    expect(result.intent).toBe("greeting");
    expect(result.shouldProceed).toBe(false);
    expect(result.localResponse).toContain("Hola");
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("detecta 'buenos días' como saludo", async () => {
    const result = await RouterAgentService.classifyIntent(
      "buenos días",
      "tenant-a"
    );
    expect(result.intent).toBe("greeting");
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("trata mensajes muy cortos (<=3 chars) como saludo", async () => {
    const result = await RouterAgentService.classifyIntent("hi", "tenant-a");
    expect(result.intent).toBe("greeting");
    expect(result.shouldProceed).toBe(false);
    expect(generateTextMock).not.toHaveBeenCalled();
  });
});

describe("RouterAgentService.classifyIntent — modelo de clasificacion", () => {
  beforeEach(() => {
    generateTextMock.mockReset();
  });

  it("clasifica como financial y permite proceder", async () => {
    generateTextMock.mockResolvedValue({ text: "financial" });

    const result = await RouterAgentService.classifyIntent(
      "cuantos estudiantes tienen mora mayor a 60 dias",
      "tenant-a",
      "general"
    );

    expect(result.intent).toBe("financial");
    expect(result.shouldProceed).toBe(true);
  });

  it("clasifica spam como NO proceder y devuelve respuesta local", async () => {
    generateTextMock.mockResolvedValue({ text: "spam" });

    const result = await RouterAgentService.classifyIntent(
      "asdfghjkl xxx contenido ofensivo aleatorio largo",
      "tenant-a"
    );

    expect(result.intent).toBe("spam");
    expect(result.shouldProceed).toBe(false);
    expect(result.localResponse).toBeDefined();
  });

  it("sugiere agente margy para enrollment_interest", async () => {
    generateTextMock.mockResolvedValue({ text: "enrollment_interest" });

    const result = await RouterAgentService.classifyIntent(
      "quiero inscribirme al bootcamp",
      "tenant-a",
      "funnel"
    );

    expect(result.intent).toBe("enrollment_interest");
    expect(result.suggestedAgent).toBe("margy");
    expect(result.shouldProceed).toBe(true);
  });

  it("sugiere kaled para objection", async () => {
    generateTextMock.mockResolvedValue({ text: "objection" });

    const result = await RouterAgentService.classifyIntent(
      "esta muy caro no creo que valga la pena",
      "tenant-a",
      "funnel"
    );

    expect(result.suggestedAgent).toBe("kaled");
  });

  it("intent invalido cae a 'academic' por defecto", async () => {
    generateTextMock.mockResolvedValue({ text: "categoria_inexistente" });

    const result = await RouterAgentService.classifyIntent(
      "consulta sobre algo random pero largo",
      "tenant-a"
    );

    expect(result.intent).toBe("academic");
    expect(result.shouldProceed).toBe(true);
  });

  it("si el modelo falla, deja pasar el mensaje (fail-open)", async () => {
    generateTextMock.mockRejectedValue(new Error("groq down"));

    const result = await RouterAgentService.classifyIntent(
      "consulta de prueba con error en el clasificador",
      "tenant-a"
    );

    expect(result.shouldProceed).toBe(true);
    expect(result.intent).toBe("academic");
  });
});
