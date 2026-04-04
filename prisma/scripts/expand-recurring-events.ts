/**
 * Script para expandir eventos recurrentes (dayOfWeek) a registros individuales con scheduledAt.
 *
 * Ejecutar: npx tsx prisma/scripts/expand-recurring-events.ts
 *
 * Idempotente: solo procesa eventos con dayOfWeek IS NOT NULL AND scheduledAt IS NULL.
 * Usa transacción por cohorte.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Buscar eventos recurrentes template (dayOfWeek definido, sin scheduledAt)
  const templates = await prisma.academyCohortEvent.findMany({
    where: {
      dayOfWeek: { not: null },
      scheduledAt: null,
    },
    include: {
      cohort: {
        select: { id: true, startDate: true, endDate: true, timezone: true },
      },
    },
  });

  if (templates.length === 0) {
    console.log("No hay eventos recurrentes para expandir.");
    return;
  }

  console.log(`Encontrados ${templates.length} eventos recurrentes template.`);

  // Agrupar por cohorte para procesar en transacción
  const byCohort = new Map<
    string,
    typeof templates
  >();
  for (const t of templates) {
    const existing = byCohort.get(t.cohortId) ?? [];
    existing.push(t);
    byCohort.set(t.cohortId, existing);
  }

  let totalCreated = 0;
  let totalDeleted = 0;

  for (const [cohortId, cohortTemplates] of byCohort) {
    const cohort = cohortTemplates[0].cohort;
    console.log(
      `\nCohorte ${cohortId}: ${cohortTemplates.length} template(s), ` +
      `rango ${cohort.startDate.toISOString().slice(0, 10)} → ${cohort.endDate.toISOString().slice(0, 10)}`
    );

    await prisma.$transaction(async (tx) => {
      // Obtener max sessionOrder actual del cohorte
      const maxOrder = await tx.academyCohortEvent.aggregate({
        where: { cohortId },
        _max: { sessionOrder: true },
      });
      let nextOrder = (maxOrder._max.sessionOrder ?? -1) + 1;

      for (const template of cohortTemplates) {
        const dates: Date[] = [];
        const cursor = new Date(cohort.startDate);
        const end = cohort.endDate;

        while (cursor <= end) {
          if (cursor.getDay() === template.dayOfWeek) {
            const dt = new Date(cursor);
            if (template.startTime) {
              const [hh, mm] = template.startTime.split(":").map(Number);
              dt.setHours(hh, mm, 0, 0);
            }
            dates.push(new Date(dt));
          }
          cursor.setDate(cursor.getDate() + 1);
        }

        if (dates.length === 0) {
          console.log(`  Template "${template.title}" (day=${template.dayOfWeek}): 0 fechas, omitido.`);
          continue;
        }

        console.log(`  Template "${template.title}" (day=${template.dayOfWeek}): → ${dates.length} registros individuales`);

        // Crear registros individuales
        await tx.academyCohortEvent.createMany({
          data: dates.map((d) => ({
            cohortId,
            title: template.title,
            type: template.type,
            startTime: template.startTime,
            endTime: template.endTime,
            scheduledAt: d,
            lessonId: template.lessonId,
            sessionOrder: nextOrder++,
            cancelled: template.cancelled,
          })),
        });

        totalCreated += dates.length;

        // Eliminar el template original
        await tx.academyCohortEvent.delete({
          where: { id: template.id },
        });
        totalDeleted++;
      }
    });
  }

  console.log(
    `\nResumen: ${totalCreated} registros creados, ${totalDeleted} templates eliminados.`
  );
}

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
