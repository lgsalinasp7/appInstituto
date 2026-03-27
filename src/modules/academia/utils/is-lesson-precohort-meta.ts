/**
 * Utilidad pura (sin Prisma): compartible entre servidor y cliente.
 * Pre-cohorte: flag en meta o semana 0 (convención).
 */
export function isLessonPrecohortMeta(
  meta: { isPrecohort?: boolean; weekNumber?: number } | null | undefined
): boolean {
  if (!meta) return false;
  if (meta.isPrecohort === true) return true;
  return meta.weekNumber === 0;
}
