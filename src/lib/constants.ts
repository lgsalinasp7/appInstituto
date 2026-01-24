/**
 * Application Constants
 * Central place for all app-wide constants
 */

export const APP_NAME = "App Instituto";
export const APP_DESCRIPTION = "Sistema de gestión institucional";

export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  ADMIN: {
    HOME: "/admin",
    USERS: "/admin/users",
    ROLES: "/admin/roles",
    AUDIT: "/admin/audit",
  },
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
