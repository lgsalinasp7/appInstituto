import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  prisma: {
    tenant: {
      findUnique: vi.fn(),
    },
    kaledLead: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    kaledLeadInteraction: {
      count: vi.fn(),
    },
    kaledEmailLog: {
      count: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
  default: {},
}));

vi.mock("@/modules/kaled-crm/services/kaled-automation.service", () => ({
  triggerSequenceByStage: vi.fn().mockResolvedValue({ triggered: 0 }),
}));

vi.mock("@/modules/kaled-crm/services/kaled-interaction.service", () => ({
  KaledInteractionService: {
    logStatusChange: vi.fn().mockResolvedValue(undefined),
    getTimeline: vi.fn().mockResolvedValue([]),
    getStats: vi.fn().mockResolvedValue({}),
  },
}));

import { prisma } from "@/lib/prisma";
import { KaledLeadService } from "@/modules/masterclass/services/kaled-lead.service";
import { triggerSequenceByStage } from "@/modules/kaled-crm/services/kaled-automation.service";
import type { LeadRegistration } from "@/modules/masterclass/types";

const TENANT_A = "tenant-a-id";
const TENANT_B = "tenant-b-id";
const KALED_FALLBACK_ID = "kaledsoft-tenant-id";

type MockedFn = ReturnType<typeof vi.fn>;

const baseLead: LeadRegistration = {
  name: "Juan Perez",
  email: "juan@test.com",
  phone: "3001234567",
  city: "Bogota",
};

describe("KaledLeadService.captureLead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea un lead nuevo y dispara la secuencia inicial cuando no existe", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue(null);
    (prisma.kaledLead.create as MockedFn).mockResolvedValue({
      id: "lead-1",
      status: "NUEVO",
      tenantId: TENANT_A,
    });

    const result = await KaledLeadService.captureLead(baseLead, TENANT_A);

    expect(result).toEqual({ leadId: "lead-1" });
    expect(prisma.kaledLead.create).toHaveBeenCalledTimes(1);
    const callArg = (prisma.kaledLead.create as MockedFn).mock.calls[0][0];
    expect(callArg.data.tenantId).toBe(TENANT_A);
    expect(callArg.data.email).toBe("juan@test.com");
    expect(callArg.data.status).toBe("NUEVO");
    expect(triggerSequenceByStage).toHaveBeenCalledWith(
      "lead-1",
      "NUEVO",
      TENANT_A
    );
  });

  it("aplica fallback a tenant 'kaledsoft' cuando no se pasa tenantId (commit 0dd2638)", async () => {
    (prisma.tenant.findUnique as MockedFn).mockResolvedValue({
      id: KALED_FALLBACK_ID,
    });
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue(null);
    (prisma.kaledLead.create as MockedFn).mockResolvedValue({
      id: "lead-2",
      status: "NUEVO",
      tenantId: KALED_FALLBACK_ID,
    });

    const result = await KaledLeadService.captureLead(baseLead);

    expect(result).toEqual({ leadId: "lead-2" });
    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { slug: "kaledsoft" },
      select: { id: true },
    });
    const createArg = (prisma.kaledLead.create as MockedFn).mock.calls[0][0];
    expect(createArg.data.tenantId).toBe(KALED_FALLBACK_ID);
  });

  it("lanza error si fallback tenant 'kaledsoft' no existe en DB", async () => {
    (prisma.tenant.findUnique as MockedFn).mockResolvedValue(null);

    await expect(KaledLeadService.captureLead(baseLead)).rejects.toThrow(
      /tenant fallback 'kaledsoft'/
    );

    expect(prisma.kaledLead.create).not.toHaveBeenCalled();
  });

  it("dedup: actualiza lead existente en lugar de crear duplicado (mismo email + tenantId)", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue({
      id: "existing-lead",
      email: baseLead.email,
      tenantId: TENANT_A,
      name: "Old Name",
      phone: null,
      observations: "previo",
      status: "CONTACTADO",
    });
    (prisma.kaledLead.update as MockedFn).mockResolvedValue({
      id: "existing-lead",
    });

    const result = await KaledLeadService.captureLead(baseLead, TENANT_A);

    expect(result).toEqual({ leadId: "existing-lead" });
    expect(prisma.kaledLead.create).not.toHaveBeenCalled();
    expect(prisma.kaledLead.update).toHaveBeenCalledTimes(1);
    // Dedup NO dispara nueva secuencia (solo en creacion)
    expect(triggerSequenceByStage).not.toHaveBeenCalled();
  });

  it("aislamiento multi-tenant: busca lead existente filtrando por composite (email + tenantId)", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue(null);
    (prisma.kaledLead.create as MockedFn).mockResolvedValue({
      id: "lead-x",
      status: "NUEVO",
      tenantId: TENANT_B,
    });

    await KaledLeadService.captureLead(baseLead, TENANT_B);

    const findCall = (prisma.kaledLead.findUnique as MockedFn).mock.calls[0][0];
    expect(findCall.where).toEqual({
      email_tenantId: { email: baseLead.email, tenantId: TENANT_B },
    });
  });

  it("no falla si triggerSequenceByStage lanza error (lead ya creado)", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue(null);
    (prisma.kaledLead.create as MockedFn).mockResolvedValue({
      id: "lead-3",
      status: "NUEVO",
      tenantId: TENANT_A,
    });
    (triggerSequenceByStage as MockedFn).mockRejectedValueOnce(
      new Error("sequence failure")
    );

    const result = await KaledLeadService.captureLead(baseLead, TENANT_A);

    expect(result).toEqual({ leadId: "lead-3" });
  });
});

