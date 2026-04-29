import type { PlatformRole } from "@prisma/client";

export const ACADEMY_ROLES: PlatformRole[] = [
  "ACADEMY_STUDENT",
  "ACADEMY_TEACHER",
  "ACADEMY_ADMIN",
];

export const INSTRUCTOR_ROLES: PlatformRole[] = [
  "ACADEMY_TEACHER",
  "ACADEMY_ADMIN",
];
