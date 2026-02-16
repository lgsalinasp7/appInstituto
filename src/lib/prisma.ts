import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const isDev = process.env.NODE_ENV === "development";

  const client = new PrismaClient({
    log: isDev
      ? [{ level: "error", emit: "event" }]
      : [{ level: "error", emit: "stdout" }],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    errorFormat: "pretty",
  });

  // En desarrollo: filtrar errores de conexión cerrada (Prisma los maneja automáticamente)
  // En producción: emit: "stdout" ya envía errores a console; no usar "event" sin suscriptor
  if (isDev) {
    client.$on("error" as never, (e: any) => {
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

// Singleton de Prisma
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Helper para ejecutar queries con manejo de reconexión
export async function executeWithRetry<T>(
  query: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await query();
    } catch (error: any) {
      lastError = error;
      
      // Si es un error de conexión cerrada, intentar reconectar
      if (
        error?.message?.includes("Closed") ||
        error?.code === "P1001" ||
        error?.kind === "Closed"
      ) {
        if (i < maxRetries - 1) {
          // Esperar antes de reintentar
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
          // Intentar reconectar
          try {
            await prisma.$connect();
          } catch (connectError) {
            console.error("Error al reconectar Prisma:", connectError);
          }
          continue;
        }
      }
      
      // Si no es un error de conexión, lanzar inmediatamente
      throw error;
    }
  }
  
  throw lastError || new Error("Error desconocido en executeWithRetry");
}

export default prisma;