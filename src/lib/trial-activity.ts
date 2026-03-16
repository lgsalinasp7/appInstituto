/**
 * Trial User Activity - Log y notificación al asesor
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTemplateEmail } from "@/lib/email";

export const TRIAL_ACTIONS = {
  PAGE_VIEW: "PAGE_VIEW",
  DASHBOARD_VIEW: "DASHBOARD_VIEW",
  LESSON_VIEW: "LESSON_VIEW",
  CLICK_CONTACT: "CLICK_CONTACT",
} as const;

export type TrialAction = (typeof TRIAL_ACTIONS)[keyof typeof TRIAL_ACTIONS];

export async function logTrialActivity(
  userId: string,
  tenantId: string,
  action: TrialAction,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  await prisma.trialUserActivity.create({
    data: {
      userId,
      tenantId,
      action,
      entityType: entityType ?? null,
      entityId: entityId ?? null,
      metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function notifyAdvisorOnContactClick(
  userId: string,
  tenantId: string,
  userEmail: string,
  userName?: string | null
) {
  const advisorEmail = process.env.TRIAL_ADVISOR_EMAIL;
  if (!advisorEmail) {
    console.warn("TRIAL_ADVISOR_EMAIL no configurada. No se enviará notificación al asesor.");
    return;
  }

  const displayName = userName || userEmail;
  await sendTemplateEmail({
    to: advisorEmail,
    subject: `[Kaled Academy] Usuario de prueba hizo clic en Contáctanos: ${displayName}`,
    html: `
      <p>Un usuario con acceso de prueba ha hecho clic en "Contáctanos para comprar".</p>
      <p><strong>Usuario:</strong> ${displayName}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString("es-CO")}</p>
      <p>Revisa el panel de actividad de usuarios de prueba para más detalles.</p>
    `,
  });
}
