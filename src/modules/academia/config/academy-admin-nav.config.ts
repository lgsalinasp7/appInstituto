import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  Trophy,
  School,
  Activity,
  FileCheck,
} from "lucide-react";

export type AcademyAdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** When true, only exact pathname match counts as active */
  exact?: boolean;
};

export type AcademyAdminNavGroup = {
  title: string;
  items: AcademyAdminNavItem[];
};

/**
 * Admin sidebar IA (visión → programa con personas → operación → comunidad).
 * Usuarios del programa: roles academia (estudiante, profesor) + pestaña Prueba.
 * Atajo dashboard a trial: AdminAnalyticsOverview → /users?tab=trial
 */
export const ACADEMY_ADMIN_NAV_GROUPS: AcademyAdminNavGroup[] = [
  {
    title: "Visión general",
    items: [
      {
        href: "/academia/admin/analytics",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: "Programa",
    items: [
      { href: "/academia/admin/courses", label: "Cursos", icon: BookOpen },
      { href: "/academia/admin/cohorts", label: "Cohortes", icon: School },
      { href: "/academia/admin/users", label: "Usuarios", icon: Users },
    ],
  },
  {
    title: "Operación",
    items: [
      { href: "/academia/admin/operations", label: "Operación", icon: Activity },
      { href: "/academia/admin/deliverables", label: "Entregables", icon: FileCheck },
      { href: "/academia/admin/calendar", label: "Calendario", icon: Calendar },
    ],
  },
  {
    title: "Comunidad",
    items: [{ href: "/academia/admin/leaderboard", label: "Leaderboard", icon: Trophy }],
  },
];

/** Barra inferior móvil: atajos a las áreas más usadas */
export const ACADEMY_ADMIN_MOBILE_QUICK: AcademyAdminNavItem[] = [
  {
    href: "/academia/admin/analytics",
    label: "Inicio",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/academia/admin/operations", label: "Operación", icon: Activity },
  { href: "/academia/admin/courses", label: "Cursos", icon: BookOpen },
  { href: "/academia/admin/cohorts", label: "Cohortes", icon: School },
  { href: "/academia/admin/users", label: "Usuarios", icon: Users },
];

export function isAcademyAdminNavItemActive(pathname: string, item: AcademyAdminNavItem): boolean {
  if (item.href === "/academia/admin/users") {
    const onUsers = pathname === "/academia/admin/users" || pathname.startsWith("/academia/admin/users/");
    return onUsers;
  }
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}
