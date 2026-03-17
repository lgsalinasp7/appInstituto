// app/api/cron/keep-alive/route.ts
// Keep-alive para Neon: evita cold starts ejecutando una query cada 4 min.
// Neon suspende el compute tras 5 min de inactividad; este cron mantiene la BD activa.

export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({
      ok: true,
      timestamp: new Date().toISOString(),
      message: "Neon keep-alive OK",
    });
  } catch (error) {
    console.error("[keep-alive] Error:", error);
    return Response.json(
      { ok: false, error: String(error), timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
