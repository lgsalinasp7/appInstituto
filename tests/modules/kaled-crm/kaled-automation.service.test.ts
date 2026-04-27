import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  prisma: {
    kaledEmailSequence: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    kaledEmailLog: {
      create: vi.fn(),
      update: vi.fn(),
    },
    kaledLead: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    kaledLeadInteraction: {
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
  default: {},
}));

import { prisma } from "@/lib/prisma";
import {
  triggerSequenceByStage,
  handleEmailOpened,
  handleEmailDelivered,
  handleEmailBounced,
  updateInterestLevel,
} from "@/modules/kaled-crm/services/kaled-automation.service";

const TENANT_A = "tenant-a";
type MockedFn = ReturnType<typeof vi.fn>;

describe("triggerSequenceByStage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filtra secuencias por tenantId, triggerType STAGE_BASED y isActive", async () => {
    (prisma.kaledEmailSequence.findMany as MockedFn).mockResolvedValue([]);

    const result = await triggerSequenceByStage("lead-1", "NUEVO", TENANT_A);

    expect(result).toEqual({ triggered: 0 });
    const call = (prisma.kaledEmailSequence.findMany as MockedFn).mock
      .calls[0][0];
    expect(call.where.tenantId).toBe(TENANT_A);
    expect(call.where.triggerType).toBe("STAGE_BASED");
    expect(call.where.isActive).toBe(true);
  });

  it("matching case-insensitive contra targetStage en triggerConfig", async () => {
    const sequence = {
      id: "seq-1",
      name: "Welcome",
      triggerConfig: { targetStage: "nuevo" },
      steps: [],
    };
    (prisma.kaledEmailSequence.findMany as MockedFn).mockResolvedValue([
      sequence,
      {
        id: "seq-2",
        name: "Lost",
        triggerConfig: { targetStage: "PERDIDO" },
        steps: [],
      },
    ]);
    (prisma.kaledEmailSequence.findUnique as MockedFn).mockResolvedValue({
      ...sequence,
      steps: [],
    });
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue({
      id: "lead-1",
      email: "x@y.com",
      campaign: null,
    });
    (prisma.kaledLead.update as MockedFn).mockResolvedValue({});

    const result = await triggerSequenceByStage("lead-1", "NUEVO", TENANT_A);

    expect(result.triggered).toBe(1);
  });
});

describe("handleEmailOpened", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("actualiza email log a OPENED + incrementa lead.emailOpens y recalcula score", async () => {
    (prisma.kaledEmailLog.update as MockedFn).mockResolvedValue({});
    (prisma.kaledLead.update as MockedFn).mockResolvedValue({});
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue({
      id: "lead-1",
      emailOpens: 1,
      emailClicks: 0,
      masterclassRegisteredAt: null,
      masterclassAttendedAt: null,
      purchasedAt: null,
      lastEmailSentAt: null,
      lastEmailOpenedAt: null,
      leadScore: 0,
      status: "NUEVO",
      createdAt: new Date(),
    });
    (prisma.kaledLeadInteraction.count as MockedFn).mockResolvedValue(0);
    (prisma.kaledLeadInteraction.findFirst as MockedFn).mockResolvedValue(null);

    await handleEmailOpened("log-1", "lead-1");

    const logCall = (prisma.kaledEmailLog.update as MockedFn).mock.calls[0][0];
    expect(logCall.where).toEqual({ id: "log-1" });
    expect(logCall.data.status).toBe("OPENED");
    expect(logCall.data.openedAt).toBeInstanceOf(Date);
    expect(logCall.data.openCount).toEqual({ increment: 1 });

    const leadCall = (prisma.kaledLead.update as MockedFn).mock.calls[0][0];
    expect(leadCall.where).toEqual({ id: "lead-1" });
    expect(leadCall.data.emailOpens).toEqual({ increment: 1 });
    expect(leadCall.data.lastEmailOpenedAt).toBeInstanceOf(Date);
  });
});

describe("handleEmailDelivered / handleEmailBounced", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handleEmailDelivered marca status DELIVERED", async () => {
    (prisma.kaledEmailLog.update as MockedFn).mockResolvedValue({});

    await handleEmailDelivered("log-1");

    const call = (prisma.kaledEmailLog.update as MockedFn).mock.calls[0][0];
    expect(call.data.status).toBe("DELIVERED");
    expect(call.data.deliveredAt).toBeInstanceOf(Date);
  });

  it("handleEmailBounced marca status BOUNCED", async () => {
    (prisma.kaledEmailLog.update as MockedFn).mockResolvedValue({});

    await handleEmailBounced("log-1");

    const call = (prisma.kaledEmailLog.update as MockedFn).mock.calls[0][0];
    expect(call.data.status).toBe("BOUNCED");
    expect(call.data.bouncedAt).toBeInstanceOf(Date);
  });
});

describe("updateInterestLevel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("score >= 61 => high", async () => {
    (prisma.kaledLead.update as MockedFn).mockResolvedValue({});

    const result = await updateInterestLevel("lead-1", 75);

    expect(result).toBe("high");
    const call = (prisma.kaledLead.update as MockedFn).mock.calls[0][0];
    expect(call.data.interestLevel).toBe("high");
  });

  it("score 31-60 => medium", async () => {
    (prisma.kaledLead.update as MockedFn).mockResolvedValue({});

    const result = await updateInterestLevel("lead-1", 45);

    expect(result).toBe("medium");
  });

  it("score 0-30 => low", async () => {
    (prisma.kaledLead.update as MockedFn).mockResolvedValue({});

    const result = await updateInterestLevel("lead-1", 15);

    expect(result).toBe("low");
  });

  it("si no se pasa score, lo lee del lead", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue({
      leadScore: 80,
    });
    (prisma.kaledLead.update as MockedFn).mockResolvedValue({});

    const result = await updateInterestLevel("lead-1");

    expect(result).toBe("high");
    expect(prisma.kaledLead.findUnique).toHaveBeenCalled();
  });
});
