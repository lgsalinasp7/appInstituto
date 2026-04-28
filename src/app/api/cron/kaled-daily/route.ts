// app/api/cron/kaled-daily/route.ts
// Cron diario unificado: metricas de cohorte + motor de alertas (L/M/V)
// Vercel Hobby: 1 cron diario, max 60s

import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/cron-auth";

export const runtime = "nodejs";
export const maxDuration = 60;

export const GET = withCronAuth("cron.kaled-daily", async () => {
  const { prisma } = await import("@/lib/prisma");

  const tenant = await prisma.tenant.findFirst({
    where: { slug: "kaledacademy" },
    select: { id: true },
  });

  if (!tenant) {
    return NextResponse.json({ success: true, ok: false, reason: "no_tenant" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0=domingo, 1=lunes, 3=miercoles, 5=viernes

  let alertsCreated = 0;

  // Lunes(1), Martes(2), Miercoles(3), Jueves(4), Viernes(5): ejecutar motor de alertas
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    const { runAlertEngine } = await import("@/lib/academia/kaled-alert-engine");
    alertsCreated = await runAlertEngine(tenant.id);
  }

  // Todos los dias: snapshot de metricas de cohorte
  const cohort = await prisma.academyCohort.findFirst({
    where: { tenantId: tenant.id, status: "ACTIVE" },
    select: { id: true },
  });

  if (cohort) {
    const snapshots = await prisma.academyStudentSnapshot.findMany({
      where: { tenantId: tenant.id, cohortId: cohort.id },
    });

    const totalKaledQueries = await prisma.academyKaledSession.count({
      where: { tenantId: tenant.id },
    });

    const saasDeployed = await prisma.academySaasProject.count({
      where: {
        tenantId: tenant.id,
        cohortId: cohort.id,
        status: { in: ["EN_PRODUCCION", "LANZADO"] },
      },
    });

    const avgProgress =
      snapshots.length > 0
        ? snapshots.reduce((a, s) => a + Number(s.overallProgress), 0) / snapshots.length
        : 0;

    const studentsOnTrack = snapshots.filter(
      (s) => Number(s.overallProgress) >= avgProgress * 0.85
    ).length;

    const studentsAtRisk = snapshots.filter(
      (s) =>
        !s.lastActivityAt ||
        Date.now() - new Date(s.lastActivityAt).getTime() > 3 * 86400000
    ).length;

    const deliverablesApproved = snapshots.reduce(
      (sum, s) => sum + (s.deliverablesApproved ?? 0),
      0
    );

    await prisma.kaledCohortMetrics.upsert({
      where: {
        cohortId_snapshotDate: {
          cohortId: cohort.id,
          snapshotDate: today,
        },
      },
      create: {
        tenantId: tenant.id,
        cohortId: cohort.id,
        snapshotDate: today,
        totalStudents: snapshots.length,
        studentsOnTrack,
        studentsAtRisk,
        saasDeployedCount: saasDeployed,
        avgProgress,
        totalKaledQueries,
        cacheHitRate: 0,
        tokensSaved: 0,
        deliverablesApproved,
      },
      update: {
        totalStudents: snapshots.length,
        studentsOnTrack,
        studentsAtRisk,
        saasDeployedCount: saasDeployed,
        avgProgress,
        totalKaledQueries,
        deliverablesApproved,
      },
    });
  }

  return NextResponse.json({
    success: true,
    alertsCreated,
    snapshotDate: today.toISOString(),
    dayOfWeek,
    timestamp: new Date().toISOString(),
  });
});
