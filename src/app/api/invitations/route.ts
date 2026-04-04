/**
 * API Route: /api/invitations
 * Handles invitation creation and listing
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { addDays } from "date-fns";
import { sendInvitationEmail, sendTrialInvitationEmail, TENANT_EMAIL_DEFAULTS } from "@/lib/email";
import { getAcademyRoleLabel } from "@/lib/academy-role-labels";
import { z } from "zod";
import { withTenantAuth, withTenantAuthAndCSRF } from "@/lib/api-auth";

// Validation schema for creating invitation
const createInvitationSchema = z.object({
  email: z.string().email("Email inválido"),
  roleId: z.string().min(1, "Rol requerido").optional(),
  inviterId: z.string().min(1, "Invitador requerido"),
  academyRole: z.enum(["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"]).optional(),
  /** Cohorte existente donde se matriculará el estudiante al aceptar. */
  academyCohortId: z.string().min(1).optional(),
  isTrialInvitation: z.boolean().optional(),
  trialCohortName: z.string().min(1).optional(),
  trialNextCohortDate: z.string().optional(), // ISO date string
}).superRefine((data, ctx) => {
  if (data.isTrialInvitation) {
    const hasCohortPick = Boolean(data.academyCohortId?.trim());
    const hasLegacyName = Boolean(data.trialCohortName?.trim());
    if (!data.trialNextCohortDate?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Para invitación de prueba indica la fecha del próximo cohorte",
        path: ["trialNextCohortDate"],
      });
    }
    if (!hasCohortPick && !hasLegacyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona un cohorte de prueba o indica el nombre del cohorte (flujo anterior)",
        path: ["academyCohortId"],
      });
    }
    return;
  }
  if (!data.roleId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Rol requerido",
      path: ["roleId"],
    });
  }
});

/**
 * GET /api/invitations
 * List all invitations, optionally filtered by inviterId
 */
export const GET = withTenantAuth(async (request: NextRequest, user, tenantId) => {
  const { searchParams } = new URL(request.url);
  const inviterId = searchParams.get("inviterId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {
    tenantId, // Filtrar por tenant
  };

  if (inviterId) {
    where.inviterId = inviterId;
  }

  if (status) {
    where.status = status;
  }

  const invitations = await prisma.invitation.findMany({
    where,
    include: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      inviter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    success: true,
    data: invitations,
  });
});

/**
 * POST /api/invitations
 * Create a new invitation and send email
 */
