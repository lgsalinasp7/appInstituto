/**
 * API Route: POST /api/admin/tenants/[id]/invitations
 * Permite a SUPER_ADMIN crear invitaciones para un tenant (ej. Kaled Academy) sin estar en el contexto del tenant.
 * El [id] puede ser un id (cuid) o slug (ej. kaledacademy).
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { addDays } from "date-fns";
import { sendInvitationEmail } from "@/lib/email";
import { z } from "zod";
import { withCSRF, withPlatformAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/errors";

const bodySchema = z.object({
  email: z.string().email("Email inválido"),
  academyRole: z.enum(["ACADEMY_STUDENT", "ACADEMY_TEACHER", "ACADEMY_ADMIN"]),
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
          { success: false, error: "Datos inválidos", details: validation.error.format() },
          { status: 400 }
        );
      }
      const { email, academyRole } = validation.data;

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
          where: { email, status: "PENDING" },
        }),
        prisma.user.findUnique({
          where: { email },
        }),
        prisma.role.findMany({
          where: { tenantId: tenant.id },
          select: { id: true, name: true },
        }),
      ]);

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

      const adminRole = roles.find((r) => r.name.toUpperCase() === "ADMINISTRADOR");
      const userRole = roles.find((r) => r.name.toUpperCase() === "USUARIO");
      const roleId =
        academyRole === "ACADEMY_ADMIN" && adminRole
          ? adminRole.id
          : (userRole || adminRole || roles[0])?.id;
      if (!roleId) {
        return NextResponse.json(
          { success: false, error: "No se encontró un rol válido en el tenant" },
          { status: 500 }
        );
      }

      const token = randomUUID();
      const invitation = await prisma.invitation.create({
        data: {
          email,
          roleId,
          inviterId: user.id,
          tenantId: tenant.id,
          token,
          expiresAt: addDays(new Date(), 7),
          status: "PENDING",
          academyRole,
        },
        include: {
          role: { select: { name: true } },
        },
      });

      await sendInvitationEmail({
        to: email,
        token,
        roleName: invitation.role.name,
        inviterName: user.name || user.email,
        tenantSlug: tenant.slug,
      });

      return NextResponse.json({
        success: true,
        data: { id: invitation.id, email: invitation.email, academyRole: invitation.academyRole },
        message: "Invitación enviada exitosamente",
      });
    } catch (error) {
      return handleApiError(error);
    }
  })
);
