/**
 * API Route: /api/invitations/accept
 * Accept an invitation and create user account
 */

import { NextRequest, NextResponse } from "next/server";
import type { PlatformRole, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { AuthService } from "@/modules/auth/services/auth.service";
import { courseService } from "@/modules/academia/services/academy.service";
import { z } from "zod";
import { addYears } from "date-fns";
import { logApiStart, logApiSuccess, logApiError } from "@/lib/api-logger";

async function enrollStudentFromInvitation(
  tx: Prisma.TransactionClient,
  opts: {
    tenantId: string;
    userId: string;
    cohortId: string;
    isTrial: boolean;
    trialExpiresAt: Date | null;
    trialAllowedLessonId: string | null;
    lessonsTotalSnapshot: number;
  }
) {
  const cohort = await tx.academyCohort.findFirst({
    where: { id: opts.cohortId, tenantId: opts.tenantId },
  });
  if (!cohort) {
    throw new Error("Cohorte no encontrado o no pertenece al instituto");
  }

  const dup = await tx.academyEnrollment.findFirst({
    where: { userId: opts.userId, courseId: cohort.courseId },
  });
  if (dup) {
    throw new Error("El estudiante ya tiene matrÃ­cula en este curso");
  }

  const enrollment = await tx.academyEnrollment.create({
    data: {
      userId: opts.userId,
      courseId: cohort.courseId,
      cohortId: cohort.id,
      status: "ACTIVE",
      progress: 0,
      isTrial: opts.isTrial,
      trialExpiresAt: opts.trialExpiresAt,
      trialAllowedLessonId: opts.trialAllowedLessonId,
    },
  });

  await tx.academyStudentSnapshot.create({
    data: {
      userId: opts.userId,
      cohortId: cohort.id,
      enrollmentId: enrollment.id,
      overallProgress: 0,
      lessonsCompleted: 0,
      lessonsTotal: opts.lessonsTotalSnapshot,
      quizzesPassed: 0,
      quizzesTotal: 0,
      deliverablesSubmitted: 0,
      deliverablesApproved: 0,
      kaledInteractions: 0,
      tenantId: opts.tenantId,
    },
  });

  await tx.academyCohort.update({
    where: { id: cohort.id },
    data: { currentStudents: { increment: 1 } },
  });
}

// Validation schema
const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  password: z.string().min(6, "ContraseÃ±a debe tener al menos 6 caracteres"),
});

/**
 * GET /api/invitations/accept?token=xxx
 * Validate token and get invitation details
 */
