// lib/academia/kaled-error-memory.ts
// Registra y detecta patrones de error recurrentes por estudiante
// Alimenta el diagnóstico del instructor y el método socrático de Kaled

import { prisma } from "@/lib/prisma";

const ERROR_LABELS: Record<string, string> = {
  "mutacion_estado_react":     "Mutación directa de estado en React",
  "n1_query_prisma":           "Problema N+1 en consultas Prisma",
  "no_maneja_errores_api":     "No maneja errores en API Routes",
  "idor_vulnerability":        "Vulnerabilidad IDOR (sin verificar pertenencia)",
  "frontend_auth_only":        "Autenticación solo en frontend",
  "no_valida_servidor":        "Sin validación Zod en el servidor",
  "var_en_lugar_const":        "Usa var en lugar de const/let",
  "sin_async_await":           "Mal manejo de código asíncrono",
  "no_maneja_loading_state":   "No implementa estado de carga",
  "sin_env_variables":         "Credenciales hardcodeadas en código",
  "sin_gitignore_env":         "Archivo .env subido a GitHub",
  "commit_sin_semantica":      "Commits sin convención semántica",
  "sin_typescript_types":      "Sin tipado TypeScript explícito",
  "no_verifica_tenant":        "Sin verificación de tenantId en queries",
};

export async function updateErrorPatterns(params: {
  userId: string;
  tenantId: string;
  patterns: string[];
  lessonId?: string;
}): Promise<void> {
  const { userId, tenantId, patterns, lessonId } = params;

  for (const pattern of patterns) {
    const label = ERROR_LABELS[pattern] ?? pattern;

    const existing = await prisma.kaledStudentErrorPattern.findFirst({
      where: { userId, tenantId, errorPattern: pattern },
    });

    if (existing) {
      await prisma.kaledStudentErrorPattern.update({
        where: { id: existing.id },
        data: {
          occurrences: { increment: 1 },
          lastSeenAt: new Date(),
          lessonIds: lessonId
            ? { push: lessonId }
            : undefined,
        },
      });

      if (existing.occurrences >= 2) {
        await createInstructorAlert({
          tenantId,
          studentId: userId,
          type: "PATTERN_DETECTED",
          pattern: label,
          occurrences: existing.occurrences + 1,
        });
      }
    } else {
      await prisma.kaledStudentErrorPattern.create({
        data: {
          tenantId,
          userId,
          errorPattern: pattern,
          errorLabel: label,
          lessonIds: lessonId ? [lessonId] : [],
        },
      });
    }
  }
}

export async function getStudentErrorSummary(
  userId: string,
  tenantId: string
): Promise<string> {
  const patterns = await prisma.kaledStudentErrorPattern.findMany({
    where: { userId, tenantId, resolved: false },
    orderBy: { occurrences: "desc" },
    take: 5,
  });

  if (patterns.length === 0) return "";

  return patterns
    .map(p => `• ${p.errorLabel} (${p.occurrences} veces)`)
    .join("\n");
}

async function createInstructorAlert(params: {
  tenantId: string;
  studentId: string;
  type: string;
  pattern: string;
  occurrences: number;
}): Promise<void> {
  const { tenantId, studentId, type, pattern, occurrences } = params;

  const instructor = await prisma.user.findFirst({
    where: {
      tenantId,
      platformRole: { in: ["ACADEMY_TEACHER", "ACADEMY_ADMIN"] },
    },
    select: { id: true },
  });
  if (!instructor) return;

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { name: true },
  });

  const studentName = student?.name ?? "Un estudiante";

  const existing = await prisma.kaledInstructorTask.findFirst({
    where: {
      tenantId,
      studentId,
      type,
      status: "PENDING",
      diagnosis: { contains: pattern },
    },
  });
  if (existing) return;

  await prisma.kaledInstructorTask.create({
    data: {
      tenantId,
      instructorId: instructor.id,
      studentId,
      type,
      priority: occurrences >= 4 ? "HIGH" : "MEDIUM",
      title: `Patrón recurrente detectado: ${studentName}`,
      diagnosis: `**${studentName}** ha cometido el mismo error **${occurrences} veces**: "${pattern}". Este patrón sugiere una brecha conceptual que no se está resolviendo con la práctica normal.`,
      suggestion: `Recomendación: Reunión one-to-one de 15 minutos enfocada en "${pattern}". Usar el método socrático: preguntarle que explique el concepto sin ver código, luego pedirle que lo implemente desde cero.`,
      metadata: { pattern, occurrences },
    },
  });
}
