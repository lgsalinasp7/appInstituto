/**
 * Reintenta `prisma generate` ante EPERM en Windows (DLL del query engine bloqueada).
 * Si tras los reintentos el cliente ya existe en node_modules/.prisma/client, sale 0 con aviso
 * para no bloquear `npm run build` cuando otro proceso mantiene el motor cargado.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const attempts = 5;
const baseDelayMs = 1500;
const cwd = process.cwd();
const prismaClientIndex = path.join(cwd, "node_modules", ".prisma", "client", "index.js");
const queryEngineDll = path.join(cwd, "node_modules", ".prisma", "client", "query_engine-windows.dll.node");

function tryRemoveLockedEngine() {
  if (process.platform !== "win32") return;
  try {
    fs.unlinkSync(queryEngineDll);
  } catch {
    /* en uso por otro Node / antivirus */
  }
}

function generatedClientLooksPresent() {
  try {
    return fs.existsSync(prismaClientIndex);
  } catch {
    return false;
  }
}

for (let i = 0; i < attempts; i++) {
  if (i > 0) {
    const wait = baseDelayMs * i;
    console.warn(`[prisma-generate-retry] Reintento ${i + 1}/${attempts} en ${wait}ms...`);
    await new Promise((r) => setTimeout(r, wait));
  }
  tryRemoveLockedEngine();
  try {
    execSync("npx prisma generate", { stdio: "inherit", cwd, env: process.env });
    process.exit(0);
  } catch {
    if (i === attempts - 1) break;
  }
}

if (generatedClientLooksPresent()) {
  console.warn(
    "[prisma-generate-retry] prisma generate falló (p. ej. EPERM en Windows). Se continúa porque ya existe cliente generado en .prisma/client. Cierra otros `next dev`/IDE que usen Prisma y ejecuta `npx prisma generate` si cambiaste el schema."
  );
  process.exit(0);
}

console.error("[prisma-generate-retry] prisma generate falló y no hay cliente generado. Ejecuta `npx prisma generate` con otros procesos cerrados.");
process.exit(1);
