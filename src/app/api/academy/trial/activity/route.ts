/**
 * GET /api/academy/trial/activity
 * Lista usuarios de prueba y su actividad (para asesores/admin)
 */

import { NextResponse } from "next/server";
import { withAcademyAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { ACADEMY_ROLES } from "@/modules/academy/config/roles";

export const GET = withAcademyAuth(
  ["ACADEMY_ADMIN", "ACADEMY_TEACHER"],
  async (_req, _user, tenantId) => {
    try {
      const [trialUsers, activities] = await Promise.all([
        prisma.user.findMany({
          where: {
            tenantId,
            academyEnrollments: {
              some: { isTrial: true, status: "ACTIVE" },
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
            academyEnrollments: {
              where: { isTrial: true },
              take: 1,
              select: {
                trialExpiresAt: true,
                trialAllowedLessonId: true,
              },
            },
          },
        }),
        prisma.trialUserActivity.findMany({
          where: { tenantId },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          trialUsers: trialUsers.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            trialExpiresAt: u.academyEnrollments[0]?.trialExpiresAt,
          })),
          activities: activities.map((a) => ({
            id: a.id,
            userId: a.userId,
            userName: a.user.name,
            userEmail: a.user.email,
            action: a.action,
            entityType: a.entityType,
            entityId: a.entityId,
            metadata: a.metadata,
            createdAt: a.createdAt,
          })),
        },
      });
    } catch (error) {
      console.error("Error fetching trial activity:", error);
      return NextResponse.json(
        { success: false, error: "Error al cargar actividad" },
        { status: 500 }
      );
    }
  }
);
