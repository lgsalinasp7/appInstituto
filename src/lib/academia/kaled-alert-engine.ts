// lib/academia/kaled-alert-engine.ts
// Analiza el estado de todos los estudiantes y genera alertas
// Se ejecuta automáticamente antes de cada sesión de clase
// También se puede ejecutar manualmente desde el panel

import { prisma } from "@/lib/prisma";
import { getStudentErrorSummary } from "@/lib/academia/kaled-error-memory";

// Umbrales de alerta configurables
const THRESHOLDS = {
  DAYS_INACTIVE: 3, // días sin entrar
  PROGRESS_BEHIND_PCT: 15, // % por debajo del promedio del grupo
  FAILED_QUIZZES_ROW: 2, // quizzes fallidos consecutivos
  KALED_NO_PROGRESS: 8, // consultas a Kaled sin completar lección
  DELIVERABLE_OVERDUE_DAYS: 3, // días sin entregar entregable
  TOKEN_WARNING_DAILY: 40, // consultas diarias antes de avisar
  TOKEN_LIMIT_DAILY: 50, // límite duro diario
};

export async function runAlertEngine(tenantId: string): Promise<number> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true },
  });
  if (!tenant) return 0;

  const cohort = await prisma.academyCohort.findFirst({
    where: { tenantId, status: "ACTIVE" },
    include: {
      enrollments: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  if (!cohort) return 0;

  const instructor = await prisma.user.findFirst({
    where: {
      tenantId,
      platformRole: { in: ["ACADEMY_TEACHER", "ACADEMY_ADMIN"] },
    },
    select: { id: true },
  });
  if (!instructor) return 0;

  // Calcular progreso promedio del grupo
  const snapshots = await prisma.academyStudentSnapshot.findMany({
    where: { tenantId, cohortId: cohort.id },
  });
  const avgProgress =
    snapshots.length > 0
      ? snapshots.reduce(
          (a, s) => a + Number(s.overallProgress),
          0
        ) / snapshots.length
      : 0;

  let alertsCreated = 0;

  for (const enrollment of cohort.enrollments) {
    const { user } = enrollment;
    const snapshot = snapshots.find((s) => s.userId === user.id);
    if (!snapshot) continue;

    const alerts = await detectStudentIssues({
      student: user,
      snapshot,
      avgProgress,
      tenantId,
      instructorId: instructor.id,
      cohortId: cohort.id,
    });

    alertsCreated += alerts;
  }

  return alertsCreated;
}

async function detectStudentIssues(params: {
  student: { id: string; name: string | null; email: string };
  snapshot: {
    lastActivityAt: Date | null;
    overallProgress: unknown;
    lessonsCompleted: number;
    kaledInteractions: number;
    deliverablesApproved: number;
  };
  avgProgress: number;
  tenantId: string;
  instructorId: string;
  cohortId: string;
}): Promise<number> {
  const { student, snapshot, avgProgress, tenantId, instructorId } = params;
  const studentName = student.name ?? student.email;
  let alertsCreated = 0;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const overdueThreshold = new Date(
    Date.now() - THRESHOLDS.DELIVERABLE_OVERDUE_DAYS * 86400000
  );

  // Obtener historial adicional
  const [errorSummary, dailyUsage, pendingDeliverables] = await Promise.all([
    getStudentErrorSummary(student.id, tenantId),
    // Consultas a Kaled hoy (usando AcademyKaledSession)
    prisma.academyKaledSession.count({
      where: {
        userId: student.id,
        tenantId,
        createdAt: { gte: startOfDay },
      },
    }),
    // Entregables pendientes con más de X días
    prisma.academyDeliverableSubmission.count({
      where: {
        userId: student.id,
        status: "PENDIENTE",
        submittedAt: null,
        updatedAt: { lte: overdueThreshold },
      },
    }),
  ]);

  const issues: Array<{
    type: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    title: string;
    diagnosis: string;
    suggestion: string;
  }> = [];

  // ── INACTIVIDAD ───────────────────────────────────────
  if (snapshot.lastActivityAt) {
    const daysSinceActive = Math.floor(
      (Date.now() - snapshot.lastActivityAt.getTime()) / 86400000
    );
    if (daysSinceActive >= THRESHOLDS.DAYS_INACTIVE) {
      issues.push({
        type: "BLOCKED",
        priority: daysSinceActive >= 5 ? "HIGH" : "MEDIUM",
        title: `Inactividad prolongada: ${studentName}`,
        diagnosis: `**${studentName}** lleva **${daysSinceActive} días sin entrar** a la plataforma. Su último acceso fue el ${snapshot.lastActivityAt.toLocaleDateString("es-CO")}. Progreso actual: ${Number(snapshot.overallProgress).toFixed(0)}%. ${errorSummary ? `\n\nErrores recurrentes identificados:\n${errorSummary}` : ""}`,
        suggestion: `Enviar mensaje directo preguntando cómo está. Si no responde en 24h, agendar sesión one-to-one de 20 min para identificar bloqueos. Revisar si el estudiante tiene dificultades con el tema actual de la sesión.`,
      });
    }
  }

  // ── PROGRESO BAJO ─────────────────────────────────────
  const studentProgress = Number(snapshot.overallProgress);
  if (avgProgress - studentProgress >= THRESHOLDS.PROGRESS_BEHIND_PCT) {
    issues.push({
      type: "LOW_PROGRESS",
      priority: "MEDIUM",
      title: `Progreso bajo: ${studentName}`,
      diagnosis: `**${studentName}** tiene **${studentProgress.toFixed(0)}%** de progreso, mientras el promedio del grupo es **${avgProgress.toFixed(0)}%**. Está **${(avgProgress - studentProgress).toFixed(0)} puntos por debajo** del grupo. Lecciones completadas: ${snapshot.lessonsCompleted}. Entregables aprobados: ${snapshot.deliverablesApproved}.${errorSummary ? `\n\nPatrones de error frecuentes:\n${errorSummary}` : ""}`,
      suggestion: `Reunión one-to-one de 30 min para identificar qué lo está frenando. Revisar si los temas del módulo actual son claros. Asignar refuerzo específico en las sesiones donde tiene errores recurrentes.`,
    });
  }

  // ── ENTREGABLES VENCIDOS ──────────────────────────────
  if (pendingDeliverables > 0) {
    issues.push({
      type: "BLOCKED",
      priority: "HIGH",
      title: `Entregables vencidos: ${studentName}`,
      diagnosis: `**${studentName}** tiene **${pendingDeliverables} entregable(s) sin entregar** con más de ${THRESHOLDS.DELIVERABLE_OVERDUE_DAYS} días de retraso. Sin entregables aprobados, el ciclo CRAL está incompleto.`,
      suggestion: `Contactar directamente. Preguntar qué parte del entregable está bloqueando. Revisar si necesita ayuda con el deploy en Vercel o con la documentación del README.`,
    });
  }

  // ── USO EXCESIVO DE KALED SIN AVANZAR ─────────────────
  if (
    snapshot.kaledInteractions > THRESHOLDS.KALED_NO_PROGRESS &&
    snapshot.lessonsCompleted === 0
  ) {
    issues.push({
      type: "BLOCKED",
      priority: "MEDIUM",
      title: `Alta dependencia de Kaled sin avance: ${studentName}`,
      diagnosis: `**${studentName}** ha hecho **${snapshot.kaledInteractions} consultas a Kaled** pero no ha completado ninguna lección. Esto puede indicar que está usando a Kaled para hacer el trabajo en lugar de intentarlo primero.`,
      suggestion: `Revisar el historial de conversaciones con Kaled. Hablar con el estudiante sobre la importancia de intentar antes de preguntar. Reforzar la metodología CRAL.`,
    });
  }

  // ── ALERTA DE TOKENS ──────────────────────────────────
  if (dailyUsage >= THRESHOLDS.TOKEN_WARNING_DAILY) {
    issues.push({
      type: "TOKEN_ALERT",
      priority: "LOW",
      title: `Alto uso de tokens hoy: ${studentName}`,
      diagnosis: `**${studentName}** ha hecho **${dailyUsage} consultas a Kaled** hoy (límite: ${THRESHOLDS.TOKEN_LIMIT_DAILY}). Está cerca del límite diario.`,
      suggestion: `Verificar si las preguntas son productivas o si está en un bloqueo que necesita intervención directa.`,
    });
  }

  // Crear alertas en BD evitando duplicados
  for (const issue of issues) {
    const existingAlert = await prisma.kaledInstructorTask.findFirst({
      where: {
        tenantId,
        studentId: student.id,
        type: issue.type,
        status: "PENDING",
        createdAt: { gte: new Date(Date.now() - 24 * 3600000) },
      },
    });
    if (existingAlert) continue;

    await prisma.kaledInstructorTask.create({
      data: {
        tenantId,
        instructorId,
        studentId: student.id,
        type: issue.type,
        priority: issue.priority,
        title: issue.title,
        diagnosis: issue.diagnosis,
        suggestion: issue.suggestion,
        metadata: {
          progress: studentProgress,
          avgProgress,
          dailyUsage,
          errorSummary,
        },
      },
    });
    alertsCreated++;
  }

  return alertsCreated;
}
