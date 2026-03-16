// app/api/cron/kaled-pre-class/route.ts
// Vercel cron — se ejecuta L/M/V a las 5:30 PM COT (antes de la clase de 6 PM)
// Configura en vercel.json

export const runtime = "nodejs";

export async function GET(req: Request) {
  // Verificar que viene de Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/prisma");
  const { runAlertEngine } = await import("@/lib/academia/kaled-alert-engine");

  const tenant = await prisma.tenant.findUnique({
    where: { slug: "kaledacademy" },
    select: { id: true },
  });
  if (!tenant) return Response.json({ ok: false });

  const alertsCreated = await runAlertEngine(tenant.id);

  return Response.json({
    ok: true,
    alertsCreated,
    timestamp: new Date().toISOString(),
  });
}