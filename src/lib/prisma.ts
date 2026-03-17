import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  // Añadir parámetros para Neon: timeout + pgbouncer (evita errores con pooler)
  let dbUrl = url;
  if (url?.includes("neon.tech")) {
    const sep = url.includes("?") ? "&" : "?";
    const extra: string[] = [];
    if (!url.includes("connect_timeout")) extra.push("connect_timeout=15");
    if (!url.includes("pool_timeout")) extra.push("pool_timeout=15");
    if (!url.includes("pgbouncer")) extra.push("pgbouncer=true");
    if (extra.length) dbUrl = `${url}${sep}${extra.join("&")}`;
  }

  const client = new PrismaClient({
    log: [{ level: "error", emit: "event" }],
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
