import { vi } from "vitest";

export const mockPrisma = {
  user: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
  session: {
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  tenant: { findUnique: vi.fn(), findFirst: vi.fn() },
  role: { findFirst: vi.fn() },
};

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: mockPrisma,
  prisma: mockPrisma,
}));
