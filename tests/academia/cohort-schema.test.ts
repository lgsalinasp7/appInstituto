import { describe, it, expect } from "vitest";
import { createCohortSchema } from "@/modules/academia/schemas";

describe("createCohortSchema", () => {
  it("acepta kind ACADEMIC y PROMOTIONAL con promoPreset", () => {
    const base = {
      name: "Test",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-05-01"),
      status: "DRAFT" as const,
      schedule: {},
      courseId: "c1",
    };
    const academic = createCohortSchema.parse({ ...base, kind: "ACADEMIC" });
    expect(academic.kind).toBe("ACADEMIC");
    expect(academic.maxStudents).toBe(40);

    const promo = createCohortSchema.parse({
      ...base,
      kind: "PROMOTIONAL",
      promoPreset: "DAYS_3",
      campaignLabel: "FB",
    });
    expect(promo.kind).toBe("PROMOTIONAL");
    expect(promo.promoPreset).toBe("DAYS_3");
  });
});
