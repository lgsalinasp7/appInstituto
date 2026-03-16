// app/api/cron/kaled-metrics-snapshot/route.ts
// Ejecutar diariamente a medianoche para acumular métricas de cohorte

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const { prisma } = await import("@/lib/prisma");
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL!);
  
    const tenant = await prisma.tenant.findUnique({
      where: { slug: "kaledacademy" },
      select: { id: true },
    });
    if (!tenant) return Response.json({ ok: false });
  
    const cohort = await prisma.academyCohort.findFirst({
      where: { tenantId: tenant.id, status: "ACTIVE" },
      select: { id: true },
    });
    if (!cohort) return Response.json({ ok: false });
  
    const [snapshots, cacheData, totalQueries] = await Promise.all([
      prisma.academyStudentSnapshot.findMany({
        where: { tenantId: tenant.id, cohortId: cohort.id },
      }),
      sql`
        SELECT
          COALESCE(SUM(tokens_saved), 0) as tokens_saved,
          COALESCE(AVG(CASE WHEN hit_count > 0 THEN 100.0 ELSE 0.0 END), 0) as cache_hit_rate
        FROM kaled_semantic_cache
        WHERE tenant_id = ${tenant.id}
      `,
      prisma.kaledIntentLog.count({
        where: { tenantId: tenant.id },
      }),
    ]);
  
    const saasDeployed = await prisma.academySaasProject.count({
      where: {
        tenantId: tenant.id,
        cohortId: cohort.id,
        status: { in: ["EN_PRODUCCION", "LANZADO"] },
      },
    });
  
    const avgProgress = snapshots.length > 0
      ? snapshots.reduce((a, s) => a + Number(s.overallProgress), 0) / snapshots.length
      : 0;
  
    await sql`
      INSERT INTO kaled_cohort_metrics
        (tenant_id, cohort_id, snapshot_date, total_students,
         students_on_track, students_at_risk, saas_deployed_count,
         avg_progress, total_kaled_queries, cache_hit_rate, tokens_saved)
      VALUES
        (${tenant.id}, ${cohort.id}, CURRENT_DATE, ${snapshots.length},
         ${snapshots.filter(s => Number(s.overallProgress) >= avgProgress * 0.85).length},
         ${snapshots.filter(s => !s.lastActivityAt || Date.now() - new Date(s.lastActivityAt).getTime() > 3 * 86400000).length},
         ${saasDeployed}, ${avgProgress},
         ${totalQueries}, ${Number(cacheData[0]?.cache_hit_rate ?? 0)},
         ${Number(cacheData[0]?.tokens_saved ?? 0)})
      ON CONFLICT (cohort_id, snapshot_date)
      DO UPDATE SET
        total_students = EXCLUDED.total_students,
        students_on_track = EXCLUDED.students_on_track,
        avg_progress = EXCLUDED.avg_progress,
        total_kaled_queries = EXCLUDED.total_kaled_queries,
        cache_hit_rate = EXCLUDED.cache_hit_rate
    `;
  
    return Response.json({ ok: true, snapshotDate: new Date().toISOString() });
  }