export async function GET(request: NextRequest) {
  const ctx = logApiStart(request, "invitations_accept_validate");
  const startedAt = Date.now();
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
        academyCohort: {
          select: { id: true, name: true },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "InvitaciÃ³n no encontrada" },
        { status: 404 }
      );
    }

    // Check if already accepted
    if (invitation.status === "ACCEPTED") {
      return NextResponse.json(
        { success: false, error: "Esta invitaciÃ³n ya fue aceptada" },
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
        { success: false, error: "Esta invitaciÃ³n ha expirado" },
        { status: 400 }
      );
    }

    const inv = invitation as typeof invitation & {
      isTrialInvitation?: boolean;
      trialCohortName?: string | null;
      trialNextCohortDate?: Date | null;
    };

    const existingInTenant = await prisma.user.findFirst({
      where: {
        tenantId: invitation.tenantId,
        email: { equals: invitation.email, mode: "insensitive" },
      },
      select: { id: true, name: true },
    });

    logApiSuccess(ctx, "invitations_accept_validate", { duration: Date.now() - startedAt, resultId: invitation.id });
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
        academyCohortId: invitation.academyCohortId ?? null,
        academyCohortName: invitation.academyCohort?.name ?? null,
        existingUserInTenant: Boolean(existingInTenant),
        prefillName: existingInTenant?.name?.trim() || null,
      },
    });
  } catch (error) {
    logApiError(ctx, "invitations_accept_validate", { error });
    return NextResponse.json(
      { success: false, error: "Error al validar invitaciÃ³n" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invitations/accept
 * Accept invitation and create user account
 */
export async function POST(request: NextRequest) {
  const ctx = logApiStart(request, "invitations_accept");
  const startedAt = Date.now();
  try {
    const body = await request.json();

    // Validate input
    const validation = acceptInvitationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos invÃ¡lidos",
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
        { success: false, error: "InvitaciÃ³n no encontrada" },
        { status: 404 }
      );
    }

    // Check if already accepted
    if (invitation.status === "ACCEPTED") {
      return NextResponse.json(
        { success: false, error: "Esta invitaciÃ³n ya fue aceptada" },
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
        { success: false, error: "Esta invitaciÃ³n ha expirado" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: { equals: invitation.email, mode: "insensitive" },
      },
    });

    if (existingUser && existingUser.tenantId !== invitation.tenantId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Este correo pertenece a una cuenta de otro instituto. Inicia sesiÃ³n con ese contexto o usa otro email.",
        },
        { status: 400 }
      );
    }

    if (existingUser) {
      if (!existingUser.password) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Tu cuenta no tiene contraseÃ±a (p. ej. acceso social). Inicia sesiÃ³n como siempre o restablece la contraseÃ±a y vuelve a abrir el enlace de invitaciÃ³n.",
          },
          { status: 400 }
        );
      }
      const passwordOk = await AuthService.verifyPassword(password, existingUser.password);
      if (!passwordOk) {
        return NextResponse.json(
          { success: false, error: "ContraseÃ±a incorrecta" },
          { status: 401 }
        );
      }
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

    const tenantSlug = invitation.tenant?.slug;
    const cohortIdOnInvite = invitation.academyCohortId ?? null;

    const firstLessonIdForTrial =
      inv.isTrialInvitation && tenantSlug === "kaledacademy"
        ? await courseService.getFirstLessonOfModule1(invitation.tenantId)
        : null;

    const accountWasNew = !existingUser;

    const result = await prisma.$transaction(async (tx) => {
      const user = existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: {
              name: name.trim() || existingUser.name || name,
              roleId: invitation.roleId,
              ...(platformRole ? { platformRole: platformRole as PlatformRole } : {}),
            },
            include: { role: true },
          })
        : await AuthService.createUser({
            email: invitation.email,
            name,
            password,
            roleId: invitation.roleId,
            tenantId: invitation.tenantId,
            ...(platformRole && { platformRole: platformRole as "ACADEMY_STUDENT" | "ACADEMY_TEACHER" | "ACADEMY_ADMIN" }),
          });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      if (inv.isTrialInvitation && tenantSlug === "kaledacademy") {
        const tenantId = invitation.tenantId;
        const trialExpiresAt = inv.trialExpiresAt ?? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

        if (!firstLessonIdForTrial) {
          throw new Error("No se encontrÃ³ la primera lecciÃ³n del MÃ³dulo 1 para el acceso de prueba");
        }

        if (cohortIdOnInvite) {
          await enrollStudentFromInvitation(tx, {
            tenantId,
            userId: user.id,
            cohortId: cohortIdOnInvite,
            isTrial: true,
            trialExpiresAt,
            trialAllowedLessonId: firstLessonIdForTrial,
            lessonsTotalSnapshot: 1,
          });
        } else {
          const trialCohortName = inv.trialCohortName ?? "Prueba";

          const course = await tx.academyCourse.findFirst({
            where: { tenantId, isActive: true },
          });
          if (!course) {
            throw new Error("No se encontrÃ³ el curso principal de Kaled Academy");
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

          await enrollStudentFromInvitation(tx, {
            tenantId,
            userId: user.id,
            cohortId: cohort.id,
            isTrial: true,
            trialExpiresAt,
            trialAllowedLessonId: firstLessonIdForTrial,
            lessonsTotalSnapshot: 1,
          });
        }
      } else if (
        tenantSlug === "kaledacademy" &&
        platformRole === "ACADEMY_STUDENT" &&
        cohortIdOnInvite
      ) {
        await enrollStudentFromInvitation(tx, {
          tenantId: invitation.tenantId,
          userId: user.id,
          cohortId: cohortIdOnInvite,
          isTrial: false,
          trialExpiresAt: null,
          trialAllowedLessonId: null,
          lessonsTotalSnapshot: 0,
        });
      }

      return user;
    });

    logApiSuccess(ctx, "invitations_accept", { duration: Date.now() - startedAt, resultId: result.id });
    return NextResponse.json({
      success: true,
      message: accountWasNew ? "Cuenta creada exitosamente" : "InvitaciÃ³n aplicada a tu cuenta",
      data: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role?.name || "Sin rol",
      },
    });
  } catch (error) {
    logApiError(ctx, "invitations_accept", { error });
    return NextResponse.json(
      { success: false, error: "Error al crear cuenta" },
      { status: 500 }
    );
  }
}
