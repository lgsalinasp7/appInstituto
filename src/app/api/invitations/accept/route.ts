/**
 * API Route: /api/invitations/accept
 * Accept an invitation and create user account
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/modules/auth/services/auth.service";
import { courseService } from "@/modules/academy/services/academy.service";
import { z } from "zod";
import { addYears } from "date-fns";

// Validation schema
const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
});

/**
 * GET /api/invitations/accept?token=xxx
 * Validate token and get invitation details
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token requerido" },
        { status: 400 }
      );
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
        tenant: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitación no encontrada" },
        { status: 404 }
      );
    }

    // Check if already accepted
    if (invitation.status === "ACCEPTED") {
      return NextResponse.json(
        { success: false, error: "Esta invitación ya fue aceptada" },
        { status: 400 }
      );
    }

    // Check if expired
    if (invitation.status === "EXPIRED" || new Date() > invitation.expiresAt) {
      // Update status if not already expired
      if (invitation.status !== "EXPIRED") {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: "EXPIRED" },
        });
      }

      return NextResponse.json(
        { success: false, error: "Esta invitación ha expirado" },
        { status: 400 }
      );
    }

    const inv = invitation as typeof invitation & {
      isTrialInvitation?: boolean;
      trialCohortName?: string | null;
      trialNextCohortDate?: Date | null;
    };

    return NextResponse.json({
      success: true,
      data: {
        email: invitation.email,
        role: invitation.role,
        inviter: invitation.inviter,
        tenantSlug: invitation.tenant?.slug,
        tenantName: invitation.tenant?.name,
        expiresAt: invitation.expiresAt,
        academyRole: inv.academyRole ?? null,
        lavaderoRole: (invitation as { lavaderoRole?: string }).lavaderoRole ?? null,
        isTrialInvitation: inv.isTrialInvitation ?? false,
        trialCohortName: inv.trialCohortName ?? null,
        trialNextCohortDate: inv.trialNextCohortDate?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { success: false, error: "Error al validar invitación" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invitations/accept
 * Accept invitation and create user account
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = acceptInvitationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos inválidos",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { token, name, password } = validation.data;

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        role: true,
        tenant: { select: { slug: true } },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitación no encontrada" },
        { status: 404 }
      );
    }

    // Check if already accepted
    if (invitation.status === "ACCEPTED") {
      return NextResponse.json(
        { success: false, error: "Esta invitación ya fue aceptada" },
        { status: 400 }
      );
    }

    // Check if expired
    if (invitation.status === "EXPIRED" || new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });

      return NextResponse.json(
        { success: false, error: "Esta invitación ha expirado" },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    // Determine platformRole from academyRole or lavaderoRole
    const invitationWithRoles = invitation as typeof invitation & {
      lavaderoRole?: string;
    };
    let platformRole: string | undefined;
    if (invitation.tenant?.slug === "kaledacademy" && invitation.academyRole) {
      platformRole = invitation.academyRole;
    } else if (invitationWithRoles.lavaderoRole) {
      platformRole = invitationWithRoles.lavaderoRole;
    }

    const inv = invitation as typeof invitation & {
      isTrialInvitation?: boolean;
      trialExpiresAt?: Date | null;
      trialCohortName?: string | null;
    };

    // Create user with hashed password using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await AuthService.createUser({
        email: invitation.email,
        name,
        password,
        roleId: invitation.roleId,
        tenantId: invitation.tenantId,
        ...(platformRole && { platformRole }),
      });

      // Update invitation status
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      // Trial enrollment: create cohort, enrollment, snapshot
      if (inv.isTrialInvitation && invitation.tenant?.slug === "kaledacademy") {
        const tenantId = invitation.tenantId;
        const trialExpiresAt = inv.trialExpiresAt ?? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        const trialCohortName = inv.trialCohortName ?? "Prueba";

        const firstLessonId = await courseService.getFirstLessonOfModule1(tenantId);
        if (!firstLessonId) {
          throw new Error("No se encontró la primera lección del Módulo 1 para el acceso de prueba");
        }

        const course = await tx.academyCourse.findFirst({
          where: { tenantId, isActive: true },
        });
        if (!course) {
          throw new Error("No se encontró el curso principal de Kaled Academy");
        }

        let cohort = await tx.academyCohort.findFirst({
          where: {
            courseId: course.id,
            tenantId,
            name: trialCohortName,
            status: "ACTIVE",
          },
        });

        if (!cohort) {
          const now = new Date();
          cohort = await tx.academyCohort.create({
            data: {
              name: trialCohortName,
              startDate: now,
              endDate: addYears(now, 1),
              maxStudents: 9999,
              currentStudents: 0,
              status: "ACTIVE",
              schedule: {},
              courseId: course.id,
              tenantId,
            },
          });
        }

        const enrollment = await tx.academyEnrollment.create({
          data: {
            userId: user.id,
            courseId: course.id,
            cohortId: cohort.id,
            status: "ACTIVE",
            progress: 0,
            isTrial: true,
            trialExpiresAt,
            trialAllowedLessonId: firstLessonId,
          },
        });

        await tx.academyStudentSnapshot.create({
          data: {
            userId: user.id,
            cohortId: cohort.id,
            enrollmentId: enrollment.id,
            overallProgress: 0,
            lessonsCompleted: 0,
            lessonsTotal: 1,
            quizzesPassed: 0,
            quizzesTotal: 0,
            deliverablesSubmitted: 0,
            deliverablesApproved: 0,
            kaledInteractions: 0,
            tenantId,
          },
        });

        await tx.academyCohort.update({
          where: { id: cohort.id },
          data: { currentStudents: { increment: 1 } },
        });
      }

      return user;
    });

    return NextResponse.json({
      success: true,
      message: "Cuenta creada exitosamente",
      data: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role?.name || "Sin rol",
      },
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear cuenta" },
      { status: 500 }
    );
  }
}
