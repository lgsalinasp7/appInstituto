import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * En producción con Neon: usa el adapter serverless que maneja cold starts
 * mejor que el driver TCP estándar (HTTP/WebSockets vs conexiones TCP).
 */
function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  const useNeonAdapter =
    process.env.NODE_ENV === "production" &&
    url?.includes("neon.tech");

  if (useNeonAdapter) {
    const { Pool, neonConfig } = require("@neondatabase/serverless");
    const { PrismaNeon } = require("@prisma/adapter-neon");
    const ws = require("ws");

    neonConfig.webSocketConstructor = ws;

    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaNeon(pool);

    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? [{ level: "error", emit: "event" }]
          : [{ level: "error", emit: "event" }],
      errorFormat: "pretty",
    });
  }

  // Desarrollo o BD no-Neon: cliente estándar
  let dbUrl = url;
  if (url?.includes("neon.tech") && !url.includes("connect_timeout")) {
    const sep = url.includes("?") ? "&" : "?";
    dbUrl = `${url}${sep}connect_timeout=15&pool_timeout=15`;
  }

  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [{ level: "error", emit: "event" }]
        : [{ level: "error", emit: "event" }],
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    errorFormat: "pretty",
  });

  if (process.env.NODE_ENV === "development") {
    client.$on("error" as never, (e: { message?: string; code?: string; kind?: string }) => {
      if (
        !e.message?.includes("Closed") &&
        e.code !== "P1001" &&
        e.kind !== "Closed"
      ) {
        console.error("Prisma error:", e);
      }
    });
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function executeWithRetry<T>(
  query: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await query();
    } catch (error: unknown) {
      lastError = error as Error;
      const err = error as { message?: string; code?: string; kind?: string };

      if (
        err?.message?.includes("Closed") ||
        err?.code === "P1001" ||
        err?.kind === "Closed"
      ) {
        if (i < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, delay * (i + 1)));
          try {
            await prisma.$connect();
          } catch {
            /* ignore */
          }
          continue;
        }
      }

      throw error;
    }
  }

  throw lastError ?? new Error("Error desconocido en executeWithRetry");
}

export default prisma;
