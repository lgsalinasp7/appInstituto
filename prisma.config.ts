// Prisma Configuration for App Instituto
// https://pris.ly/d/config-datasource
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Main connection URL (pooled connection for Neon)
    url: process.env["DATABASE_URL"],
  },
});
