import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProspectService } from "@/modules/prospects/services/prospect.service";

vi.mock("@/lib/tenant", () => ({
  getCurrentTenantId: vi.fn().mockResolvedValue("tenant-1"),
}));

const mockProspect = {
  id: "pr1",
  name: "María López",
  phone: "3001234567",
  email: "maria@test.com",
  status: "CONTACTO",
  program: { id: "p1", name: "Programa A" },
  advisor: { id: "a1", name: "Asesor", email: "asesor@test.com" },
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    prospect: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";

describe("ProspectService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.prospect.findMany).mockResolvedValue([mockProspect]);
    vi.mocked(prisma.prospect.count).mockResolvedValue(1);
  });

  describe("getProspects", () => {
    it("retorna lista paginada de prospectos", async () => {
      const result = await ProspectService.getProspects({
        page: 1,
        limit: 10,
      });

      expect(result.prospects).toHaveLength(1);
      expect(result.prospects[0].name).toBe("María López");
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it("aplica filtro de status", async () => {
      await ProspectService.getProspects({
        status: "CONTACTO",
      });

      expect(prisma.prospect.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: "tenant-1",
            status: "CONTACTO",
          }),
        })
      );
    });
  });
});
