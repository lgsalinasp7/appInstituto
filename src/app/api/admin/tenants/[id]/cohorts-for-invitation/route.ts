/**
 * Lista cohortes activos de un tenant Academia (super admin, sin contexto de subdominio).
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withPlatformAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/errors";

export const GET = withPlatformAdmin(
  ["SUPER_ADMIN"],
  async (_request: NextRequest, _user, context) => {
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

      const cohorts = await prisma.academyCohort.findMany({
        where: { tenantId: tenant.id, status: "ACTIVE" },
        orderBy: [{ startDate: "desc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          kind: true,
          courseId: true,
          course: { select: { title: true } },
        },
      });

      return NextResponse.json({
        success: true,
        data: cohorts.map((c) => ({
          id: c.id,
          name: c.name,
          kind: c.kind,
          courseId: c.courseId,
          courseTitle: c.course.title,
        })),
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
