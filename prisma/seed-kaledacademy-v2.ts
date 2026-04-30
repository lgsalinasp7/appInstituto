/* eslint-disable @typescript-eslint/no-explicit-any -- dev seed script with dynamic JSON content shapes */
// ============================================================
// SEED INCREMENTAL — KaledAcademy v2
// Modo: Solo actualizar contenido de lecciones existentes
// Preserva: progreso de estudiantes, enrollments, cohortes
// Ejecutar: npm run db:seed-kaledacademy-v2
// ============================================================
// CAMBIO vs v1: AMAXOFT → KaledSoft Technologies
// ============================================================

import { PrismaClient } from "@prisma/client";
import {
  SESIONES_MODULO_1,
  SESIONES_MODULO_2,
  SESIONES_MODULO_3,
  SESIONES_MODULO_4,
} from "./seed-kaledacademy-v2-data";
import { BOOTCAMP_COURSE_ID } from "./seed-academy-ensure";

const prisma = new PrismaClient();

const KALED_MEMORIES = [
  { category: "empresa_referencia", content: "KaledSoft Technologies es la empresa de referencia del bootcamp. Construye SaaS para múltiples industrias: odontología (KaledDental), escuelas/academias (KaledAcademy), lavaderos de autos (KaledWash), parqueaderos (KaledPark). El estudiante construye SaaS propios inspirados en los problemas reales que KaledSoft resuelve.", score: 100 },
  { category: "pedagogia_arquitecto", content: "Los desarrolladores en la era de la IA son arquitectos de sistemas, no codificadores. Nunca damos el código completo. Siempre preguntamos: ¿cómo funciona el sistema por dentro? ¿por qué existe este problema? ¿cuándo NO usar esta solución?", score: 98 },
  { category: "metodo_socratico", content: "Ante toda pregunta técnica: 1) ¿Qué intentaste primero? 2) ¿Qué crees tú que debería pasar? 3) ¿Qué dice el error exactamente? Nunca dar la solución directa sin que el estudiante piense primero.", score: 95 },
  { category: "cral_aplicacion", content: "CONSTRUIR (70%): el estudiante intenta. ROMPER (10%): experimenta qué pasa cuando falla. AUDITAR (10%): revisa el código con criterio crítico. LANZAR (10%): siempre en producción, nunca en local.", score: 92 },
  { category: "errores_comunes_ia", content: "Patrones de error más comunes que genera la IA: N+1 queries en Prisma, no validar en el servidor, IDOR sin verificar tenantId, `innerHTML` con datos del usuario (XSS), migraciones destructivas en producción, actualizar plan desde webhook sin verificar firma.", score: 97 },
  { category: "kaledsoft_saas_ejemplos", content: "KaledDental: gestión de citas, historiales dentales, facturación. KaledWash: órdenes de lavado, inventario de productos, turnos. KaledPark: control de entrada/salida, tarifas por tiempo, reportes. KaledSchool: matrículas, pagos, seguimiento académico. Todos multi-tenant, todos con IA como diferenciador.", score: 90 },
];