export const POST = withTenantAuthAndCSRF(async (request: NextRequest, user, tenantId) => {
  try {
    const body = await request.json();

    // Validate input
    const validation = createInvitationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos inválidos",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      email,
      roleId,
      inviterId,
      academyRole,
      academyCohortId: academyCohortIdRaw,
      isTrialInvitation,
      trialCohortName,
      trialNextCohortDate,
    } = validation.data;
    const academyCohortId = academyCohortIdRaw?.trim() || undefined;

    if (inviterId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Solo puedes enviar invitaciones en tu propio nombre" },
        { status: 403 }
      );
    }

    // Ejecutar todas las verificaciones independientes en paralelo (eliminando waterfall de 5 queries secuenciales)
    const [inviter, existingInvitation, existingUser, role] = await Promise.all([
      prisma.user.findUnique({
        where: { id: inviterId },
        select: {
          id: true,
          name: true,
          email: true,
          tenantId: true,
          platformRole: true,
          invitationLimit: true,
          role: { select: { name: true } },
        },
      }),
      prisma.invitation.findFirst({
        where: {
          tenantId,
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
      roleId
        ? prisma.role.findUnique({ where: { id: roleId } })
        : Promise.resolve(null),
    ]);

    if (!inviter) {
      return NextResponse.json(
        { success: false, error: "Usuario invitador no encontrado" },
        { status: 404 }
      );
    }

    if (inviter.tenantId !== tenantId) {
      return NextResponse.json(
        { success: false, error: "El invitador no pertenece a este instituto" },
        { status: 403 }
      );
    }

    const roleNameNorm = inviter.role?.name?.trim().toUpperCase() ?? "";
    const canInviteByTenantRole =
      roleNameNorm === "SUPERADMIN" || roleNameNorm === "ADMINISTRADOR";
    const canInviteByAcademyRole = inviter.platformRole === "ACADEMY_ADMIN";

    if (!canInviteByTenantRole && !canInviteByAcademyRole) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No tienes permisos para enviar invitaciones. Se requiere rol Administrador del instituto o Administrador de Academia.",
        },
        { status: 403 }
      );
    }

    if (existingInvitation) {
      return NextResponse.json(
        { success: false, error: "Ya existe una invitación pendiente para este email" },
        { status: 400 }
      );
    }

    if (existingUser && existingUser.tenantId !== tenantId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Este email ya está registrado en otro instituto. Usa otro correo o contacta soporte.",
        },
        { status: 400 }
      );
    }

    let effectiveRoleId = role?.id;
    if (isTrialInvitation) {
      const userRole = await prisma.role.findFirst({
        where: { tenantId, name: { equals: "USUARIO", mode: "insensitive" } },
      });
      effectiveRoleId = userRole?.id ?? role?.id;
    }
    if (!effectiveRoleId) {
      return NextResponse.json(
        { success: false, error: "Rol no encontrado" },
        { status: 404 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true },
    });

    // Cupo de invitaciones del instituto (rol tenant ADMINISTRADOR). invitationLimit 0 = sin tope configurado.
    // En Kaled Academy, invitaciones con rol de plataforma no consumen ese cupo (el cupo del cohorte aplica aparte).
    const instituteSeatInvite = tenant?.slug !== "kaledacademy" || !academyRole;
    if (
      roleNameNorm === "ADMINISTRADOR" &&
      inviter.invitationLimit > 0 &&
      instituteSeatInvite
    ) {
      const totalOccupiedSeats = await prisma.invitation.count({
        where: {
          inviterId,
          status: { in: ["PENDING", "ACCEPTED"] },
        },
      });

      if (totalOccupiedSeats >= inviter.invitationLimit) {
        return NextResponse.json(
          {
            success: false,
            code: "LIMIT_REACHED",
            error:
              "Has superado el tope de invitaciones de usuario del instituto configurado para tu cuenta. Para invitar estudiantes a Academia usa el flujo con rol de Academia y cohorte; si necesitas más cupo de staff, contacta a KaledSoft.",
          },
          { status: 403 }
        );
      }
    }

    if (tenant?.slug === "kaledacademy" && !isTrialInvitation && !academyRole) {
      return NextResponse.json(
        { success: false, error: "Para Kaled Academy debe seleccionar un rol de Academia (Estudiante, Profesor o Admin)" },
        { status: 400 }
      );
    }

    if (
      tenant?.slug === "kaledacademy" &&
      !isTrialInvitation &&
      academyRole === "ACADEMY_STUDENT" &&
      !academyCohortId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Para invitar un estudiante debes seleccionar el cohorte donde quedará matriculado (créalo antes en la gestión del curso).",
        },
        { status: 400 }
      );
    }

    let resolvedTrialCohortName = trialCohortName?.trim();
    if (academyCohortId) {
      const cohortRow = await prisma.academyCohort.findFirst({
        where: {
          id: academyCohortId,
          tenantId,
          status: { in: ["ACTIVE", "DRAFT"] },
        },
        select: { id: true, name: true, maxStudents: true },
      });
      if (!cohortRow) {
        return NextResponse.json(
          {
            success: false,
            error:
              "El cohorte seleccionado no existe o no está disponible para matrícula (debe estar activo o en borrador).",
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
              tenantId,
              academyCohortId,
              status: "PENDING",
            },
          }),
        ]);
        if (enrolled + pendingForCohort >= cohortRow.maxStudents) {
          return NextResponse.json(
            {
              success: false,
              error: `Este cohorte ya tiene el máximo de estudiantes (${cohortRow.maxStudents}), contando matrículas activas e invitaciones pendientes. Aumenta «Máx. estudiantes» en la gestión del curso o cancela invitaciones pendientes.`,
            },
            { status: 400 }
          );
        }
      }
    }

    if (isTrialInvitation && tenant?.slug !== "kaledacademy") {
      return NextResponse.json(
        { success: false, error: "Las invitaciones de prueba solo están disponibles para Kaled Academy" },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = randomUUID();

    const expiresAt = isTrialInvitation ? addDays(new Date(), 2) : addDays(new Date(), 7);

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        roleId: effectiveRoleId,
        inviterId,
        tenantId,
        token,
        expiresAt,
        status: "PENDING",
        ...(academyRole && { academyRole }),
        ...(academyCohortId && { academyCohortId }),
        ...(isTrialInvitation && {
          isTrialInvitation: true,
          trialExpiresAt: expiresAt,
          trialCohortName: resolvedTrialCohortName!,
          trialNextCohortDate: trialNextCohortDate ? new Date(trialNextCohortDate) : null,
          academyRole: "ACADEMY_STUDENT",
        }),
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // tenant ya obtenido arriba

    // Send invitation email
    try {
      const tenantBranding = tenant?.slug
        ? (TENANT_EMAIL_DEFAULTS[tenant.slug] ?? undefined)
        : undefined;

      if (isTrialInvitation && resolvedTrialCohortName && trialNextCohortDate) {
        await sendTrialInvitationEmail({
          to: email,
          token,
          trialCohortName: resolvedTrialCohortName,
          trialNextCohortDate: new Date(trialNextCohortDate),
          tenantSlug: tenant?.slug,
          branding: tenantBranding,
        });
      } else {
        await sendInvitationEmail({
          to: email,
          token,
          roleName: invitation.role?.name ?? role?.name ?? "Usuario",
          roleDisplayLabel: academyRole ? getAcademyRoleLabel(academyRole) : undefined,
          inviterName: inviter.name || inviter.email,
          tenantSlug: tenant?.slug,
          branding: tenantBranding,
        });
      }
    } catch (emailError) {
      // If email fails, delete the invitation
      await prisma.invitation.delete({
        where: { id: invitation.id },
      });

      console.error("Error sending invitation email:", emailError);
      return NextResponse.json(
        { success: false, error: "Error al enviar el email de invitación" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invitation,
      message: "Invitación enviada exitosamente",
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear invitación" },
      { status: 500 }
    );
  }
});
