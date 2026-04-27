import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  prisma: {
    kaledCampaign: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    kaledLead: {
      count: vi.fn(),
      update: vi.fn(),
    },
    kaledEmailLog: {
      findMany: vi.fn(),
    },
    kaledEmailTemplate: {
      create: vi.fn(),
    },
    kaledEmailSequence: {
      create: vi.fn(),
    },
    kaledEmailSequenceStep: {
      create: vi.fn(),
    },
  },
  default: {},
}));

import { prisma } from "@/lib/prisma";
import { KaledCampaignService } from "@/modules/kaled-crm/services/kaled-campaign.service";

const TENANT_A = "tenant-a";
type MockedFn = ReturnType<typeof vi.fn>;

describe("KaledCampaignService.createCampaign", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea campana con tenantId y status DRAFT", async () => {
    (prisma.kaledCampaign.create as MockedFn).mockResolvedValue({
      id: "c1",
      status: "DRAFT",
    });

    await KaledCampaignService.createCampaign(TENANT_A, {
      name: "Black Friday",
      description: "Promo",
      timeline: { phases: [] },
    });

    const call = (prisma.kaledCampaign.create as MockedFn).mock.calls[0][0];
    expect(call.data.tenantId).toBe(TENANT_A);
    expect(call.data.status).toBe("DRAFT");
    expect(call.data.name).toBe("Black Friday");
  });
});

describe("KaledCampaignService.getCampaignMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cuenta como 'enviados' los emails con status SENT|DELIVERED|OPENED|CLICKED (PR #30)", async () => {
    const created = new Date("2026-01-01T00:00:00Z");
    const updated = new Date("2026-01-06T00:00:00Z"); // 5 days later

    (prisma.kaledCampaign.findUnique as MockedFn).mockResolvedValue({
      id: "c1",
      name: "Test",
      status: "ACTIVE",
      startDate: created,
      endDate: null,
      leads: [
        {
          id: "l1",
          status: "CONVERTIDO",
          createdAt: created,
          updatedAt: updated,
        },
        {
          id: "l2",
          status: "NUEVO",
          createdAt: created,
          updatedAt: created,
        },
        {
          id: "l3",
          status: "CONTACTADO",
          createdAt: created,
          updatedAt: created,
        },
        {
          id: "l4",
          status: "PERDIDO",
          createdAt: created,
          updatedAt: created,
        },
      ],
    });

    (prisma.kaledEmailLog.findMany as MockedFn).mockResolvedValue([
      { status: "SENT", openedAt: null },
      { status: "DELIVERED", openedAt: null },
      { status: "OPENED", openedAt: new Date() },
      { status: "CLICKED", openedAt: new Date() },
      { status: "BOUNCED", openedAt: null }, // NO debe contar
      { status: "PENDING", openedAt: null }, // NO debe contar
    ]);

    const metrics = await KaledCampaignService.getCampaignMetrics("c1");

    expect(metrics.totalLeads).toBe(4);
    expect(metrics.newLeads).toBe(1);
    expect(metrics.contactedLeads).toBe(1);
    expect(metrics.convertedLeads).toBe(1);
    expect(metrics.lostLeads).toBe(1);
    expect(metrics.conversionRate).toBe(25); // 1/4 * 100
    expect(metrics.averageTimeToConversion).toBe(5);

    // emailsSent: SENT + DELIVERED + OPENED + CLICKED = 4 (excluye BOUNCED, PENDING)
    expect(metrics.emailsSent).toBe(4);
    expect(metrics.emailsOpened).toBe(2);
    expect(metrics.emailOpenRate).toBe(50); // 2/4 * 100
  });

  it("emailOpenRate = 0 sin emails enviados", async () => {
    (prisma.kaledCampaign.findUnique as MockedFn).mockResolvedValue({
      id: "c1",
      name: "Empty",
      status: "DRAFT",
      startDate: null,
      endDate: null,
      leads: [],
    });
    (prisma.kaledEmailLog.findMany as MockedFn).mockResolvedValue([]);

    const metrics = await KaledCampaignService.getCampaignMetrics("c1");

    expect(metrics.emailsSent).toBe(0);
    expect(metrics.emailOpenRate).toBe(0);
    expect(metrics.conversionRate).toBe(0);
  });

  it("lanza error si campana no existe", async () => {
    (prisma.kaledCampaign.findUnique as MockedFn).mockResolvedValue(null);

    await expect(
      KaledCampaignService.getCampaignMetrics("nope")
    ).rejects.toThrow("Campaña no encontrada");
  });
});

describe("KaledCampaignService transitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("startCampaign rechaza si ya esta ACTIVE", async () => {
    (prisma.kaledCampaign.findUnique as MockedFn).mockResolvedValue({
      id: "c1",
      status: "ACTIVE",
    });

    await expect(KaledCampaignService.startCampaign("c1")).rejects.toThrow(
      "ya está activa"
    );
    expect(prisma.kaledCampaign.update).not.toHaveBeenCalled();
  });

  it("startCampaign de DRAFT a ACTIVE setea startDate si no existe", async () => {
    (prisma.kaledCampaign.findUnique as MockedFn).mockResolvedValue({
      id: "c1",
      status: "DRAFT",
      startDate: null,
    });
    (prisma.kaledCampaign.update as MockedFn).mockResolvedValue({
      id: "c1",
      status: "ACTIVE",
    });

    await KaledCampaignService.startCampaign("c1");

    const call = (prisma.kaledCampaign.update as MockedFn).mock.calls[0][0];
    expect(call.data.status).toBe("ACTIVE");
    expect(call.data.startDate).toBeInstanceOf(Date);
  });

  it("deleteCampaign rechaza si tiene leads asociados", async () => {
    (prisma.kaledLead.count as MockedFn).mockResolvedValue(3);

    await expect(KaledCampaignService.deleteCampaign("c1")).rejects.toThrow(
      /3 leads asociados/
    );
    expect(prisma.kaledCampaign.delete).not.toHaveBeenCalled();
  });

  it("deleteCampaign permite borrar si no hay leads", async () => {
    (prisma.kaledLead.count as MockedFn).mockResolvedValue(0);
    (prisma.kaledCampaign.delete as MockedFn).mockResolvedValue({ id: "c1" });

    await KaledCampaignService.deleteCampaign("c1");

    expect(prisma.kaledCampaign.delete).toHaveBeenCalledWith({
      where: { id: "c1" },
    });
  });
});

describe("KaledCampaignService.getActiveCampaigns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filtra por tenantId y status ACTIVE", async () => {
    (prisma.kaledCampaign.findMany as MockedFn).mockResolvedValue([]);

    await KaledCampaignService.getActiveCampaigns(TENANT_A);

    const call = (prisma.kaledCampaign.findMany as MockedFn).mock.calls[0][0];
    expect(call.where.tenantId).toBe(TENANT_A);
    expect(call.where.status).toBe("ACTIVE");
  });
});
