/**
 * Server-side authentication helpers
 * Provides secure session management with httpOnly cookies
 */

import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

const SESSION_COOKIE_NAME = "session_token";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  tenantId: string | null;
  roleId: string | null;
  platformRole: string | null;
  role: {
    id: string;
    name: string;
    permissions: string[];
  } | null;
  isActive: boolean;
}

/**
 * Crea una nueva sesión para el usuario
 * @param userId ID del usuario
 * @returns Token de sesión generado
 */
export async function createSession(userId: string): Promise<string> {
  const sessionToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires: expiresAt,
    },
  });

  // Setear cookie httpOnly, secure, sameSite
  const cookieOptions: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2] = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  };

  // En producción con subdominios (*.kaledsoft.tech), establecer dominio para que la cookie persista
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (process.env.NODE_ENV === "production" && rootDomain) {
    cookieOptions.domain = `.${rootDomain}`;
  }

  (await cookies()).set(SESSION_COOKIE_NAME, sessionToken, cookieOptions);

  return sessionToken;
}

function getCookieDeleteOptions(): { path: string; domain?: string } {
  const opts: { path: string; domain?: string } = { path: "/" };
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (process.env.NODE_ENV === "production" && rootDomain) {
    opts.domain = `.${rootDomain}`;
  }
  return opts;
}

/**
 * Borra la cookie de sesión. Solo debe llamarse desde Route Handlers o Server Actions,
 * nunca desde Server Components (getCurrentUser).
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: SESSION_COOKIE_NAME, ...getCookieDeleteOptions() });
}

/**
 * Invalida la sesión actual
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    // Eliminar de la base de datos
    await prisma.session.deleteMany({
      where: { sessionToken },
    });

    // Eliminar cookie (mismo domain que al crear)
    cookieStore.delete({ name: SESSION_COOKIE_NAME, ...getCookieDeleteOptions() });
  }
}

/**
 * Obtiene el usuario autenticado actual desde la sesión
 * Usa React.cache() para deduplicar dentro del mismo request
 * @returns Usuario autenticado o null si no hay sesión válida
 */
export const getCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  // Buscar sesión en la base de datos
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        include: {
          role: true,
        },
      },
    },
  });

  const deleteInvalidCookie = () =>
    cookieStore.delete({ name: SESSION_COOKIE_NAME, ...getCookieDeleteOptions() });

  // Validar que la sesión existe y no ha expirado
  if (!session || session.expires < new Date()) {
    // Limpiar sesión expirada
    if (session) {
      await prisma.session.delete({
        where: { id: session.id },
      });
    }
    deleteInvalidCookie();
    return null;
  }

  // Validar que el usuario está activo (borrar cookie si está inactivo para evitar ciclos proxy/API)
  if (!session.user.isActive) {
    await prisma.session.delete({ where: { id: session.id } });
    deleteInvalidCookie();
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    tenantId: session.user.tenantId,
    roleId: session.user.roleId,
    platformRole: session.user.platformRole,
    role: session.user.role
      ? {
          id: session.user.role.id,
          name: session.user.role.name,
          permissions: session.user.role.permissions,
        }
      : null,
    isActive: session.user.isActive,
  };
});

/**
 * Requiere que exista un usuario autenticado
 * Lanza error 401 si no hay sesión válida
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError("Debe iniciar sesión para acceder a este recurso");
  }

  return user;
}

/**
 * Requiere que el usuario tenga uno de los roles especificados
 * @param allowedRoles Lista de nombres de roles permitidos
 */
export async function requireRole(allowedRoles: string[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!user.role || !allowedRoles.includes(user.role.name)) {
    throw new ForbiddenError(`Acceso denegado. Se requiere uno de estos roles: ${allowedRoles.join(", ")}`);
  }

  return user;
}

/**
 * Requiere que el usuario tenga uno de los permisos especificados
 * @param requiredPermissions Lista de permisos requeridos
 */
export async function requirePermission(requiredPermissions: string[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  const hasPermission = user.role && requiredPermissions.some((permission) =>
    user.role!.permissions.includes(permission)
  );

  if (!hasPermission) {
    throw new ForbiddenError(`Acceso denegado. Se requiere uno de estos permisos: ${requiredPermissions.join(", ")}`);
  }

  return user;
}

/**
 * Limpia sesiones expiradas de la base de datos
 * Se puede ejecutar como tarea programada
 */
export async function cleanExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}

/**
 * Valida protección CSRF verificando el header Origin
 * Debe llamarse en todas las mutaciones (POST, PUT, DELETE, PATCH)
 */
export function validateCSRF(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // En desarrollo, permitir localhost
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // Validar que el Origin coincida con el Host
  if (!origin || !host) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    const expectedOrigin = `${originUrl.protocol}//${host}`;
    return origin === expectedOrigin || origin.endsWith(`.${host}`);
  } catch {
    return false;
  }
}

// NOTA: Las clases UnauthorizedError y ForbiddenError ahora se importan desde @/lib/errors
// para asegurar que hereden correctamente de AppError y sean manejadas por handleApiError