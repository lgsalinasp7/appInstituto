/**
 * API Route: /api/admin/tenants/[id]/invitations
 * GET: Lista invitaciones del tenant
 * POST: Crea invitaci?n (solo kaledacademy)
 * Permite a SUPER_ADMIN gestionar invitaciones sin estar en el contexto del tenant.
 * El [id] puede ser un id (cuid) o slug (ej. kaledacademy).
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { addDays } from "date-fns";
import { sendInvitationEmail, sendTrialInvitationEmail, TENANT_EMAIL_DEFAULTS } from "@/lib/email";
import { getAcademyRoleLabel } from "@/lib/academy-role-labels";
import { z } from "zod";
import { withCSRF, withPlatformAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/errors";
import { logApiOperation } from "@/lib/api-logger";

export const GET = withPlatformAdmin(
  ["SUPER_ADMIN"],
  async (request: NextRequest, user, context) => {
    try {
      const params = context?.params ? await context.params : {};
      const idOrSlug = params.id;
      if (!idOrSlug) {
        return NextResponse.json({ success: false, error: "Tenant requerido" }, { status: 400 });
      }

      const tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { id: idOrSlug },
            { slug: { equals: idOrSlug, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });
      if (!tenant) {
        return NextResponse.json({ success: false, error: "Tenant no encontrado" }, { status: 404 });
      }

      const invitations = await prisma.invitation.findMany({
        where: { tenantId: tenant.id },
        include: {
          inviter: { select: { id: true, name: true, email: true } },
          role: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, data: invitations });
    } catch (error) {
      return handleApiError(error);
    }
  }
);

const bodySchema = z.object({
  email: z.email("Email inv?lido"),
  academyRole: z.enum(["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"]).optional(),
  academyCohortId: z.string().min(1).optional(),
  isTrialInvitation: z.boolean().optional(),
  trialCohortName: z.string().min(1).optional(),
  trialNextCohortDate: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.isTrialInvitation) {
    const hasCohortPick = Boolean(data.academyCohortId?.trim());
    const hasLegacyName = Boolean(data.trialCohortName?.trim());
    if (!data.trialNextCohortDate?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Para invitaci?n de prueba indica la fecha del pr?ximo cohorte",
        path: ["trialNextCohortDate"],
      });
    }
    if (!hasCohortPick && !hasLegacyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona un cohorte de prueba o indica el nombre del cohorte",
        path: ["academyCohortId"],
      });
    }
    return;
  }
  if (!data.academyRole) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Indica el rol de Academia",
      path: ["academyRole"],
    });
  }
});

export const POST = withCSRF(
  withPlatformAdmin(["SUPER_ADMIN"], async (request: NextRequest, user, context) => {
    try {
      const params = context?.params ? await context.params : {};
      const idOrSlug = params.id;
      if (!idOrSlug || idOrSlug !== "kaledacademy") {
        return NextResponse.json(
          { success: false, error: "Solo se pueden crear invitaciones de Academia para el tenant kaledacademy" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const validation = bodySchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: "Datos inv?lidos", details: validation.error.format() },
          { status: 400 }
        );
      }
      const {
        email,
        academyRole,
        academyCohortId: academyCohortIdRaw,
        isTrialInvitation,
        trialCohortName,
        trialNextCohortDate,
      } = validation.data;
      const academyCohortId = academyCohortIdRaw?.trim() || undefined;

      const tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { id: idOrSlug },
            { slug: { equals: idOrSlug, mode: "insensitive" } },
          ],
        },
        select: { id: true, slug: true },
      });
      if (!tenant) {
        return NextResponse.json(
          { success: false, error: "Tenant no encontrado" },
          { status: 404 }
        );
      }

      const [existingInvitation, existingUser, roles] = await Promise.all([
        prisma.invitation.findFirst({
          where: {
            tenantId: tenant.id,
            status: "PENDING",
            email: { equals: email.trim(), mode: "insensitive" },
          },
        }),
        prisma.user.findFirst({
          where: {
            email: { equals: email.trim(), mode: "insensitive" },
          },
          select: { id: true, tenantId: true },
        }),
        prisma.role.findMany({
          where: { tenantId: tenant.id },
          select: { id: true, name: true },
        }),
      ]);

      if (existingInvitation) {
        return NextResponse.json(
          { success: false, error: "Ya existe una invitaci?n pendiente para este email" },
          { status: 400 }
        );
      }
      if (existingUser && existingUser.tenantId !== tenant.id) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Este email ya está registrado en otro instituto. Usa otro correo o contacta soporte.",
          },
          { status: 400 }
        );
      }

      const adminRole = roles.find((r) => r.name.toUpperCase() === "ADMINISTRADOR");
      const userRole = roles.find((r) => r.name.toUpperCase() === "USUARIO");
      const roleId =
        isTrialInvitation
          ? (userRole || adminRole || roles[0])?.id
          : academyRole === "ACADEMY_ADMIN" && adminRole
            ? adminRole.id
            : (userRole || adminRole || roles[0])?.id;
      if (!roleId) {
        return NextResponse.json(
          { success: false, error: "No se encontr? un rol v?lido en el tenant" },
          { status: 500 }
        );
      }

      if (
        !isTrialInvitation &&
        academyRole === "ACADEMY_STUDENT" &&
        !academyCohortId
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Para invitar un estudiante debes indicar el cohorte (academyCohortId) donde quedar? matriculado.",
          },
          { status: 400 }
        );
      }

      let resolvedTrialCohortName = trialCohortName?.trim();
      if (academyCohortId) {
        const cohortRow = await prisma.academyCohort.findFirst({
          where: {
            id: academyCohortId,
            tenantId: tenant.id,
            status: { in: ["ACTIVE", "DRAFT"] },
          },
          select: { id: true, name: true, maxStudents: true },
        });
        if (!cohortRow) {
          return NextResponse.json(
            {
              success: false,
              error:
                "El cohorte seleccionado no existe o no est? disponible para matr?cula (debe estar activo o en borrador).",
            },
            { status: 400 }
          );
        }
        if (isTrialInvitation) {
          resolvedTrialCohortName = resolvedTrialCohortName || cohortRow.name;
        }

        const countsTowardCohortCap =
          academyRole === "ACADEMY_STUDENT" || isTrialInvitation;
        if (countsTowardCohortCap && cohortRow.maxStudents > 0) {
          const [enrolled, pendingForCohort] = await Promise.all([
            prisma.academyEnrollment.count({
              where: { cohortId: academyCohortId, status: "ACTIVE" },
            }),
            prisma.invitation.count({
              where: {
                tenantId: tenant.id,
                academyCohortId,
                status: "PENDING",
              },
            }),
          ]);
          if (enrolled + pendingForCohort >= cohortRow.maxStudents) {
            return NextResponse.json(
              {
                success: false,
                error: `Este cohorte ya alcanz? el m?ximo de estudiantes (${cohortRow.maxStudents}), contando matr?culas activas e invitaciones pendientes.`,
              },
              { status: 400 }
            );
          }
        }
      }

      const token = randomUUID();
      const expiresAt = isTrialInvitation ? addDays(new Date(), 2) : addDays(new Date(), 7);

      const invitation = await prisma.invitation.create({
        data: {
          email,
          roleId,
          inviterId: user.id,
          tenantId: tenant.id,
          token,
          expiresAt,
          status: "PENDING",
          ...(academyCohortId && { academyCohortId }),
          ...(isTrialInvitation
            ? {
                isTrialInvitation: true,
                trialExpiresAt: expiresAt,
                trialCohortName: resolvedTrialCohortName!,
                trialNextCohortDate: trialNextCohortDate ? new Date(trialNextCohortDate) : null,
                academyRole: "ACADEMY_STUDENT",
              }
            : { academyRole }),
        },
        include: {
          role: { select: { name: true } },
        },
      });

      const tenantBranding = tenant.slug
        ? (TENANT_EMAIL_DEFAULTS[tenant.slug] ?? undefined)
        : undefined;

      if (isTrialInvitation && resolvedTrialCohortName && trialNextCohortDate) {
        await sendTrialInvitationEmail({
          to: email,
          token,
          trialCohortName: resolvedTrialCohortName,
          trialNextCohortDate: new Date(trialNextCohortDate),
          tenantSlug: tenant.slug,
          branding: tenantBranding,
        });
      } else {
        await sendInvitationEmail({
          to: email,
          token,
          roleName: invitation.role.name,
          roleDisplayLabel: getAcademyRoleLabel(invitation.academyRole),
          inviterName: user.name || user.email,
          tenantSlug: tenant.slug,
          branding: tenantBranding,
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          id: invitation.id,
          email: invitation.email,
          academyRole: invitation.academyRole,
          isTrialInvitation: invitation.isTrialInvitation ?? false,
        },
        message: "Invitaci?n enviada exitosamente",
      });
    } catch (error) {
      // Log detallado para debugging de errores Prisma
      const prismaErr = error as { code?: string; message?: string; meta?: unknown };
      if (prismaErr?.code) {
        // Reusamos contexto minimal — handleApiError maneja la respuesta;
        // este log adicional ayuda al diagnostico Prisma.
        const fakeCtx = {
          requestId: "n/a",
          method: request.method,
          endpoint: request.nextUrl.pathname,
          userId: user?.id,
          tenantId: undefined,
          ip: undefined,
          userAgent: undefined,
          timestamp: new Date().toISOString(),
        } as unknown as Parameters<typeof logApiOperation>[0];
        logApiOperation(fakeCtx, "invitations_post_prisma_error", "Prisma error en invitations POST", {
          code: prismaErr.code,
          message: prismaErr.message,
          meta: prismaErr.meta,
        });
      }
      return handleApiError(error);
    }
  })
);
