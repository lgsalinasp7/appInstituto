/**
 * Process Kaled Emails Cron Job
 * Processes pending emails scheduled to be sent
 * Run every hour: 0 * * * *
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { KaledInteractionService } from '@/modules/kaled-crm/services/kaled-interaction.service';
import { sendTemplateEmail } from '@/lib/email';
import { withCronAuth } from '@/lib/cron-auth';
import { logApiOperation } from '@/lib/api-logger';

export const GET = withCronAuth('cron.process-kaled-emails', async (_request, ctx) => {
  logApiOperation(ctx, 'cron.process-kaled-emails', 'Starting Kaled email processing job');

  // 1. Find pending/scheduled emails
  const pendingEmails = await prisma.kaledEmailLog.findMany({
    where: {
      status: { in: ['PENDING', 'SCHEDULED'] },
    },
    include: {
      template: true,
      kaledLead: true,
    },
    take: 50,
  });

  logApiOperation(ctx, 'cron.process-kaled-emails', `Found ${pendingEmails.length} pending emails to process`, {
    pendingCount: pendingEmails.length,
  });

  let sent = 0;
  let failed = 0;
  let pending = 0;

  const now = new Date();

  for (const emailLog of pendingEmails) {
    try {
      // Skip if requires approval
      if (emailLog.requiresApproval) {
        pending++;
        continue;
      }

      const metadata = (emailLog.metadata as Record<string, unknown> | null) || {};
      const scheduledForRaw =
        typeof metadata.scheduledFor === 'string' ? metadata.scheduledFor : null;
      const scheduledFor = scheduledForRaw ? new Date(scheduledForRaw) : null;

      // Never send SCHEDULED emails without a valid schedule timestamp.
      if (
        emailLog.status === 'SCHEDULED' &&
        (!scheduledFor || Number.isNaN(scheduledFor.getTime()))
      ) {
        pending++;
        continue;
      }

      // Respect schedule time for deferred emails
      if (
        emailLog.status === 'SCHEDULED' &&
        scheduledFor &&
        !Number.isNaN(scheduledFor.getTime()) &&
        scheduledFor > now
      ) {
        pending++;
        continue;
      }

      if (!emailLog.template) {
        throw new Error('Template not found');
      }

      const htmlContent =
        typeof metadata.htmlContent === 'string' && metadata.htmlContent.trim().length > 0
          ? metadata.htmlContent
          : emailLog.template.htmlContent;

      const result = await sendTemplateEmail({
        to: emailLog.to,
        subject: emailLog.subject,
        html: htmlContent,
      });

      await prisma.kaledEmailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          resendId: result.id,
          sentAt: new Date(),
          metadata: {
            ...metadata,
            processedByCron: true,
            processedAt: new Date().toISOString(),
          },
        },
      });

      if (emailLog.kaledLeadId) {
        await KaledInteractionService.logEmail(
          emailLog.kaledLeadId,
          null,
          emailLog.id
        );

        await prisma.kaledLead.update({
          where: { id: emailLog.kaledLeadId },
          data: {
            lastEmailSentAt: new Date(),
            lastEmailTemplateId: emailLog.templateId || null,
          },
        });
      }

      sent++;
    } catch (error) {
      logApiOperation(ctx, 'cron.process-kaled-emails', `Error sending email ${emailLog.id}`, {
        emailId: emailLog.id,
        error: error instanceof Error ? error.message : String(error),
      });

      await prisma.kaledEmailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'FAILED',
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
            failedAt: new Date().toISOString(),
          },
        },
      });

      failed++;
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      processed: pendingEmails.length,
      sent,
      failed,
      pending,
    },
    message: `Processed ${pendingEmails.length} emails: ${sent} sent, ${failed} failed, ${pending} pending/skipped`,
  });
});

// Allow POST as well (for manual triggering)
export const POST = GET;