describe("KaledLeadService.getAllLeads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filtra por tenantId y excluye soft-deleted", async () => {
    (prisma.kaledLead.findMany as MockedFn).mockResolvedValue([]);

    await KaledLeadService.getAllLeads(TENANT_A);

    const call = (prisma.kaledLead.findMany as MockedFn).mock.calls[0][0];
    expect(call.where).toEqual({ deletedAt: null, tenantId: TENANT_A });
  });
});

describe("KaledLeadService.searchLeads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aplica tenantId, filtros y paginacion", async () => {
    (prisma.kaledLead.findMany as MockedFn).mockResolvedValue([]);
    (prisma.kaledLead.count as MockedFn).mockResolvedValue(0);

    const result = await KaledLeadService.searchLeads(TENANT_A, {
      search: "juan",
      status: "NUEVO",
      limit: 10,
      offset: 20,
    });

    expect(result.limit).toBe(10);
    expect(result.offset).toBe(20);
    expect(result.hasMore).toBe(false);

    const findCall = (prisma.kaledLead.findMany as MockedFn).mock.calls[0][0];
    expect(findCall.where.tenantId).toBe(TENANT_A);
    expect(findCall.where.deletedAt).toBeNull();
    expect(findCall.where.status).toBe("NUEVO");
    expect(findCall.take).toBe(10);
    expect(findCall.skip).toBe(20);
  });

  it("includeDeleted=true no filtra deletedAt", async () => {
    (prisma.kaledLead.findMany as MockedFn).mockResolvedValue([]);
    (prisma.kaledLead.count as MockedFn).mockResolvedValue(0);

    await KaledLeadService.searchLeads(TENANT_A, { includeDeleted: true });

    const findCall = (prisma.kaledLead.findMany as MockedFn).mock.calls[0][0];
    expect(findCall.where.deletedAt).toBeUndefined();
    expect(findCall.where.tenantId).toBe(TENANT_A);
  });
});

describe("KaledLeadService.deleteLead / restoreLead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deleteLead lanza error si lead no existe", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue(null);

    await expect(
      KaledLeadService.deleteLead("nope", "user-1")
    ).rejects.toThrow("Lead no encontrado");
  });

  it("deleteLead lanza error si ya esta eliminado", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue({
      id: "lead-1",
      deletedAt: new Date(),
    });

    await expect(
      KaledLeadService.deleteLead("lead-1", "user-1")
    ).rejects.toThrow("ya está eliminado");
  });

  it("restoreLead lanza error si lead no esta eliminado", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue({
      id: "lead-1",
      deletedAt: null,
    });

    await expect(KaledLeadService.restoreLead("lead-1")).rejects.toThrow(
      "no está eliminado"
    );
  });
});

describe("KaledLeadService.captureLead — campos opcionales (UTM/attribution)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("incluye attribution (fbclid/gclid/ttclid) en filteringData del nuevo lead", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue(null);
    (prisma.kaledLead.create as MockedFn).mockResolvedValue({
      id: "lead-attr",
      status: "NUEVO",
      tenantId: TENANT_A,
    });

    await KaledLeadService.captureLead(
      {
        ...baseLead,
        fbclid: "fb-123",
        gclid: "gc-456",
        ttclid: "tt-789",
        utmSource: "facebook",
        utmCampaign: "masterclass-2026",
      },
      TENANT_A
    );

    const arg = (prisma.kaledLead.create as MockedFn).mock.calls[0][0];
    expect(arg.data.utmSource).toBe("facebook");
    expect(arg.data.utmCampaign).toBe("masterclass-2026");
    expect(arg.data.filteringData).toMatchObject({
      attribution: { fbclid: "fb-123", gclid: "gc-456", ttclid: "tt-789" },
    });
  });

  it("source LANDING cuando no se pasa masterclassSlug", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue(null);
    (prisma.kaledLead.create as MockedFn).mockResolvedValue({
      id: "lead-1",
      status: "NUEVO",
      tenantId: TENANT_A,
    });

    await KaledLeadService.captureLead(baseLead, TENANT_A);

    const arg = (prisma.kaledLead.create as MockedFn).mock.calls[0][0];
    expect(arg.data.source).toBe("LANDING");
  });

  it("source MASTERCLASS:<slug> cuando se proporciona masterclassSlug", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue(null);
    (prisma.kaledLead.create as MockedFn).mockResolvedValue({
      id: "lead-1",
      status: "NUEVO",
      tenantId: TENANT_A,
    });

    await KaledLeadService.captureLead(
      { ...baseLead, masterclassSlug: "ia-aplicada" },
      TENANT_A
    );

    const arg = (prisma.kaledLead.create as MockedFn).mock.calls[0][0];
    expect(arg.data.source).toBe("MASTERCLASS: ia-aplicada");
  });
});

