/**
 * InteractionService tests
 * NOTE: Service is a placeholder until ProspectInteraction model exists
 */

import { describe, it, expect } from "vitest";
import { InteractionService } from "@/modules/prospects/services/interaction.service";

describe("InteractionService", () => {
  it("getInteractionsByProspect retorna array vacío (placeholder)", async () => {
    const result = await InteractionService.getInteractionsByProspect("prospect-1");

    expect(result).toEqual([]);
  });

  it("createInteraction lanza error (modelo no implementado)", async () => {
    await expect(
      InteractionService.createInteraction({
        type: "CALL",
        content: "Llamada realizada",
        prospectId: "p1",
        advisorId: "a1",
      })
    ).rejects.toThrow("ProspectInteraction model not yet implemented");
  });

  it("deleteInteraction lanza error (modelo no implementado)", async () => {
    await expect(InteractionService.deleteInteraction("i1")).rejects.toThrow(
      "ProspectInteraction model not yet implemented"
    );
  });
});
