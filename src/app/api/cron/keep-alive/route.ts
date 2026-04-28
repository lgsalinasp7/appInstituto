// app/api/cron/keep-alive/route.ts
// Keep-alive para Neon: evita cold starts ejecutando una query cada 4 min.
// Neon suspende el compute tras 5 min de inactividad; este cron mantiene la BD activa.

import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/cron-auth";

export const runtime = "nodejs";
export const maxDuration = 10;

export const GET = withCronAuth("cron.keep-alive", async () => {
  const { prisma } = await import("@/lib/prisma");
  await prisma.$queryRaw`SELECT 1`;
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    message: "Neon keep-alive OK",
  });
});
