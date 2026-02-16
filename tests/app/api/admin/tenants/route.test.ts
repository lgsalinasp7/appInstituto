import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/admin/tenants/route";

const mockPlatformUser = {
  id: "user-1",
  email: "admin@kaledsoft.tech",
  name: "Super Admin",
  tenantId: null,
  roleId: null,
  platformRole: "SUPER_ADMIN",
  role: null,
  isActive: true,
};

vi.mock("@/lib/api-auth", () => ({
  withPlatformAdmin: (
    _roles: string[],
    handler: (req: Request, user: unknown, context?: { params: Promise<Record<string, string>> }) => Promise<Response>
  ) => {
    return async (req: Request, context?: { params: Promise<Record<string, string>> }) =>
      handler(req, mockPlatformUser, context);
  },
}));

const mockTenantsResult = {
  tenants: [
    {
      id: "t1",
      name: "Edutec",
      slug: "edutec",
      status: "ACTIVO",
      _count: { users: 5, students: 100, payments: 50 },
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const mockCreatedTenant = {
  id: "t2",
  name: "Nuevo Instituto",
  slug: "nuevo-instituto",
  email: "admin@nuevo.edu",
  status: "ACTIVO",
};

vi.mock("@/modules/tenants", () => ({
  TenantsService: {
    getAll: vi.fn(),
    create: vi.fn(),
    isSlugAvailable: vi.fn(),
  },
}));

import { TenantsService } from "@/modules/tenants";

describe("GET /api/admin/tenants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TenantsService.getAll).mockResolvedValue(mockTenantsResult as any);
  });

  it("retorna lista de tenants con éxito", async () => {
    const request = new Request("http://localhost/api/admin/tenants");
    const response = await GET(request as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.tenants).toHaveLength(1);
    expect(json.data.tenants[0].slug).toBe("edutec");
  });

  it("pasa filtros desde query params", async () => {
    const request = new Request(
      "http://localhost/api/admin/tenants?search=edutec&status=ACTIVO&page=2&limit=5"
    );
    await GET(request as any);

    expect(TenantsService.getAll).toHaveBeenCalledWith({
      search: "edutec",
      status: "ACTIVO",
      plan: undefined,
      page: 2,
      limit: 5,
    });
  });
});

describe("POST /api/admin/tenants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TenantsService.isSlugAvailable).mockResolvedValue(true);
    vi.mocked(TenantsService.create).mockResolvedValue(mockCreatedTenant as any);
  });

  it("crea tenant con éxito", async () => {
    const request = new Request("http://localhost/api/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Nuevo Instituto",
        slug: "nuevo-instituto",
        email: "admin@nuevo.edu",
        adminPassword: "Admin123!",
      }),
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.slug).toBe("nuevo-instituto");
  });

  it("retorna 400 cuando faltan campos requeridos", async () => {
    const request = new Request("http://localhost/api/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Solo nombre",
        slug: "",
        email: "",
      }),
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain("requeridos");
  });

  it("retorna 400 cuando slug ya está en uso", async () => {
    vi.mocked(TenantsService.isSlugAvailable).mockResolvedValue(false);

    const request = new Request("http://localhost/api/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Instituto",
        slug: "edutec",
        email: "admin@test.edu",
      }),
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("El slug ya está en uso");
    expect(TenantsService.create).not.toHaveBeenCalled();
  });

  it("retorna 400 cuando slug tiene formato inválido", async () => {
    const request = new Request("http://localhost/api/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Instituto",
        slug: "EDUTEC_123",
        email: "admin@test.edu",
      }),
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain("letras minúsculas");
    expect(TenantsService.create).not.toHaveBeenCalled();
  });
});
