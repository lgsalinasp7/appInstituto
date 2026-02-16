/**
 * Config module tests
 * Tests for config API and related logic
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api-auth", () => ({
  withTenantAuthAndCSRF: (handler: (req: Request, user: any, tenantId: string) => Promise<Response>) =>
    async (req: Request) => handler(req, { id: "u1" }, "tenant-1"),
}));

const mockUpsert = vi.fn();
vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    systemConfig: { upsert: mockUpsert },
    user: {},
    session: {},
    tenant: {},
    role: {},
  },
}));

// Dynamic import after mocks
const getConfigRoute = () => import("@/app/api/config/route").then((m) => m.POST);

describe("Config API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({
      id: "c1",
      key: "MONTHLY_GOAL",
      value: "10000000",
      tenantId: "tenant-1",
    });
  });

  it("retorna 400 cuando faltan key o value", async () => {
    const POST = await getConfigRoute();
    const request = new Request("http://localhost/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await (POST as any)(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain("required");
  });

  it("crea/actualiza config con key y value válidos", async () => {
    const POST = await getConfigRoute();
    const request = new Request("http://localhost/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "MONTHLY_GOAL", value: "10000000" }),
    });

    const response = await (POST as any)(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key_tenantId: { key: "MONTHLY_GOAL", tenantId: "tenant-1" } },
        update: { value: "10000000" },
        create: expect.objectContaining({ key: "MONTHLY_GOAL", value: "10000000", tenantId: "tenant-1" }),
      })
    );
  });
});
