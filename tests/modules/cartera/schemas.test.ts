import { describe, it, expect } from "vitest";
import {
  createPaymentCommitmentSchema,
  updatePaymentCommitmentSchema,
} from "@/modules/cartera/schemas";

const todayMidday = () => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
};
const yesterday = () => {
  const d = todayMidday();
  d.setDate(d.getDate() - 1);
  return d;
};
const tomorrow = () => {
  const d = todayMidday();
  d.setDate(d.getDate() + 1);
  return d;
};

describe("createPaymentCommitmentSchema — validacion scheduledDate + allowPastDate", () => {
  it("rechaza fechas pasadas por default (allowPastDate=false implicito)", () => {
    const result = createPaymentCommitmentSchema.safeParse({
      studentId: "s1",
      scheduledDate: yesterday(),
      amount: 100000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = result.error.flatten();
      expect(JSON.stringify(flat.fieldErrors)).toMatch(/anterior a hoy|allowPastDate/);
    }
  });

  it("acepta fecha pasada cuando allowPastDate=true", () => {
    const result = createPaymentCommitmentSchema.safeParse({
      studentId: "s1",
      scheduledDate: yesterday(),
      amount: 100000,
      allowPastDate: true,
    });
    expect(result.success).toBe(true);
  });

  it("acepta fecha futura sin allowPastDate", () => {
    const result = createPaymentCommitmentSchema.safeParse({
      studentId: "s1",
      scheduledDate: tomorrow(),
      amount: 100000,
    });
    expect(result.success).toBe(true);
  });
});

describe("updatePaymentCommitmentSchema — validacion scheduledDate + allowPastDate", () => {
  it("rechaza scheduledDate pasada en update sin allowPastDate", () => {
    const result = updatePaymentCommitmentSchema.safeParse({
      scheduledDate: yesterday(),
    });
    expect(result.success).toBe(false);
  });

  it("acepta update sin scheduledDate (no aplica regla)", () => {
    const result = updatePaymentCommitmentSchema.safeParse({
      amount: 50000,
    });
    expect(result.success).toBe(true);
  });
});
