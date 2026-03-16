// lib/academia/kaled-code-reviewer.ts
// Evalúa código pegado por el estudiante según la fase CRAL activa
// Genera retroalimentación cualitativa + preguntas socráticas
// NUNCA califica con número — solo guía cualitativamente

import { generateText, gateway } from "ai";
import { prisma } from "@/lib/prisma";
import { updateErrorPatterns } from "@/lib/academia/kaled-error-memory";

export interface CodeReviewResult {
  feedback: string;
  socraticQuestions: string[];
  strengths: string[];
  improvements: string[];
  errorPatternsDetected: string[];
  cralAlignment: string;
}

export async function reviewCodeWithCRAL(params: {
  code: string;
  cralPhase: string;
  lessonTitle: string;
  weekNumber: number;
  userId: string;
  tenantId: string;
  lessonId?: string;
  userName: string;
}): Promise<CodeReviewResult> {
  const {
    code, cralPhase, lessonTitle, weekNumber,
    userId, tenantId, lessonId, userName,
  } = params;

  const errorHistory = await prisma.kaledStudentErrorPattern.findMany({
    where: { userId, tenantId, resolved: false },
    orderBy: { occurrences: "desc" },
    take: 5,
  });

  const errorContext = errorHistory.length > 0
    ? `Errores recurrentes previos de ${userName}: ${errorHistory.map(e => e.errorLabel).join(", ")}`
    : "";

  const CRAL_RUBRICS: Record<string, string> = {
    CONSTRUIR: `Evalúa si el código:
      1. FUNCIONA correctamente para el caso de uso básico
      2. El estudiante ENTIENDE cada línea (pídele que explique)
      3. Sigue las convenciones del stack del bootcamp (Next.js, TypeScript, Prisma)
      4. No usa soluciones copiadas sin entender
      Enfócate en: ¿funciona? ¿lo entiende? ¿puede explicarlo?`,

    ROMPER: `Evalúa si el estudiante:
      1. IDENTIFICÓ correctamente por qué falló el código
      2. ENTIENDE el error a nivel conceptual, no solo lo copió de Stack Overflow
      3. Puede PREDECIR qué pasará con otros inputs similares
      4. Aprendió algo nuevo del error
      Enfócate en: ¿entiende el fallo? ¿puede prevenirlo en el futuro?`,

    AUDITAR: `Evalúa críticamente:
      1. SEGURIDAD: ¿hay vulnerabilidades? (IDOR, XSS, exposición de datos)
      2. RENDIMIENTO: ¿escala con 10.000 usuarios? ¿hay N+1 queries?
      3. LEGIBILIDAD: ¿otro developer puede entenderlo sin comentarios?
      4. BUENAS PRÁCTICAS: ¿sigue los estándares del bootcamp?
      Enfócate en: ¿está listo para producción real?`,

    LANZAR: `Evalúa si el entregable:
      1. ESTÁ DESPLEGADO en una URL real (no en localhost)
      2. El README EXPLICA la arquitectura y decisiones
      3. Los COMMITS son semánticos y el historial tiene sentido
      4. El estudiante puede DEFENDER cada decisión técnica
      Enfócate en: ¿existe en internet? ¿puede defenderlo en el Demo Day?`,
  };

  const prompt = `Eres Kaled, tutor del AI SaaS Engineering Bootcamp de KaledSoft.

CONTEXTO:
- Estudiante: ${userName}
- Sesión: ${lessonTitle} (Semana ${weekNumber})
- Fase CRAL activa: ${cralPhase}
${errorContext ? `- ${errorContext}` : ""}

CÓDIGO DEL ESTUDIANTE:
\`\`\`
${code}
\`\`\`

RÚBRICA PARA ESTA FASE (${cralPhase}):
${CRAL_RUBRICS[cralPhase] ?? CRAL_RUBRICS.CONSTRUIR}

INSTRUCCIONES:
1. Evalúa el código EXCLUSIVAMENTE según la rúbrica de la fase ${cralPhase}
2. Usa el método socrático: haz preguntas que lleven al estudiante a pensar, NO des la solución
3. Sé motivador pero honesto
4. Detecta si hay patrones de error recurrentes
5. NUNCA escribas el código correcto completo — solo fragmentos pequeños como ejemplos

Responde en JSON con esta estructura exacta:
{
  "feedback": "retroalimentación principal en 2-3 párrafos, cálida y directa",
  "strengths": ["fortaleza 1", "fortaleza 2"],
  "improvements": ["área de mejora 1", "área de mejora 2"],
  "socraticQuestions": ["pregunta 1", "pregunta 2", "pregunta 3"],
  "errorPatternsDetected": ["patrón técnico detectado 1"],
  "cralAlignment": "qué tan alineado está con la fase ${cralPhase} en 1 oración"
}`;

  const { text } = await generateText({
    model: gateway("anthropic/claude-haiku-4-5"),
    prompt,
    maxOutputTokens: 800,
    temperature: 0.3,
  });

  let result: CodeReviewResult;
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    result = JSON.parse(cleaned);
  } catch {
    result = {
      feedback: text,
      socraticQuestions: ["¿Puedes explicar este código con tus propias palabras?"],
      strengths: [],
      improvements: [],
      errorPatternsDetected: [],
      cralAlignment: `Revisión de fase ${cralPhase}`,
    };
  }

  await prisma.kaledCodeReview.create({
    data: {
      tenantId,
      userId,
      lessonId,
      cralPhase,
      codeSubmitted: code,
      feedback: result.feedback,
      errorPatterns: result.errorPatternsDetected,
      weekNumber,
      status: "PENDING_APPROVAL",
    },
  });

  if (result.errorPatternsDetected.length > 0) {
    updateErrorPatterns({
      userId,
      tenantId,
      patterns: result.errorPatternsDetected,
      lessonId,
    }).catch(() => {});
  }

  return result;
}
