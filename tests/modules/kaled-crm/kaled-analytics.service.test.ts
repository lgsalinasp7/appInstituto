import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  prisma: {
    kaledLead: {
      count: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    kaledEmailLog: {
      count: vi.fn(),
    },
    kaledLeadInteraction: {
      findMany: vi.fn(),
    },
    kaledCampaign: {
      findMany: vi.fn(),
    },
  },
  default: {},
}));

import { prisma } from "@/lib/prisma";
import { KaledAnalyticsService } from "@/modules/kaled-crm/services/kaled-analytics.service";

const TENANT_A = "tenant-a";
type MockedFn = ReturnType<typeof vi.fn>;

describe("KaledAnalyticsService.getOverviewMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calcula emailOpenRate considerando estados SENT|DELIVERED|OPENED|CLICKED como 'enviados' (PR #30)", async () => {
    // 7 counts en orden: total, newThisMonth, active, converted, lost, sent, opened
    (prisma.kaledLead.count as MockedFn)
      .mockResolvedValueOnce(100) // totalLeads
      .mockResolvedValueOnce(20) // newLeadsThisMonth
      .mockResolvedValueOnce(40) // activeLeads
      .mockResolvedValueOnce(10) // convertedLeads
      .mockResolvedValueOnce(5); // lostLeads
    (prisma.kaledEmailLog.count as MockedFn)
      .mockResolvedValueOnce(50) // emailsSent
      .mockResolvedValueOnce(20); // emailsOpened
    (prisma.kaledLead.findMany as MockedFn)
      .mockResolvedValueOnce([]) // convertedLeadsData
      .mockResolvedValueOnce([]); // leadIds for response time
    (prisma.kaledLeadInteraction.findMany as MockedFn).mockResolvedValue([]);

    const result = await KaledAnalyticsService.getOverviewMetrics(TENANT_A);

    expect(result.emailsSentThisMonth).toBe(50);
    expect(result.emailOpenRate).toBe(40); // 20/50 * 100
    expect(result.conversionRate).toBe(10); // 10/100 * 100

    // Verificar que el conteo de "sent" incluye los 4 estados
    const sentCallArg = (prisma.kaledEmailLog.count as MockedFn).mock
      .calls[0][0];
    expect(sentCallArg.where.status.in).toEqual([
      "SENT",
      "DELIVERED",
      "OPENED",
      "CLICKED",
    ]);
    expect(sentCallArg.where.tenantId).toBe(TENANT_A);

    // Verificar que el conteo de "opened" usa openedAt != null (Resend webhook)
    const openedCallArg = (prisma.kaledEmailLog.count as MockedFn).mock
      .calls[1][0];
    expect(openedCallArg.where.openedAt).toEqual({ not: null });
    expect(openedCallArg.where.tenantId).toBe(TENANT_A);
  });

  it("emailOpenRate = 0 cuando no hay emails enviados (evita division por cero)", async () => {
    (prisma.kaledLead.count as MockedFn)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    (prisma.kaledEmailLog.count as MockedFn)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    (prisma.kaledLead.findMany as MockedFn)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    (prisma.kaledLeadInteraction.findMany as MockedFn).mockResolvedValue([]);

    const result = await KaledAnalyticsService.getOverviewMetrics(TENANT_A);

    expect(result.emailOpenRate).toBe(0);
    expect(result.conversionRate).toBe(0);
  });

  it("aislamiento tenantId: todas las queries de kaledLead.count filtran por tenantId", async () => {
    (prisma.kaledLead.count as MockedFn).mockResolvedValue(0);
    (prisma.kaledEmailLog.count as MockedFn).mockResolvedValue(0);
    (prisma.kaledLead.findMany as MockedFn).mockResolvedValue([]);
    (prisma.kaledLeadInteraction.findMany as MockedFn).mockResolvedValue([]);

    await KaledAnalyticsService.getOverviewMetrics(TENANT_A);

    const calls = (prisma.kaledLead.count as MockedFn).mock.calls;
    expect(calls.length).toBe(5);
    for (const [arg] of calls) {
      expect(arg.where.tenantId).toBe(TENANT_A);
    }
  });

  it("calcula averageTimeToConversion en dias", async () => {
    (prisma.kaledLead.count as MockedFn).mockResolvedValue(0);
    (prisma.kaledEmailLog.count as MockedFn).mockResolvedValue(0);

    const created = new Date("2026-01-01T00:00:00Z");
    const updated = new Date("2026-01-11T00:00:00Z"); // 10 days later

    (prisma.kaledLead.findMany as MockedFn)
      .mockResolvedValueOnce([{ createdAt: created, updatedAt: updated }])
      .mockResolvedValueOnce([]);
    (prisma.kaledLeadInteraction.findMany as MockedFn).mockResolvedValue([]);

    const result = await KaledAnalyticsService.getOverviewMetrics(TENANT_A);

    expect(result.averageTimeToConversion).toBe(10);
  });
});

describe("KaledAnalyticsService.getLeadsByStatus / getLeadsBySource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getLeadsByStatus aplica tenantId y deletedAt: null", async () => {
    (prisma.kaledLead.groupBy as MockedFn).mockResolvedValue([
      { status: "NUEVO", _count: 5 },
    ]);

    const result = await KaledAnalyticsService.getLeadsByStatus(TENANT_A);

    expect(result).toEqual([{ status: "NUEVO", count: 5 }]);
    const call = (prisma.kaledLead.groupBy as MockedFn).mock.calls[0][0];
    expect(call.where).toEqual({ deletedAt: null, tenantId: TENANT_A });
    expect(call.by).toEqual(["status"]);
  });

  it("getLeadsBySource aplica tenantId y deletedAt: null", async () => {
    (prisma.kaledLead.groupBy as MockedFn).mockResolvedValue([]);

    await KaledAnalyticsService.getLeadsBySource(TENANT_A);

    const call = (prisma.kaledLead.groupBy as MockedFn).mock.calls[0][0];
    expect(call.where.tenantId).toBe(TENANT_A);
    expect(call.by).toEqual(["source"]);
  });
});

describe("KaledAnalyticsService.getLeadsTrend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("agrupa leads por dia (formato YYYY-MM-DD)", async () => {
    (prisma.kaledLead.findMany as MockedFn).mockResolvedValue([
      { createdAt: new Date("2026-04-25T10:00:00Z") },
      { createdAt: new Date("2026-04-25T15:00:00Z") },
      { createdAt: new Date("2026-04-26T08:00:00Z") },
    ]);

    const result = await KaledAnalyticsService.getLeadsTrend(TENANT_A);

    expect(result).toEqual([
      { date: "2026-04-25", count: 2 },
      { date: "2026-04-26", count: 1 },
    ]);
  });
});
