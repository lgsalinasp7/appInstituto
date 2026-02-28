/**
 * Process Kaled Emails Cron Job
 * Processes pending emails scheduled to be sent
 * Run every hour: 0 * * * *
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { KaledInteractionService } from '@/modules/kaled-crm/services/kaled-interaction.service';
import { sendTemplateEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    // Security: Verify cron secret (if using Vercel Cron)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('🔄 Starting Kaled email processing job...');

    // 1. Find pending/scheduled emails
    const pendingEmails = await prisma.kaledEmailLog.findMany({
      where: {
        status: { in: ['PENDING', 'SCHEDULED'] },
      },
      include: {
        template: true,
        kaledLead: true,
      },
      take: 50, // Process max 50 emails per run
    });

    console.log(`📧 Found ${pendingEmails.length} pending emails to process`);

    let sent = 0;
    let failed = 0;
    let pending = 0;

    const now = new Date();

    // 2. Process each email
    for (const emailLog of pendingEmails) {
      try {
        // Skip if requires approval (wait for manual approval)
        if (emailLog.requiresApproval) {
          pending++;
          console.log(
            `⏸️  Email ${emailLog.id} requires approval, skipping...`
          );
          continue;
        }

        const metadata = (emailLog.metadata as Record<string, unknown> | null) || {};
        const scheduledForRaw =
          typeof metadata.scheduledFor === 'string' ? metadata.scheduledFor : null;
        const scheduledFor = scheduledForRaw ? new Date(scheduledForRaw) : null;

        // Respect schedule time for deferred emails
        if (
          emailLog.status === 'SCHEDULED' &&
          scheduledFor &&
          !Number.isNaN(scheduledFor.getTime()) &&
          scheduledFor > now
        ) {
          continue;
        }

        // Send email
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

        // Update status to SENT
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

        // Create interaction in timeline when lead exists
        if (emailLog.kaledLeadId) {
          await KaledInteractionService.logEmail(
            emailLog.kaledLeadId,
            null, // System-triggered (no user)
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
        console.log(`✅ Email ${emailLog.id} sent successfully`);
      } catch (error) {
        console.error(`❌ Error sending email ${emailLog.id}:`, error);

        // Update status to FAILED
        await prisma.kaledEmailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'FAILED',
            metadata: {
              error:
                error instanceof Error ? error.message : 'Unknown error',
              failedAt: new Date().toISOString(),
            },
          },
        });

        failed++;
      }
    }

    const result = {
      success: true,
      data: {
        processed: pendingEmails.length,
        sent,
        failed,
        pending,
      },
      message: `Processed ${pendingEmails.length} emails: ${sent} sent, ${failed} failed, ${pending} pending approval`,
    };

    console.log(
      `✅ Kaled email processing completed: ${JSON.stringify(result.data)}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error in Kaled email cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Error processing emails',
      },
      { status: 500 }
    );
  }
}

// Allow POST as well (for manual triggering)
export const POST = GET;
