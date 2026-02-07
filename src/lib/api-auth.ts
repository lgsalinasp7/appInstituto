/**
 * API Route Authentication Wrappers
 * Provides middleware-like functions to protect API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireAuth, requireRole, requirePermission, validateCSRF, AuthenticatedUser } from "@/lib/auth";
import { handleApiError, UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { PlatformRole } from "@prisma/client";
import { headers } from "next/headers";

/**
 * Handler type for authenticated routes
 */
export type AuthenticatedHandler = (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: { params: Promise<Record<string, string>> }
) => Promise<Response>;

/**
 * Handler type for tenant-authenticated routes
 */
export type TenantAuthHandler = (
  request: NextRequest,
  user: AuthenticatedUser,
  tenantId: string,
  context?: { params: Promise<Record<string, string>> }
) => Promise<Response>;

/**
 * Handler type for platform admin routes
 */
export type PlatformAdminHandler = (
  request: NextRequest,
  user: AuthenticatedUser,
  context?: { params: Promise<Record<string, string>> }
) => Promise<Response>;

/**
 * Resuelve el tenant ID a partir del slug inyectado por middleware
 * El middleware setea x-tenant-slug (no x-tenant-id) porque no puede
 * hacer queries a DB (Edge Runtime). Aquí resolvemos slug → id.
 */
async function getCurrentTenantId(): Promise<string | null> {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug");

  if (!tenantSlug) return null;

  const { prisma } = await import("@/lib/prisma");
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true, status: true },
  });

  if (!tenant) return null;

  // Bloquear acceso si el tenant está suspendido o cancelado
  if (tenant.status === "SUSPENDIDO" || tenant.status === "CANCELADO") {
    throw new ForbiddenError(
      `El tenant se encuentra ${tenant.status.toLowerCase()}. Contacte a soporte.`
    );
  }

  return tenant.id;
}

/**
 * Wrapper básico de autenticación
 * Valida que exista un usuario autenticado
 * 
 * @example
 * export const GET = withAuth(async (request, user) => {
 *   return NextResponse.json({ user });
 * });
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    try {
      const user = await requireAuth();
      return await handler(request, user, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Wrapper de autenticación con validación de tenant
 * Valida que el usuario pertenezca al tenant del subdominio
 * 
 * @example
 * export const GET = withTenantAuth(async (request, user, tenantId) => {
 *   const students = await prisma.student.findMany({ where: { tenantId } });
 *   return NextResponse.json(students);
 * });
 */
export function withTenantAuth(handler: TenantAuthHandler) {
  return async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    try {
      const user = await requireAuth();
      const tenantId = await getCurrentTenantId();

      if (!tenantId) {
        throw new UnauthorizedError("No se pudo determinar el tenant");
      }

      // Verificar que el usuario pertenezca al tenant (excepto usuarios de plataforma)
      if (user.tenantId && user.tenantId !== tenantId) {
        throw new ForbiddenError("No tiene acceso a este tenant");
      }

      return await handler(request, user, tenantId, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Wrapper de autenticación con validación de rol
 * Valida que el usuario tenga uno de los roles especificados
 * 
 * @example
 * export const DELETE = withRole(["Admin", "SuperAdmin"], async (request, user) => {
 *   // Solo Admin y SuperAdmin pueden eliminar
 *   return NextResponse.json({ success: true });
 * });
 */
export function withRole(allowedRoles: string[], handler: AuthenticatedHandler) {
  return async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    try {
      const user = await requireRole(allowedRoles);
      return await handler(request, user, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Wrapper de autenticación con validación de permisos
 * Valida que el usuario tenga uno de los permisos especificados
 * 
 * @example
 * export const POST = withPermission(["create_students"], async (request, user) => {
 *   // Solo usuarios con permiso create_students
 *   return NextResponse.json({ success: true });
 * });
 */
export function withPermission(requiredPermissions: string[], handler: AuthenticatedHandler) {
  return async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    try {
      const user = await requirePermission(requiredPermissions);
      return await handler(request, user, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Wrapper para rutas de administración de plataforma (admin.kaledsoft.tech)
 * Valida que el usuario tenga un platformRole (SUPER_ADMIN, ASESOR_COMERCIAL, MARKETING)
 * 
 * @example
 * export const GET = withPlatformAdmin(["SUPER_ADMIN"], async (request, user) => {
 *   const tenants = await prisma.tenant.findMany();
 *   return NextResponse.json(tenants);
 * });
 */
export function withPlatformAdmin(
  allowedRoles: PlatformRole[],
  handler: PlatformAdminHandler
) {
  return async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new UnauthorizedError("Debe iniciar sesión");
      }

      // Verificar que sea un usuario de plataforma (sin tenantId)
      if (user.tenantId) {
        throw new ForbiddenError("Esta área es solo para administradores de KaledSoft");
      }

      // Obtener platformRole desde la DB
      const { prisma } = await import("@/lib/prisma");
      const userWithPlatformRole = await prisma.user.findUnique({
        where: { id: user.id },
        select: { platformRole: true },
      });

      if (!userWithPlatformRole?.platformRole) {
        throw new ForbiddenError("No tiene permisos de administrador de plataforma");
      }

      if (!allowedRoles.includes(userWithPlatformRole.platformRole)) {
        throw new ForbiddenError(
          `Acceso denegado. Se requiere uno de estos roles: ${allowedRoles.join(", ")}`
        );
      }

      return await handler(request, user, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Wrapper para rutas que requieren protección CSRF
 * Valida el header Origin en mutaciones (POST, PUT, DELETE, PATCH)
 * 
 * @example
 * export const POST = withCSRF(withAuth(async (request, user) => {
 *   // Protegido contra CSRF
 *   return NextResponse.json({ success: true });
 * }));
 */
export function withCSRF(handler: (request: NextRequest, context?: any) => Promise<Response>) {
  return async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    try {
      // Solo validar en mutaciones
      if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
        if (!validateCSRF(request)) {
          throw new ForbiddenError("Validación CSRF falló. Origen no autorizado.");
        }
      }

      return await handler(request, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Wrapper combinado: autenticación + tenant + CSRF
 * La combinación más común para API routes de tenant
 * 
 * @example
 * export const POST = withTenantAuthAndCSRF(async (request, user, tenantId) => {
 *   // Totalmente protegido: autenticado + tenant correcto + CSRF
 *   return NextResponse.json({ success: true });
 * });
 */
export function withTenantAuthAndCSRF(handler: TenantAuthHandler) {
  return withCSRF(withTenantAuth(handler));
}

/**
 * Wrapper combinado: autenticación + CSRF
 * 
 * @example
 * export const POST = withAuthAndCSRF(async (request, user) => {
 *   return NextResponse.json({ success: true });
 * });
 */
export function withAuthAndCSRF(handler: AuthenticatedHandler) {
  return withCSRF(withAuth(handler));
}
