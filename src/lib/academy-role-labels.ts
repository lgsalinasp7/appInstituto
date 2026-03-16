/**
 * Mapeo de platformRole de Academia a etiquetas amigables en español.
 * Usar en todas las vistas donde se muestre el rol al usuario.
 */
const ACADEMY_ROLE_LABELS: Record<string, string> = {
  ACADEMY_STUDENT: "Estudiante",
  ACADEMY_TEACHER: "Profesor",
  ACADEMY_ADMIN: "Administrador",
};

/**
 * Convierte un platformRole de academia a etiqueta amigable.
 * Si el rol no está mapeado, devuelve el valor original o el fallback.
 */
export function getAcademyRoleLabel(
  platformRole: string | null | undefined,
  fallback = "—"
): string {
  if (!platformRole) return fallback;
  return ACADEMY_ROLE_LABELS[platformRole] ?? platformRole;
}
