import { prisma } from '@/lib/prisma';
import { KaledCampaignStatus } from '@prisma/client';
import type {
  CreateCampaignData,
  UpdateCampaignData,
  CampaignMetrics,
  CampaignWithRelations,
} from '../types';

export class KaledCampaignService {
  /**
   * Crear una nueva campaña
   */
  static async createCampaign(data: CreateCampaignData) {
    return prisma.kaledCampaign.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        timeline: data.timeline as any,
        status: 'DRAFT',
      },
      include: {
        templates: true,
        sequences: true,
        leads: true,
      },
    });
  }

  /**
   * Obtener todas las campañas
   */
  static async getAllCampaigns(): Promise<CampaignWithRelations[]> {
    return prisma.kaledCampaign.findMany({
      include: {
        templates: {
          where: { isActive: true },
        },
        sequences: {
          where: { isActive: true },
        },
        _count: {
          select: {
            leads: true,
            templates: true,
            sequences: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as any;
  }

  /**
   * Obtener campaña por ID
   */
  static async getCampaignById(id: string): Promise<CampaignWithRelations | null> {
    return prisma.kaledCampaign.findUnique({
      where: { id },
      include: {
        templates: {
          orderBy: { createdAt: 'desc' },
        },
        sequences: {
          include: {
            steps: {
              include: {
                template: true,
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        leads: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            leads: true,
            templates: true,
            sequences: true,
          },
        },
      },
    }) as any;
  }

  /**
   * Actualizar campaña
   */
  static async updateCampaign(id: string, data: UpdateCampaignData) {
    return prisma.kaledCampaign.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        timeline: data.timeline as any,
        status: data.status,
        updatedAt: new Date(),
      },
      include: {
        templates: true,
        sequences: true,
        _count: {
          select: {
            leads: true,
            templates: true,
            sequences: true,
          },
        },
      },
    });
  }

  /**
   * Iniciar campaña (cambiar a ACTIVE)
   */
  static async startCampaign(id: string) {
    const campaign = await prisma.kaledCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new Error('Campaña no encontrada');
    }

    if (campaign.status === 'ACTIVE') {
      throw new Error('La campaña ya está activa');
    }

    return prisma.kaledCampaign.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        startDate: campaign.startDate || new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Pausar campaña
   */
  static async pauseCampaign(id: string) {
    return prisma.kaledCampaign.update({
      where: { id },
      data: {
        status: 'PAUSED',
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Completar campaña
   */
  static async completeCampaign(id: string) {
    return prisma.kaledCampaign.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endDate: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Archivar campaña
   */
  static async archiveCampaign(id: string) {
    return prisma.kaledCampaign.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Eliminar campaña
   */
  static async deleteCampaign(id: string) {
    // Verificar que no tenga leads asociados
    const leadsCount = await prisma.kaledLead.count({
      where: { campaignId: id },
    });

    if (leadsCount > 0) {
      throw new Error(
        `No se puede eliminar la campaña porque tiene ${leadsCount} leads asociados. Primero debes reasignar o eliminar los leads.`
      );
    }

    return prisma.kaledCampaign.delete({
      where: { id },
    });
  }

  /**
   * Obtener métricas de la campaña
   */
  static async getCampaignMetrics(id: string): Promise<CampaignMetrics> {
    const campaign = await prisma.kaledCampaign.findUnique({
      where: { id },
      include: {
        leads: {
          where: { deletedAt: null },
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaña no encontrada');
    }

    const leads = campaign.leads;

    // Contadores por estado
    const newLeads = leads.filter((l) => l.status === 'NUEVO').length;
    const contactedLeads = leads.filter((l) => l.status === 'CONTACTADO').length;
    const convertedLeads = leads.filter((l) => l.status === 'CONVERTIDO').length;
    const lostLeads = leads.filter((l) => l.status === 'PERDIDO').length;

    // Tasa de conversión
    const conversionRate = leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0;

    // Tiempo promedio de conversión (solo para convertidos)
    const convertedLeadsData = leads.filter((l) => l.status === 'CONVERTIDO');
    let averageTimeToConversion = 0;

    if (convertedLeadsData.length > 0) {
      const times = convertedLeadsData.map((l) => {
        return (l.updatedAt.getTime() - l.createdAt.getTime()) / (1000 * 60 * 60 * 24); // días
      });
      averageTimeToConversion =
        times.reduce((acc, time) => acc + time, 0) / times.length;
    }

    // Métricas de email
    const emailLogs = await prisma.kaledEmailLog.findMany({
      where: {
        kaledLeadId: { in: leads.map((l) => l.id) },
      },
    });

    const emailsSent = emailLogs.filter((e) => e.status === 'SENT').length;
    const emailsOpened = 0; // TODO: Implementar tracking de aperturas
    const emailOpenRate = emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0;

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      totalLeads: leads.length,
      newLeads,
      contactedLeads,
      convertedLeads,
      lostLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageTimeToConversion: Math.round(averageTimeToConversion * 100) / 100,
      emailsSent,
      emailsOpened,
      emailOpenRate: Math.round(emailOpenRate * 100) / 100,
      startDate: campaign.startDate || undefined,
      endDate: campaign.endDate || undefined,
    };
  }

  /**
   * Obtener campañas activas
   */
  static async getActiveCampaigns() {
    return prisma.kaledCampaign.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        _count: {
          select: {
            leads: true,
            templates: true,
            sequences: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Asignar lead a campaña
   */
  static async assignLeadToCampaign(leadId: string, campaignId: string) {
    return prisma.kaledLead.update({
      where: { id: leadId },
      data: { campaignId },
    });
  }

  /**
   * Remover lead de campaña
   */
  static async removeLeadFromCampaign(leadId: string) {
    return prisma.kaledLead.update({
      where: { id: leadId },
      data: { campaignId: null },
    });
  }

  /**
   * Duplicar campaña
   */
  static async duplicateCampaign(id: string, newName: string) {
    const original = await prisma.kaledCampaign.findUnique({
      where: { id },
      include: {
        templates: true,
        sequences: {
          include: {
            steps: true,
          },
        },
      },
    });

    if (!original) {
      throw new Error('Campaña no encontrada');
    }

    // Crear la nueva campaña
    const newCampaign = await prisma.kaledCampaign.create({
      data: {
        name: newName,
        description: original.description,
        timeline: original.timeline ?? undefined,
        status: 'DRAFT',
      },
    });

    // Duplicar templates
    for (const template of original.templates) {
      await prisma.kaledEmailTemplate.create({
        data: {
          name: `${template.name} (copia)`,
          subject: template.subject,
          htmlContent: template.htmlContent,
          variables: template.variables,
          category: template.category,
          campaignId: newCampaign.id,
        },
      });
    }

    // Duplicar sequences
    for (const sequence of original.sequences) {
      const newSequence = await prisma.kaledEmailSequence.create({
        data: {
          name: `${sequence.name} (copia)`,
          triggerType: sequence.triggerType,
          triggerConfig: sequence.triggerConfig || {},
          campaignId: newCampaign.id,
        },
      });

      // Duplicar steps
      for (const step of sequence.steps) {
        await prisma.kaledEmailSequenceStep.create({
          data: {
            sequenceId: newSequence.id,
            templateId: step.templateId,
            orderIndex: step.orderIndex,
            delayHours: step.delayHours,
            conditions: step.conditions ?? undefined,
          },
        });
      }
    }

    return newCampaign;
  }
}