describe("KaledLeadService.updateLead — cambio de status dispara secuencia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dispara triggerSequenceByStage cuando cambia el status", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue({
      id: "lead-1",
      status: "NUEVO",
      tenantId: TENANT_A,
    });
    (prisma.kaledLead.update as MockedFn).mockResolvedValue({
      id: "lead-1",
      status: "CONTACTADO",
    });

    await KaledLeadService.updateLead(
      "lead-1",
      { status: "CONTACTADO" },
      "user-1"
    );

    expect(triggerSequenceByStage).toHaveBeenCalledWith(
      "lead-1",
      "CONTACTADO",
      TENANT_A
    );
  });

  it("NO dispara secuencia si el status no cambia", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue({
      id: "lead-1",
      status: "NUEVO",
      tenantId: TENANT_A,
    });
    (prisma.kaledLead.update as MockedFn).mockResolvedValue({
      id: "lead-1",
      status: "NUEVO",
    });

    await KaledLeadService.updateLead("lead-1", { name: "Nuevo nombre" });

    expect(triggerSequenceByStage).not.toHaveBeenCalled();
  });

  it("lanza error si el lead no existe", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue(null);

    await expect(
      KaledLeadService.updateLead("no-existe", { status: "CONTACTADO" })
    ).rejects.toThrow("Lead no encontrado");

    expect(prisma.kaledLead.update).not.toHaveBeenCalled();
  });
});

describe("KaledLeadService.getLeadMetrics — agregaciones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calcula daysActive + counts de interacciones y emails", async () => {
    const createdAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 días
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue({
      id: "lead-1",
      name: "Juan",
      email: "juan@test.com",
      status: "CONTACTADO",
      createdAt,
      updatedAt: new Date(),
    });
    (prisma.kaledLeadInteraction.count as MockedFn).mockResolvedValue(7);
    (prisma.kaledEmailLog.count as MockedFn).mockResolvedValue(3);

    const result = await KaledLeadService.getLeadMetrics("lead-1");

    expect(result.totalInteractions).toBe(7);
    expect(result.emailsSent).toBe(3);
    expect(result.daysActive).toBeGreaterThanOrEqual(4);
    expect(result.daysActive).toBeLessThanOrEqual(6);

    // Solo cuenta emails con status SENT
    const emailCall = (prisma.kaledEmailLog.count as MockedFn).mock.calls[0][0];
    expect(emailCall.where).toMatchObject({
      kaledLeadId: "lead-1",
      status: "SENT",
    });
  });

  it("lanza error si el lead no existe", async () => {
    (prisma.kaledLead.findUnique as MockedFn).mockResolvedValue(null);
    (prisma.kaledLeadInteraction.count as MockedFn).mockResolvedValue(0);
    (prisma.kaledEmailLog.count as MockedFn).mockResolvedValue(0);

    await expect(
      KaledLeadService.getLeadMetrics("no-existe")
    ).rejects.toThrow("Lead no encontrado");
  });
});

describe("KaledLeadService.searchLeads — filtros adicionales", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aplica filtro por campaignId", async () => {
    (prisma.kaledLead.findMany as MockedFn).mockResolvedValue([]);
    (prisma.kaledLead.count as MockedFn).mockResolvedValue(0);

    await KaledLeadService.searchLeads(TENANT_A, {
      campaignId: "campaign-99",
    });

    const call = (prisma.kaledLead.findMany as MockedFn).mock.calls[0][0];
    expect(call.where.campaignId).toBe("campaign-99");
    expect(call.where.tenantId).toBe(TENANT_A);
  });

  it("hasMore=true cuando offset+limit < total", async () => {
    (prisma.kaledLead.findMany as MockedFn).mockResolvedValue([]);
    (prisma.kaledLead.count as MockedFn).mockResolvedValue(150);

    const result = await KaledLeadService.searchLeads(TENANT_A, {
      limit: 50,
      offset: 0,
    });

    expect(result.total).toBe(150);
    expect(result.hasMore).toBe(true);
  });

  it("aislamiento: filtra siempre por tenantId aun con búsqueda", async () => {
    (prisma.kaledLead.findMany as MockedFn).mockResolvedValue([]);
    (prisma.kaledLead.count as MockedFn).mockResolvedValue(0);

    await KaledLeadService.searchLeads(TENANT_B, { search: "juan" });

    const call = (prisma.kaledLead.findMany as MockedFn).mock.calls[0][0];
    expect(call.where.tenantId).toBe(TENANT_B);
    expect(call.where.OR).toBeDefined();
  });
});
