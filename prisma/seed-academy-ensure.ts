/**
 * Evita módulos duplicados al re-ejecutar seeds del bootcamp:
 * reutiliza el primer módulo activo por (courseId, order) en lugar de crear otro.
 */
import type { PrismaClient } from "@prisma/client";

export async function ensureAcademyModule(
  prisma: PrismaClient,
  courseId: string,
  order: number,
  data: { title: string; description: string }
): Promise<{ id: string; lessons: { id: string }[] }> {
  const existing = await prisma.academyModule.findFirst({
    where: { courseId, order, isActive: true },
    orderBy: { createdAt: "asc" },
    include: { lessons: { orderBy: { order: "asc" }, select: { id: true } } },
  });
  if (existing) {
    return { id: existing.id, lessons: existing.lessons };
  }
  const created = await prisma.academyModule.create({
    data: {
      title: data.title,
      description: data.description,
      order,
      isActive: true,
      courseId,
    },
  });
  return { id: created.id, lessons: [] };
}

/** Curso canónico del bootcamp (único que deben poblar los seeds de academia). */
export const BOOTCAMP_COURSE_ID = "kaledacademy-bootcamp-2025";

/**
 * Red de seguridad: detecta módulos duplicados (>1 por order) y borra
 * los sobrantes conservando siempre el más antiguo (createdAt ASC).
 * Retorna la cantidad de módulos eliminados (0 si no había duplicados).
 */
export async function purgeDuplicateModules(
  prisma: PrismaClient,
  courseId: string
): Promise<number> {
  const allModules = await prisma.academyModule.findMany({
    where: { courseId },
    orderBy: { createdAt: "asc" },
    select: { id: true, order: true },
  });

  const canonicalIds = new Set<string>();
  const seenOrders = new Set<number>();
  for (const m of allModules) {
    if (!seenOrders.has(m.order)) {
      seenOrders.add(m.order);
      canonicalIds.add(m.id);
    }
  }

  const duplicateIds = allModules
    .filter((m) => !canonicalIds.has(m.id))
    .map((m) => m.id);

  if (duplicateIds.length === 0) return 0;

  const { count } = await prisma.academyModule.deleteMany({
    where: { id: { in: duplicateIds } },
  });

  console.log(
    `  🧹 purgeDuplicateModules: eliminados ${count} módulos duplicados (conservados ${canonicalIds.size} canónicos)`
  );
  return count;
}
