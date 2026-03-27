// Prisma Configuration for App Instituto
// https://pris.ly/d/config-datasource
//
// Con prisma.config.ts el CLI no carga .env automáticamente: hay que hacerlo aquí.
// Cargamos .env y luego .env.local (override) para alinear con Next.js / secretos locales.
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

const root = process.cwd();
loadEnv({ path: path.join(root, ".env") });
loadEnv({ path: path.join(root, ".env.local"), override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx ./prisma/seed.ts",
  },
});
