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
  isTrialInvitation: z.boolean().optional(),
  trialCohortName: z.string().min(1).optional(),
  trialNextCohortDate: z.string().optional(), // ISO date string
}).refine(
  (data) => {
    if (data.isTrialInvitation) {
      return !!data.trialCohortName && !!data.trialNextCohortDate;
    }
    return !!data.roleId;
  },
  { message: "Para invitación trial se requieren trialCohortName y trialNextCohortDate. Para invitación normal se requiere roleId." }
);

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

    const { email, roleId, inviterId, academyRole, isTrialInvitation, trialCohortName, trialNextCohortDate } = validation.data;

    // Ejecutar todas las verificaciones independientes en paralelo (eliminando waterfall de 5 queries secuenciales)
    const [inviter, existingInvitation, existingUser, role] = await Promise.all([
      prisma.user.findUnique({
        where: { id: inviterId },
        include: { role: true },
      }),
      prisma.invitation.findFirst({
        where: { email, status: "PENDING" },
      }),
      prisma.user.findUnique({
        where: { email },
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

    // Check if inviter has permission (SUPERADMIN or ADMINISTRADOR)
    const allowedRoles = ["SUPERADMIN", "ADMINISTRADOR"];
    if (!inviter.role || !allowedRoles.includes(inviter.role.name)) {
      return NextResponse.json(
        { success: false, error: "No tienes permisos para enviar invitaciones" },
        { status: 403 }
      );
    }

    // Check invitation limit for ADMINISTRADOR (requiere query adicional que depende de inviter)
    if (inviter.role?.name === "ADMINISTRADOR") {
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
            error: "Has superado el tope de usuarios permitidos. Debe comunicarse con KaledSoft para aumentar la cantidad de usuarios.",
          },
          { status: 403 }
        );
      }
    }

    if (existingInvitation) {
      return NextResponse.json(
        { success: false, error: "Ya existe una invitación pendiente para este email" },
        { status: 400 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Este email ya está registrado en el sistema" },
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
    if (tenant?.slug === "kaledacademy" && !isTrialInvitation && !academyRole) {
      return NextResponse.json(
        { success: false, error: "Para Kaled Academy debe seleccionar un rol de Academia (Estudiante, Profesor o Admin)" },
        { status: 400 }
      );
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
        ...(isTrialInvitation && {
          isTrialInvitation: true,
          trialExpiresAt: expiresAt,
          trialCohortName: trialCohortName!,
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

      if (isTrialInvitation && trialCohortName && trialNextCohortDate) {
        await sendTrialInvitationEmail({
          to: email,
          token,
          trialCohortName,
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
