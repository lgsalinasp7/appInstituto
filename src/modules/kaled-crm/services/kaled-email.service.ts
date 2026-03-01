import { prisma } from '@/lib/prisma';
import { sendTemplateEmail } from '@/lib/email';
import type {
  CreateTemplateData,
  UpdateTemplateData,
  SendEmailData,
  RenderedTemplate,
} from '../types';

export class KaledEmailService {
  // ============================================
  // Template Management
  // ============================================

  /**
   * Crear una nueva plantilla de email
   */
  static async createTemplate(tenantId: string, data: CreateTemplateData) {
    return prisma.kaledEmailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        htmlContent: data.htmlContent,
        variables: data.variables || [],
        category: data.category || 'GENERAL',
        campaignId: data.campaignId,
        isLibraryTemplate: (data as any).isLibraryTemplate || false,
        phase: (data as any).phase || null,
        tenantId,
      },
      include: {
        campaign: true,
      },
    });
  }

  /**
   * Obtener todas las plantillas
   */
  static async getAllTemplates(tenantId: string) {
    return prisma.kaledEmailTemplate.findMany({
      where: { isActive: true, tenantId },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            emailLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener plantilla por ID
   */
  static async getTemplateById(id: string) {
    return prisma.kaledEmailTemplate.findUnique({
      where: { id },
      include: {
        campaign: true,
        emailLogs: {
          orderBy: { sentAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Actualizar plantilla
   */
  static async updateTemplate(id: string, data: UpdateTemplateData) {
    return prisma.kaledEmailTemplate.update({
      where: { id },
      data: {
        name: data.name,
        subject: data.subject,
        htmlContent: data.htmlContent,
        variables: data.variables,
        category: data.category,
        isActive: data.isActive,
      },
    });
  }

  /**
   * Eliminar plantilla
   */
  static async deleteTemplate(id: string) {
    // Verificar que no esté siendo usada en secuencias
    const usedInSequences = await prisma.kaledEmailSequenceStep.count({
      where: { templateId: id },
    });

    if (usedInSequences > 0) {
      throw new Error(
        `No se puede eliminar la plantilla porque está siendo usada en ${usedInSequences} secuencias. Primero elimina las secuencias.`
      );
    }

    return prisma.kaledEmailTemplate.delete({
      where: { id },
    });
  }

  /**
   * Renderizar plantilla con variables
   */
  static async renderTemplate(
    templateId: string,
    variables: Record<string, string>
  ): Promise<RenderedTemplate> {
    const template = await prisma.kaledEmailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Plantilla no encontrada');
    }

    let subject = template.subject;
    let htmlContent = template.htmlContent;

    // Reemplazar variables en el formato {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      htmlContent = htmlContent.replace(regex, value);
    });

    return {
      subject,
      htmlContent,
    };
  }

  // ============================================
  // Email Sending
  // ============================================

  /**
   * Enviar email automático (sin aprobación)
   */
  static async sendAutomaticEmail(leadId: string, templateId: string, tenantId?: string) {
    const lead = await prisma.kaledLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead no encontrado');
    }

    const variables = {
      nombre: lead.name,
      email: lead.email,
      telefono: lead.phone || 'No proporcionado',
    };

    const rendered = await this.renderTemplate(templateId, variables);

    // Crear log antes de enviar
    const emailLog = await prisma.kaledEmailLog.create({
      data: {
        to: lead.email,
        subject: rendered.subject,
        templateId: templateId,
        kaledLeadId: leadId,
        status: 'PENDING',
        requiresApproval: false,
        tenantId: tenantId || lead.tenantId || null,
      },
    });

    try {
      // Enviar email usando Resend
      const result = await sendTemplateEmail({
        to: lead.email,
        subject: rendered.subject,
        html: rendered.htmlContent,
      });

      // Actualizar log con resultado
      await prisma.kaledEmailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          resendId: result.id,
          metadata: { result },
        },
      });

      return emailLog;
    } catch (error: any) {
      // Marcar como fallido
      await prisma.kaledEmailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'FAILED',
          metadata: { error: error.message },
        },
      });

      throw error;
    }
  }

  /**
   * Crear email semi-automático (requiere aprobación)
   */
  static async createSemiAutomaticEmail(leadId: string, templateId: string, tenantId?: string) {
    const lead = await prisma.kaledLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead no encontrado');
    }

    const variables = {
      nombre: lead.name,
      email: lead.email,
      telefono: lead.phone || 'No proporcionado',
    };

    const rendered = await this.renderTemplate(templateId, variables);

    // Crear log pendiente de aprobación
    const emailLog = await prisma.kaledEmailLog.create({
      data: {
        to: lead.email,
        subject: rendered.subject,
        templateId: templateId,
        kaledLeadId: leadId,
        status: 'PENDING',
        requiresApproval: true,
        metadata: {
          htmlContent: rendered.htmlContent,
        },
        tenantId: tenantId || lead.tenantId || null,
      },
    });

    return emailLog;
  }

  /**
   * Aprobar y enviar email semi-automático
   */
  static async approveAndSendEmail(emailLogId: string, userId: string) {
    const emailLog = await prisma.kaledEmailLog.findUnique({
      where: { id: emailLogId },
    });

    if (!emailLog) {
      throw new Error('Email log no encontrado');
    }

    if (!emailLog.requiresApproval) {
      throw new Error('Este email no requiere aprobación');
    }

    if (emailLog.status !== 'PENDING') {
      throw new Error('Este email ya fue procesado');
    }

    try {
      // Enviar email
      const htmlContent = (emailLog.metadata as any)?.htmlContent as string;
      const result = await sendTemplateEmail({
        to: emailLog.to,
        subject: emailLog.subject,
        html: htmlContent,
      });

      // Actualizar log
      await prisma.kaledEmailLog.update({
        where: { id: emailLogId },
        data: {
          status: 'SENT',
          resendId: result.id,
          approvedBy: userId,
          approvedAt: new Date(),
          metadata: {
            ...(emailLog.metadata as any),
            result,
          },
        },
      });

      return emailLog;
    } catch (error: any) {
      // Marcar como fallido
      await prisma.kaledEmailLog.update({
        where: { id: emailLogId },
        data: {
          status: 'FAILED',
          metadata: {
            ...(emailLog.metadata as any),
            error: error.message,
          },
        },
      });

      throw error;
    }
  }

  /**
   * Enviar email manual (sin plantilla)
   */
  static async sendManualEmail(
    leadId: string,
    subject: string,
    htmlContent: string,
    tenantId?: string
  ) {
    const lead = await prisma.kaledLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead no encontrado');
    }

    // Crear log
    const emailLog = await prisma.kaledEmailLog.create({
      data: {
        to: lead.email,
        subject: subject,
        kaledLeadId: leadId,
        status: 'PENDING',
        requiresApproval: false,
        tenantId: tenantId || lead.tenantId || null,
      },
    });

    try {
      // Enviar email
      const result = await sendTemplateEmail({
        to: lead.email,
        subject: subject,
        html: htmlContent,
      });

      // Actualizar log
      await prisma.kaledEmailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          resendId: result.id,
          metadata: { result },
        },
      });

      return emailLog;
    } catch (error: any) {
      // Marcar como fallido
      await prisma.kaledEmailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'FAILED',
          metadata: { error: error.message },
        },
      });

      throw error;
    }
  }

  // ============================================
  // Email Log Management
  // ============================================

  /**
   * Obtener emails pendientes de aprobación
   */
  static async getPendingApprovals(tenantId: string) {
    return prisma.kaledEmailLog.findMany({
      where: {
        requiresApproval: true,
        status: 'PENDING',
        tenantId,
      },
      include: {
        template: true,
        kaledLead: true,
      },
      orderBy: { sentAt: 'asc' },
    });
  }

  /**
   * Obtener historial de emails de un lead
   */
  static async getLeadEmailHistory(leadId: string) {
    return prisma.kaledEmailLog.findMany({
      where: { kaledLeadId: leadId },
      include: {
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    });
  }

  /**
   * Obtener estadísticas de emails
   */
  static async getEmailStats(tenantId: string) {
    const [total, sent, failed, pending] = await Promise.all([
      prisma.kaledEmailLog.count({ where: { tenantId } }),
      prisma.kaledEmailLog.count({ where: { status: 'SENT', tenantId } }),
      prisma.kaledEmailLog.count({ where: { status: 'FAILED', tenantId } }),
      prisma.kaledEmailLog.count({ where: { status: 'PENDING', tenantId } }),
    ]);

    return {
      total,
      sent,
      failed,
      pending,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : 0,
    };
  }
}
