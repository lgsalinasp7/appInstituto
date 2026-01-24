/**
 * Prisma Client - App Instituto
 * 
 * NOTA: Prisma 7 requiere configuración especial.
 * Este archivo exporta un cliente mock hasta que se configure la BD.
 * 
 * Para conectar a Neon:
 * 1. Configura DATABASE_URL en .env
 * 2. Ejecuta: npm run db:push
 * 3. Descomenta el código real abajo
 */

// ============================================
// MOCK CLIENT (para desarrollo sin BD)
// ============================================

type MockModel = {
  findUnique: () => Promise<null>;
  findFirst: () => Promise<null>;
  findMany: () => Promise<never[]>;
  create: () => Promise<null>;
  update: () => Promise<null>;
  delete: () => Promise<null>;
  count: () => Promise<number>;
  upsert: () => Promise<null>;
  aggregate: () => Promise<{ _sum: null; _count: number; _avg: null; _min: null; _max: null }>;
  groupBy: () => Promise<never[]>;
};

const createMockModel = (): MockModel => ({
  findUnique: async () => null,
  findFirst: async () => null,
  findMany: async () => [],
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  count: async () => 0,
  upsert: async () => null,
  aggregate: async () => ({ _sum: null, _count: 0, _avg: null, _min: null, _max: null }),
  groupBy: async () => [],
});

const mockPrisma = {
  user: createMockModel(),
  role: createMockModel(),
  session: createMockModel(),
  profile: createMockModel(),
  auditLog: createMockModel(),
  program: createMockModel(),
  student: createMockModel(),
  payment: createMockModel(),
  receipt: createMockModel(),
  paymentCommitment: createMockModel(),
  prospect: createMockModel(),
  academicContent: createMockModel(),
  contentDelivery: createMockModel(),
  $connect: async () => {},
  $disconnect: async () => {},
};

export const prisma = mockPrisma;
export default prisma;

// ============================================
// CÓDIGO REAL (descomentar cuando tengas BD)
// ============================================
/*
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Para Neon con connection pooling
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn("DATABASE_URL not set, using mock client");
    return mockPrisma as unknown as PrismaClient;
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
*/