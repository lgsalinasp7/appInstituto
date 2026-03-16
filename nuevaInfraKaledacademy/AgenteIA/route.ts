// app/api/academia/instructor/pre-class-brief/route.ts
// Genera el briefing completo antes de cada sesión de clase
// Se ejecuta automáticamente con un cron job antes de cada L/M/V

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runAlertEngine } from "@/lib/academia/kaled-alert-engine";
import { generateText } from "ai";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { platformRole: true, tenantId: true },
  });

  if (!["ACADEMY_TEACHER", "ACADEMY_ADMIN"].includes(dbUser?.platformRole ?? "")) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const tenantId = dbUser!.tenantId!;

  // Ejecutar motor de alertas
  const newAlerts = await runAlertEngine(tenantId);

  // Obtener datos completos del panel
  const [tasks, cohort, snapshots, cacheStats] = await Promise.all([
    // Tareas pendientes ordenadas por prioridad
    prisma.kaledInstructorTask.findMany({
      where: { tenantId, status: "PENDING" },
      orderBy: [
        { priority: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        // student name via user
      },
    }),

    // Cohorte activa
    prisma.academyCohort.findFirst({
      where: { tenantId, status: "ACTIVE" },
      include: {
        enrollments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        events: {
          where: {
            scheduledAt: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 86400000),
            },
          },
          orderBy: { scheduledAt: "asc" },
          take: 3,
        },
      },
    }),

    // Snapshots de todos los estudiantes
    prisma.academyStudentSnapshot.findMany({
      where: { tenantId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { overallProgress: "desc" },
    }),

    // Estadísticas del caché (ahorro de tokens)
    prisma.$queryRaw<{ total_saved: number; hit_rate: number }[]>`
      SELECT
        COALESCE(SUM(tokens_saved), 0) as total_saved,
        COALESCE(AVG(CASE WHEN hit_count > 0 THEN 1.0 ELSE 0.0 END) * 100, 0) as hit_rate
      FROM kaled_semantic_cache
      WHERE tenant_id = ${tenantId}
        AND created_at >= NOW() - INTERVAL '30 days'
    `,
  ]);

  // Generar resumen ejecutivo con Kaled (usando modelo barato)
  const studentsAtRisk = snapshots.filter(s =>
    !s.lastActivityAt ||
    Date.now() - s.lastActivityAt.getTime() > 3 * 86400000
  );

  const briefSummary = await generateText({
    model: "anthropic/claude-haiku-4-5-20251001" as any,
    prompt: `Eres Kaled, asistente del instructor Luis Guillermo de KaledAcademy.
    
Genera un resumen ejecutivo de máximo 150 palabras para el briefing pre-sesión:
- ${snapshots.length} estudiantes activos
- Progreso promedio: ${(snapshots.reduce((a,s) => a + Number(s.overallProgress), 0) / snapshots.length).toFixed(0)}%
- Estudiantes en riesgo: ${studentsAtRisk.length}
- Alertas pendientes: ${tasks.length}
- Tokens ahorrados este mes por caché: ${cacheStats[0]?.total_saved ?? 0}

Sé directo y accionable. Menciona qué requiere atención inmediata hoy.`,
    maxTokens: 200,
    temperature: 0.2,
  });

  return NextResponse.json({
    newAlertsGenerated: newAlerts,
    executiveSummary: briefSummary.text,
    pendingTasks: tasks,
    studentsAtRisk: studentsAtRisk.map(s => ({
      userId: s.userId,
      name: s.user.name,
      progress: Number(s.overallProgress),
      lastActivity: s.lastActivityAt,
      lessonsCompleted: s.lessonsCompleted,
    })),
    cohortOverview: {
      name: cohort?.name,
      totalStudents: snapshots.length,
      avgProgress: (snapshots.reduce((a,s) => a + Number(s.overallProgress), 0) / snapshots.length).toFixed(1),
      studentsOnTrack: snapshots.filter(s => Number(s.overallProgress) >= 30).length,
    },
    upcomingSessions: cohort?.events ?? [],
    tokenSavings: {
      savedThisMonth: cacheStats[0]?.total_saved ?? 0,
      cacheHitRate: Number(cacheStats[0]?.hit_rate ?? 0).toFixed(1),
    },
  });
}