async function main() {
  console.log("🚀 Seed incremental KaledAcademy v2 — actualizando contenido de lecciones...\n");

  const tenant = await prisma.tenant.findUnique({ where: { slug: "kaledacademy" } });
  if (!tenant) {
    throw new Error("Tenant kaledacademy no existe. Ejecuta primero db:seed-kaledacademy.");
  }

  const course = await prisma.academyCourse.findFirst({
    where: { id: BOOTCAMP_COURSE_ID, tenantId: tenant.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) {
    throw new Error(`Curso ${BOOTCAMP_COURSE_ID} no existe. Ejecuta primero db:seed-kaledacademy o db:seed-kaledacademy-v3.`);
  }

  const modulesUnique: typeof course.modules = [];
  const ordersSeen = new Set<number>();
  for (const m of course.modules) {
    if (ordersSeen.has(m.order)) continue;
    ordersSeen.add(m.order);
    modulesUnique.push(m);
  }
  if (modulesUnique.length !== 4) {
    console.warn(
      `⚠️  Se esperaban 4 módulos únicos por orden, hay ${modulesUnique.length} (total filas: ${course.modules.length}). Continuando...`
    );
  }

  const sesionesPorModulo: Record<number, unknown[]> = {
    1: SESIONES_MODULO_1,
    2: SESIONES_MODULO_2,
    3: SESIONES_MODULO_3,
    4: SESIONES_MODULO_4,
  };

  let totalActualizadas = 0;
  for (const mod of modulesUnique) {
    const sesiones = sesionesPorModulo[mod.order] as any[];
    if (!sesiones || sesiones.length === 0) continue;

    console.log(`  📦 Módulo ${mod.order}: ${mod.lessons.length} lecciones`);
    for (let i = 0; i < mod.lessons.length && i < sesiones.length; i++) {
      const lesson = mod.lessons[i];
      const s = sesiones[i];
      await actualizarLeccion(prisma, lesson.id, tenant.id, s);
      totalActualizadas++;
    }
  }

  // Actualizar memorias de Kaled
  await prisma.agentMemory.deleteMany({
    where: { agentType: "KALED", tenantId: tenant.id },
  });
  for (const mem of KALED_MEMORIES) {
    await prisma.agentMemory.create({
      data: { agentType: "KALED", tenantId: tenant.id, ...mem, metadata: { source: "seed_v2" } },
    });
  }

  console.log(`\n✅ Seed v2 incremental completado. ${totalActualizadas} lecciones actualizadas.`);
  console.log("   Empresa de referencia: KaledSoft Technologies");
}

async function actualizarLeccion(
  prisma: PrismaClient,
  lessonId: string,
  tenantId: string,
  s: any
) {
  const isFullSession = s.kaledIntro !== undefined && s.analogia !== undefined;

  // 1. Eliminar CRAL, Quiz, Deliverable existentes (orden por FKs)
  const quizzes = await prisma.academyQuiz.findMany({ where: { lessonId }, include: { options: true } });
  for (const q of quizzes) {
    await prisma.academyQuizOption.deleteMany({ where: { quizId: q.id } });
    await prisma.academyQuiz.delete({ where: { id: q.id } });
  }
  const deliverables = await prisma.academyDeliverable.findMany({ where: { lessonId }, include: { checkItems: true } });
  for (const d of deliverables) {
    await prisma.academyDeliverableItem.deleteMany({ where: { deliverableId: d.id } });
    await prisma.academyDeliverable.delete({ where: { id: d.id } });
  }
  await prisma.academyCRALChallenge.deleteMany({ where: { lessonId } });

  // 2. Actualizar AcademyLesson (title, description, content, videoUrl)
  await prisma.academyLesson.update({
    where: { id: lessonId },
    data: {
      title: s.titulo ?? undefined,
      description: s.descripcion ?? undefined,
      content: s.kaledIntro ?? s.descripcion ?? undefined,
      videoUrl: s.video?.url ?? undefined,
      duration: s.duracion ?? 180,
    },
  });

  // 3. Upsert AcademyLessonMeta
  const sessionType = s.sessionType ?? (s.orden >= 11 ? "LIVE" : s.dia === "VIERNES" ? "ENTREGABLE" : s.dia === "LUNES" ? "TEORIA" : "PRACTICA");
  await prisma.academyLessonMeta.upsert({
    where: { lessonId },
    create: {
      lessonId,
      tenantId,
      sessionType: sessionType as any,
      weekNumber: s.semana ?? 1,
      dayOfWeek: (s.dia ?? "LUNES") as any,
      videoUrl: s.video?.url,
      videoTitle: s.video?.title,
      analogyText: s.analogia ?? (s.descripcion ? `Referencia KaledSoft: ${s.descripcion}` : null),
      kaledIntro: s.kaledIntro ?? s.descripcion,
      concepts: (s.concepts ?? []) as any,
    },
    update: {
      sessionType: sessionType as any,
      weekNumber: s.semana ?? undefined,
      dayOfWeek: (s.dia ?? undefined) as any,
      videoUrl: s.video?.url ?? undefined,
      videoTitle: s.video?.title ?? undefined,
      analogyText: s.analogia ?? (s.descripcion ? `Referencia KaledSoft: ${s.descripcion}` : undefined),
      kaledIntro: s.kaledIntro ?? s.descripcion ?? undefined,
      concepts: (s.concepts ?? []) as any,
    },
  });

  // 4. Crear CRAL
  if (isFullSession && s.cral?.length) {
    for (let i = 0; i < s.cral.length; i++) {
      await prisma.academyCRALChallenge.create({
        data: {
          lessonId,
          tenantId,
          phase: s.cral[i].phase as any,
          title: s.cral[i].title,
          description: s.cral[i].desc,
          order: i,
        },
      });
    }
  } else {
    const cralFases = ["CONSTRUIR", "ROMPER", "AUDITAR", "LANZAR"];
    for (let i = 0; i < 4; i++) {
      await prisma.academyCRALChallenge.create({
        data: {
          lessonId,
          tenantId,
          phase: cralFases[i] as any,
          title: `${cralFases[i]}: ${s.titulo}`,
          description: `Aplica la metodología ${cralFases[i]} al tema de esta sesión usando KaledSoft como caso de referencia.`,
          order: i,
        },
      });
    }
  }

  // 5. Crear Quiz(es)
  const quizList = isFullSession
    ? Array.isArray(s.quizzes)
      ? s.quizzes
      : s.quiz
        ? [s.quiz]
        : []
    : [];

  for (let quizIndex = 0; quizIndex < quizList.length; quizIndex++) {
    const quizData = quizList[quizIndex];
    const quiz = await prisma.academyQuiz.create({
      data: { lessonId, tenantId, question: quizData.question, order: quizIndex },
    });
    for (const opt of quizData.options ?? []) {
      await prisma.academyQuizOption.create({
        data: {
          quizId: quiz.id,
          label: opt.label,
          text: opt.text,
          isCorrect: opt.isCorrect ?? false,
          feedback: opt.feedback ?? undefined,
        },
      });
    }
  }

  // 6. Crear Deliverable
  if (isFullSession && s.entregable) {
    const entr = await prisma.academyDeliverable.create({
      data: {
        lessonId,
        tenantId,
        weekNumber: s.semana ?? 1,
        title: s.entregable.title,
        description: s.entregable.desc,
        isFinal: s.entregable.isFinal ?? false,
      },
    });
    for (let i = 0; i < (s.entregable.items ?? []).length; i++) {
      await prisma.academyDeliverableItem.create({
        data: { deliverableId: entr.id, text: s.entregable.items[i], order: i },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error("\n❌ Error en seed v2 incremental:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
