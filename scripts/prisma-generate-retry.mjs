/**
 * Reintenta `prisma generate` ante EPERM en Windows (DLL del query engine bloqueada).
 */
import { execSync } from "node:child_process";

const attempts = 5;
const baseDelayMs = 1500;

for (let i = 0; i < attempts; i++) {
  if (i > 0) {
    const wait = baseDelayMs * i;
    console.warn(`[prisma-generate-retry] Reintento ${i + 1}/${attempts} en ${wait}ms...`);
    await new Promise((r) => setTimeout(r, wait));
  }
  try {
    execSync("npx prisma generate", { stdio: "inherit", cwd: process.cwd(), env: process.env });
    process.exit(0);
  } catch {
    if (i === attempts - 1) {
      console.error("[prisma-generate-retry] prisma generate falló tras todos los reintentos.");
      process.exit(1);
    }
  }
}
