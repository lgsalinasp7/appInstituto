/**
 * Configuración de rutas y permisos por platformRole de Academia
 */
import type { PlatformRole } from "@prisma/client";

export const ACADEMY_ROLES = [
  "ACADEMY_STUDENT",
  "ACADEMY_TEACHER",
  "ACADEMY_ADMIN",
] as const;

export type AcademyRole = (typeof ACADEMY_ROLES)[number];

export function isAcademyRole(role: string | null): role is AcademyRole {
  return role !== null && ACADEMY_ROLES.includes(role as AcademyRole);
}

export const ACADEMY_ROUTES = {
  student: [
    { path: "/academia/student", label: "Inicio" },
    { path: "/academia/student/courses", label: "Mis Cursos" },
    { path: "/academia/student/progress", label: "Mi Progreso" },
  ],
  teacher: [
    { path: "/academia/teacher", label: "Inicio" },
    { path: "/academia/teacher/students", label: "Estudiantes" },
    { path: "/academia/teacher/courses", label: "Cursos" },
    { path: "/academia/teacher/messages", label: "Mensajes" },
  ],
  admin: [
    { path: "/academia/admin", label: "Inicio" },
    { path: "/academia/admin/courses", label: "Cursos" },
    { path: "/academia/admin/cohorts", label: "Cohortes" },
    { path: "/academia/admin/users", label: "Usuarios" },
    { path: "/academia/admin/analytics", label: "Analytics" },
  ],
} as const;

export function getAcademyRoutesForRole(role: PlatformRole | null) {
  if (!role) return [];
  switch (role) {
    case "ACADEMY_STUDENT":
      return ACADEMY_ROUTES.student;
    case "ACADEMY_TEACHER":
      return [...ACADEMY_ROUTES.teacher];
    case "ACADEMY_ADMIN":
      return [...ACADEMY_ROUTES.admin];
    default:
      return [];
  }
}
