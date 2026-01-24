import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn("⚠️ DATABASE_URL no encontrada en el entorno. Prisma podría fallar.");
  }

  console.log("🛠️ Inicializando Prisma Client 6 (Estandar)...");

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Singleton de Prisma
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Manejo de señales para cierres limpios
if (typeof window === "undefined") {
  const shutdownHandler = async () => {
    console.log("🔌 Cerrando conexiones de Prisma...");
    try {
      await prisma.$disconnect();
    } catch {
      // Ignorar errores al desconectar
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdownHandler);
  process.on("SIGTERM", shutdownHandler);
}

export default prisma;