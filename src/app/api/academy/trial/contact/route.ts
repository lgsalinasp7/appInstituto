/**
 * POST /api/academy/trial/contact
 * Registra CLICK_CONTACT y notifica al asesor
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { logTrialActivity, notifyAdvisorOnContactClick, TRIAL_ACTIONS } from "@/lib/trial-activity";
import { prisma } from "@/lib/prisma";
import { logApiStart, logApiSuccess, logApiError } from "@/lib/api-logger";

export async function POST(request: NextRequest) {
  const ctx = logApiStart(request, "academy_trial_contact");
  const startedAt = Date.now();
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        tenantId: true,
        academyEnrollments: {
          where: { isTrial: true, status: "ACTIVE" },
          take: 1,
          select: { id: true },
        },
      },
    });

    if (!dbUser?.tenantId) {
      return NextResponse.json({ success: false, error: "Usuario sin tenant" }, { status: 400 });
    }

    const hasTrialEnrollment = dbUser.academyEnrollments?.length;
    if (!hasTrialEnrollment) {
      return NextResponse.json(
        { success: false, error: "Solo usuarios de prueba pueden registrar esta acción" },
        { status: 403 }
      );
    }

    const tenantId = dbUser.tenantId;

    await logTrialActivity(
      dbUser.id,
      tenantId,
      TRIAL_ACTIONS.CLICK_CONTACT,
      "banner",
      undefined,
      { source: "TrialBanner" }
    );

    await notifyAdvisorOnContactClick(
      dbUser.id,
      tenantId,
      dbUser.email,
      dbUser.name
    );

    logApiSuccess(ctx, "academy_trial_contact", {
      duration: Date.now() - startedAt,
      resultId: dbUser.id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError(ctx, "academy_trial_contact", { error });
    return NextResponse.json(
      { success: false, error: "Error al registrar" },
      { status: 500 }
    );
  }
}
